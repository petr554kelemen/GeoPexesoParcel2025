// 13/5/2025 19:13
window.DEBUG_MODE = false;

import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';
import Napoveda from './UI/napoveda.js'; // Uprav cestu podle tvé struktury
import ChlapikAnimace from '../objects/ChlapikAnimace.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.bedna = null;
        this.posBednaY = 0;
        this.chlapik = null;
        this.posChlapikY = 0;
        this.cursors = null;
        this.rychlostChlapikaText = null;
        this.rychlostBednyText = null;
        this.vychoziTreniBedny = 0;
        this.zneviditelnovaniBezi = false;
        this.zviditelnovaniBezi = false;
        this.hraDokoncena = false;
        this.teleportaceBezi = false; // Nezapomeň inicializovat tuto proměnnou
        this.napoveda = null;
        this.souradniceFake = "N 50°00.000 E 017°00.000";
        this.souradniceFinal = "N 50°05.111 E 017°20.111";
    }

    init(){
        this.posBednaY = this.scale.canvas.height / 2 * 1.23; //zakladni pozice y bedny
        this.posChlapikY = this.scale.canvas.height / 2 * 1.23 - 25; //zakladni pozice y chlapika

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        this.vychoziTreniBedny = 32;

        this.zacniAnimaciTlaceni = false; // Inicializace příznaku

        // background
        const background = this.add.image(500, 390, "backgroundGame");
        background.scaleX = 0.8784867183713885;
        background.scaleY = 0.9624751673844308;
    }
    
    preload() {
        // zatím nepřesunuto do boot.js
        this.load.atlas('chlapik_animace', 'assets/animace/clovicek-stoji-jde-tlaci.png', 'assets/animace/clovicek-stoji-jde-tlaci.json');
    }

    create() {

        this.chlapikAnimace = new ChlapikAnimace(this, 50, this.posChlapikY, 'stoji'); // Upravená inicializace
        this.chlapik = this.chlapikAnimace.sprite; // Získání spritu až po vytvoření ChlapikAnimace

        this.chlapik.body.setCollideWorldBounds(true); // Fyzikální metoda se volá na .body
        this.chlapik.body.setBounce(0.2);
        this.chlapik.body.setMass(8);
        this.chlapik.body.setDrag(0.15, 0);
        this.chlapik.body.setGravityY(0); // Pokud chceš gravitaci y nastav > 0

        // Vlastnosti spritu se volají přímo na 'this.chlapik'
        this.chlapik.body.setSize(53, 118);
        this.chlapik.body.offset.x = 10;
        this.chlapik.body.offset.y = 2;
        this.chlapik.body.setMaxSpeed(120);
        this.chlapik.body.setAcceleration(10, 0);

        this.bedna = this.physics.add.sprite(this.chlapik.body.x + 80, this.posBednaY, 'pictureBedna');
        this.bedna.setScale(0.6);
        this.bedna.body.setCollideWorldBounds(true);
        this.bedna.body.setBounce(0.15);
        this.bedna.body.setMass(5);
        this.bedna.body.setDrag(this.vychoziTreniBedny);
        this.bedna.body.setSize(96, 96);

        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);

        this.cursors = this.input.keyboard.createCursorKeys(); // reagovat na kurzory

        // cilova zona DATA
        const xStredZony = this.scale.width / 2;
        const yStredZony = this.bedna.body.center.y;

        const vyskaChlapika = 120; // Předpokládaná výška postavy
        const mezeraNadChlapikem = 30; // Zvětšil jsem mezeru pro jistotu

        /**
         * @property {*} xStred  - vypocitany stred horizontalne
         * @property {*} yStred  - vypocitay stred vertikalne
         * @property {*} blurFx  - pouzit filtr rozmazání;
         */
        this.cilovaZonaData = {
            xStred: xStredZony,
            yStred: yStredZony,
            cervenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.15), // cervena zona
            zelenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 45, 45, 0x00ff00).setOrigin(0.5).setAlpha(0.4), // zelena zona
            souradniceText: this.add.text(xStredZony, 30 + vyskaChlapika / 2 + mezeraNadChlapikem, this.souradniceFake, {
                font: '48px Georgia',
                align: 'center',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 2,
                    fill: true
                }
            }).setOrigin(0.5).setVisible(false),
            blurFx: null,
            prekryvaCervenou: false,
            prekryvaZelenou: false
        };
        // Nastav aby chlapik a bedna zustali v nejvyssi vrstve
        const nejvyssiHloubka = 100;
        this.chlapik.setDepth(nejvyssiHloubka);
        this.bedna.setDepth(nejvyssiHloubka - 1);

        //this.teleportujObjekty();

        const buttonSize = 50; // Zvětšíme trochu velikost pro lepší dotyk
        const buttonAlpha = 1;
        const buttonY = this.cameras.main.height - buttonSize / 2 - 40; // Umístíme je níže

        // Tlačítko doleva (levá strana dolní části obrazovky)
        this.buttonLeft = this.add.rectangle(buttonSize / 2 + 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonLeft.on('pointerdown', () => this.cursors.left.isDown = true, this);
        this.buttonLeft.on('pointerup', () => this.cursors.left.isDown = false, this);
        this.buttonLeft.on('pointerout', () => this.cursors.left.isDown = false, this);

        // Tlačítko doprava (pravá strana dolní části obrazovky)
        this.buttonRight = this.add.rectangle(this.cameras.main.width - buttonSize / 2 - 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonRight.on('pointerdown', () => this.cursors.right.isDown = true);
        this.buttonRight.on('pointerup', () => this.cursors.right.isDown = false);
        this.buttonRight.on('pointerout', () => this.cursors.right.isDown = false);

        /* 
         * Zajistíme, aby tlačítka zůstala na svém místě
         */

        this.buttonLeft.setScrollFactor(0);
        this.buttonRight.setScrollFactor(0);

        this.startTime = 0;
        this.runningTime = 0;
        this.stopkyText = this.add.text(this.cameras.main.width - 20, 20, "0:00:00", {
            font: '24px Arial',
            fill: '#fff',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0); // Umístění v pravém horním rohu a fixní na obrazovce

        this.stopkyBezi = false; // Příznak, zda stopky běží

        this.napoveda = new Napoveda(this, this.cilovaZonaData.zelenaZonaObjekt); // Používáme odkaz z objektu

    }

    zneviditelniObjekty(callback) {
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 0,
            duration: 300,
            onComplete: callback,
            callbackScope: this
        });
    }

    /**
     * Po dosazeni okrajů obrazovku presune objekty na uvodni pozici
     */
    teleportujObjekty() {
        //const vertikalniPosun = this.bedna.body.center.y;
        const konstantniVzdalenost = 80; // Nastav si požadovanou konstantní vzdálenost mezi nimi

        if (window.DEBUG_MODE) console.log('Vertikalni pos chlapika: ', this.posChlapikY);

        if (this.bedna.body.right > this.scale.width - 350) { // Bedna u pravého okraje
            // Bedna blíže ke středu levé třetiny
            const novaBednaX = this.scale.width / 6;
            // Chlapík ještě více vlevo
            const novaChlapikX = novaBednaX - konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, this.posChlapikY);
            this.bedna.setPosition(novaBednaX, this.posBednaY);
        } else if (this.bedna.body.left < 5) { // Bedna u levého okraje
            // Bedna blíže ke středu pravé třetiny
            const novaBednaX = this.scale.width * 5 / 6;
            // Chlapík ještě více vpravo
            const novaChlapikX = novaBednaX + konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, this.posChlapikY);
            this.bedna.setPosition(novaBednaX, this.posBednaY);
        }
    }

    /**
     * Metoda pro obnoveni objektu na scene po teleportaci
     * @param {*} callback 
     */
    zviditelniObjekty(callback) {
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 1,
            duration: 300,
            onComplete: callback,
            callbackScope: this
        });
    }

    /**
     * Metoda pro vyhodnoceni v cilove zone
     */
    vyhodnotCilovouZonu() {
        const bednaStredX = this.bedna.body.center.x;
        const bednaStredY = this.bedna.body.center.y;
        
        const rychlostBednyX = Math.abs(this.bedna.body.velocity.x);
        const rychlostBednyY = Math.abs(this.bedna.body.velocity.y);
        const maximalniRychlostProDokonceni = 10;
        const txtCervena = this.souradniceFake;
        const txtZelena = this.souradniceFinal;

        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const jeBednaStredVZeleneZone = Phaser.Geom.Rectangle.Contains(zelenaZonaBounds, bednaStredX, bednaStredY);
        const jeBednaPomala = rychlostBednyX < maximalniRychlostProDokonceni;

        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds();
        const jeBednaStredVCerveneZone = Phaser.Geom.Rectangle.Contains(cervenaZonaBounds, bednaStredX, bednaStredY);

        if (jeBednaStredVZeleneZone) {
            this.cilovaZonaData.souradniceText.setText(txtZelena).setStyle({ fill: '#00ff00', fontStyle: '', shadowBlur: 0 }).setVisible(true);
            if (jeBednaPomala && !this.hraDokoncena) {
                if (window.DEBUG_MODE) console.log('Hra dokončena (střed bedny v zóně a bedna je pomalá)!');
                this.hraDokoncena = true;
                this.bedna.body.velocity.x = 0;
                this.bedna.body.setImmovable();
                if (this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                    this.cilovaZonaData.souradniceText.preFX.clear();
                    this.cilovaZonaData.blurFx = null;
                }
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            } else if (!this.cilovaZonaData.prekryvaZelenou) {
                if (window.DEBUG_MODE) console.log("Bedna vstoupila do zelené zóny!");
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            }
        } else if (jeBednaStredVCerveneZone) {
            this.cilovaZonaData.souradniceText.setText(txtCervena).setStyle({ fill: '#ff0000', fontStyle: '', shadowBlur: 2 }).setVisible(true);
            if (!this.cilovaZonaData.prekryvaCervenou) {
                if (window.DEBUG_MODE) console.log("Střed bedny vstoupil do červené zóny!");
                if (!this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                    this.cilovaZonaData.blurFx = this.cilovaZonaData.souradniceText.preFX.addBlur();
                    this.tweens.add({ targets: this.cilovaZonaData.blurFx, strength: 1.5, duration: 1000, yoyo: true, repeat: -1 });
                }
                this.cilovaZonaData.prekryvaCervenou = true;
                this.cilovaZonaData.prekryvaZelenou = false;
            }
        } else {
            this.cilovaZonaData.souradniceText.setVisible(false);
            this.cilovaZonaData.prekryvaCervenou = false;
            this.cilovaZonaData.prekryvaZelenou = false;
            if (this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                this.cilovaZonaData.souradniceText.preFX.clear();
                this.cilovaZonaData.blurFx = null;
            }
        }
    }

    update(time, _delta) {

        const doleva = this.cursors.left.isDown;
        const doprava = this.cursors.right.isDown;
        const rychlostPohybu = 90;

        // Nastavení rychlosti chlapíka na základě stisku kláves
        if (doleva) {
            this.chlapik.body.velocity.x = -rychlostPohybu;
            this.chlapikAnimace.setFlipX(true); // Zrcadlíme doleva
        } else if (doprava) {
            this.chlapik.body.velocity.x = rychlostPohybu;
            this.chlapikAnimace.setFlipX(false); // Nezrcadlíme doprava
        } else {
            this.chlapik.body.velocity.x = 0;
        }

        // Logika pro přehrávání animací
        // Navržena AI

        const overlapX = Phaser.Physics.Arcade.GetOverlapX(this.chlapik.body, this.bedna.body, true);
        const jeVKoliziSBednou = overlapX > -10 && overlapX < 10;
        const jeVpohybu = Math.abs(this.chlapik.body.velocity.x) > 5; // Prahová hodnota pro pohyb
        const jdeDolevaKBedne = doleva && this.chlapik.body.x < this.bedna.body.x;
        const jdeDopravaKBedne = doprava && this.chlapik.body.x > this.bedna.body.x;
        const jdeSmeremKBedne = jdeDolevaKBedne || jdeDopravaKBedne;
        const jeVRozmeziTlaceni = (overlapX > 1 && overlapX < 30) || (overlapX < -1 && overlapX > -30);

        if (window.DEBUG_MODE) console.log('jeVRozmeziTlaceni: ', jeVRozmeziTlaceni, 'Hodnota ', overlapX);

        var stavAnimace = 'stoji';

        if (jeVpohybu && !jeVKoliziSBednou) {
            stavAnimace = 'jde';
        } else if (jdeSmeremKBedne && jeVKoliziSBednou) {
            stavAnimace = 'tlaci';
        } else if (!jeVpohybu && (jeVKoliziSBednou || jeVRozmeziTlaceni)) {
            stavAnimace = 'stoji'; // Nebo jiná animace pro stání u bedny
        }

        switch (stavAnimace) {
            case 'stoji':
                this.chlapikAnimace.play('stoji', true);
                break;
            case 'jde':
                this.chlapikAnimace.play('jde', true);
                break;
            case 'tlaci':
                this.chlapikAnimace.play('tlaci', true);
                break;
        }

        // Kód pro teleportaci a vyhodnocení cílové zóny
        const bednaUOkrajeVlevo = this.bedna.body.left < 5;
        const bednaUOkrajeVpravo = this.bedna.body.right > this.scale.width - 5;
        const bednaUOkrajeNahore = this.bedna.body.top < 5;
        const bednaUOkrajeDole = this.bedna.body.bottom > this.scale.height - 5;

        if ((bednaUOkrajeVlevo) || (bednaUOkrajeVpravo) || (bednaUOkrajeNahore) || (bednaUOkrajeDole)) {
            if (!this.teleportaceBezi) {
                this.teleportaceBezi = true;
                this.zneviditelniObjekty(() => {
                    this.teleportujObjekty();
                    //console.log('nové x body.center chlapíka: ', this.chlapik.body.center.x);
                    //console.log('nové x body.center bedny: ', this.bedna.body.center.x);
                    this.zviditelniObjekty(() => {
                        this.teleportaceBezi = false;
                    });
                });
            }
        } else {
            this.teleportaceBezi = false;
            this.bedna.alpha = 1;
            this.chlapik.alpha = 1;
        }

        //const bednaBounds = this.bedna.getBounds();
        //const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        //const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds();

        this.vyhodnotCilovouZonu();

        this.updateStopky(time);
    }

    updateStopky(time) {
        if (!this.hraDokoncena) { // Přidali jsme tuto podmínku
            if (!this.stopkyBezi) {
                this.startTime = time;
                this.stopkyBezi = true;
            }

            if (this.stopkyBezi) {
                this.runningTime = time - this.startTime;
                const minutes = Math.floor(this.runningTime / 60000).toString().padStart(2, '0');
                const seconds = Math.floor((this.runningTime % 60000) / 1000).toString().padStart(2, '0');
                const milliseconds = Math.floor((this.runningTime % 1000) / 10).toString().padStart(2, '0');
                this.stopkyText.setText(`${minutes}:${seconds}:${milliseconds}`);
            }
        } else {

            if (window.DEBUG_MODE) console.log('Prázdna sekce pro stopky nebeží');
        }
    }

    muzeKolizovat(_chlapik, _bedna) {
        return true; // Pro teleportaci necháme kolize vždy povolené

    }
}