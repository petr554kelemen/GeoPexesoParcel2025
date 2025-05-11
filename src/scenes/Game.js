// 1/5/2025 17:38
window.DEBUG_MODE = true;

import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';
import Napoveda from './UI/napoveda.js'; // Uprav cestu podle tvé struktury
import ChlapikAnimace from '../objects/ChlapikAnimace.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.bedna = null;
        this.chlapik = null;
        this.cursors = null;
        this.rychlostChlapikaText = null;
        this.rychlostBednyText = null;
        this.vychoziTreniBedny = 38;
        this.zneviditelnovaniBezi = false;
        this.zviditelnovaniBezi = false;
        this.hraDokoncena = false;
        this.teleportaceBezi = false; // Nezapomeň inicializovat tuto proměnnou
        this.napoveda = null;

        //this.vertikalniPosun = 0; //Pokud selže výpočet podle body.bedna
    }

    preload() {
        // přesunuto do boot.js
        //this.load.image("pictureChlapik", "assets/3d-arrow-left.png");
        //this.load.image("pictureBedna", "assets/3d-arrow-right.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        const objPositionY = this.scale.canvas.height / 2 * 1.21;

        //ladící proměnná
        this.zacniAnimaciTlaceni = false; // Inicializace příznaku

        //this.chlapikAnimace = new ChlapikAnimace(this, 50, objPositionY, 'pictureChlapik'); // Upravená inicializace
        //this.chlapik = this.chlapikAnimace.sprite; // Získání spritu až po vytvoření ChlapikAnimace
        //this.chlapik = this.add.sprite(0,0,"pictureChlapik");

        // Přidáme sprite do fyzikálního světa a získáme jeho fyzikální tělo
        //this.physics.add.existing(this.chlapik);
        this.chlapik = this.physics.add.sprite(50, objPositionY, "pictureChlapik");
        this.chlapik.body.setCollideWorldBounds(true); // Fyzikální metoda se volá na .body
        this.chlapik.body.setBounce(0.2);
        this.chlapik.body.setMass(5);
        this.chlapik.body.setDrag(0.1);
        this.chlapik.body.setGravityY(0); // Pokud chceš gravitaci

        // Vlastnosti spritu se volají přímo na 'this.chlapik'
        this.chlapik.setScale(1);
        this.chlapik.body.setSize(32, 64);
        this.chlapik.body.offset.x = 15;
        this.chlapik.body.offset.y = 0;

        // background
        const background = this.add.image(500, 390, "backgroundGame");
        //background.blendMode = Phaser.BlendModes.SOURCE_OUT;
        background.scaleX = 0.8784867183713885;
        background.scaleY = 0.9624751673844308;
        background.alpha = 0.98;
        background.alphaTopLeft = 0.8;
        background.alphaTopRight = 0.8;
        background.alphaBottomLeft = 0.8;
        background.alphaBottomRight = 0.8;

        this.bedna = this.physics.add.sprite(this.chlapik.x + 60, objPositionY, 'pictureBedna');
        this.bedna.setScale(0.8);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.setBounce(0.15);
        this.bedna.setMass(7);
        this.bedna.setDrag(this.vychoziTreniBedny);
        this.bedna.body.setSize(32, 32);

        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);

        this.cursors = this.input.keyboard.createCursorKeys(); // reagovat na kurzory

        // cilova zona DATA
        const xStredZony = this.scale.width / 2;
        const yStredZony = this.bedna.body.center.y;

        const vyskaChlapika = 120; // Předpokládaná výška postavy
        const mezeraNadChlapikem = 30; // Zvětšil jsem mezeru pro jistotu

        this.cilovaZonaData = {
            xStred: xStredZony,
            yStred: yStredZony,
            cervenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.15), // cervena zona
            zelenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 40, 40, 0x00ff00).setOrigin(0.5).setAlpha(0.5), // zelena zona
            souradniceText: this.add.text(xStredZony, 30 + vyskaChlapika / 2 + mezeraNadChlapikem, "N 50°00.000 E 017°00.000", {
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

        const nejvyssiHloubka = 1000;
        this.chlapik.setDepth(nejvyssiHloubka);
        this.bedna.setDepth(nejvyssiHloubka);

        //this.rychlostChlapikaText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff' });
        //this.rychlostBednyText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff' });

        this.teleportujObjekty();

        const buttonSize = 50; // Zvětšíme trochu velikost pro lepší dotyk
        const buttonAlpha = 1;
        const buttonY = this.cameras.main.height - buttonSize / 2 - 40; // Umístíme je níže

        // Tlačítko doleva (levá strana dolní části obrazovky)
        this.buttonLeft = this.add.rectangle(buttonSize / 2 + 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonLeft.on('pointerdown', () => this.cursors.left.isDown = true);
        this.buttonLeft.on('pointerup', () => this.cursors.left.isDown = false);
        this.buttonLeft.on('pointerout', () => this.cursors.left.isDown = false);

        // Tlačítko doprava (pravá strana dolní části obrazovky)
        this.buttonRight = this.add.rectangle(this.cameras.main.width - buttonSize / 2 - 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonRight.on('pointerdown', () => this.cursors.right.isDown = true);
        this.buttonRight.on('pointerup', () => this.cursors.right.isDown = false);
        this.buttonRight.on('pointerout', () => this.cursors.right.isDown = false);

        // Zajistíme, aby tlačítka zůstala na svém místě
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

        /*         setInterval(() => {
                    const aktualniAnimace = this.chlapikAnimace.sprite.anims.currentAnim ? this.chlapikAnimace.sprite.anims.currentAnim.key : 'zadna';
                    const tlaciSmerLog = this.tlaciSmer ? this.tlaciSmer : 'zadny';
                    const tlaceniZacatekLog = this.tlaceniZacatek ? 'ano' : 'ne';
        
                    console.log(
                        'Aktuální animace:', aktualniAnimace,
                        'Tlačí směr:', tlaciSmerLog,
                        'Tlačení začalo:', tlaceniZacatekLog
                    );
                }, 300); // Logovat každých 300 milisekund  */
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

    teleportujObjekty() {
        const vertikalniPosun = this.bedna.body.center.y;
        const konstantniVzdalenost = 50; // Nastav si požadovanou konstantní vzdálenost mezi nimi

        console.log('Vertikalni posun: ', vertikalniPosun);


        if (this.bedna.body.right > this.scale.width - 5) { // Bedna u pravého okraje
            // Bedna blíže ke středu levé třetiny
            const novaBednaX = this.scale.width / 6;
            // Chlapík ještě více vlevo
            const novaChlapikX = novaBednaX - konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, vertikalniPosun);
            this.bedna.setPosition(novaBednaX, vertikalniPosun);
        } else if (this.bedna.body.left < 5) { // Bedna u levého okraje
            // Bedna blíže ke středu pravé třetiny
            const novaBednaX = this.scale.width * 5 / 6;
            // Chlapík ještě více vpravo
            const novaChlapikX = novaBednaX + konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, vertikalniPosun);
            this.bedna.setPosition(novaBednaX, vertikalniPosun);
        }
    }

    zviditelniObjekty(callback) {
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 1,
            duration: 300,
            onComplete: callback,
            callbackScope: this
        });
    }

    vyhodnotCilovouZonu() {
        const bednaStredX = this.bedna.body.center.x;
        const bednaStredY = this.bedna.body.center.y;
        const rychlostBednyX = Math.abs(this.bedna.body.velocity.x);
        const rychlostBednyY = Math.abs(this.bedna.body.velocity.y);
        const maximalniRychlostProDokonceni = 10;
        const txtCervena = "N50 00 000 E 017 00 000";
        const txtZelena = "N50 49 111 E 017 29 999";

        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const jeBednaStredVZeleneZone = Phaser.Geom.Rectangle.Contains(zelenaZonaBounds, bednaStredX, bednaStredY);
        const jeBednaPomalna = rychlostBednyX < maximalniRychlostProDokonceni && rychlostBednyY < maximalniRychlostProDokonceni;

        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds();
        const jeBednaStredVCerveneZone = Phaser.Geom.Rectangle.Contains(cervenaZonaBounds, bednaStredX, bednaStredY);

        if (jeBednaStredVZeleneZone) {
            this.cilovaZonaData.souradniceText.setText(txtZelena).setStyle({ fill: '#00ff00', fontStyle: '', shadowBlur: 0 }).setVisible(true);
            if (jeBednaPomalna && !this.hraDokoncena) {
                console.log('Hra dokončena (střed bedny v zóně a bedna je pomalá)!');
                this.hraDokoncena = true;
                this.bedna.body.velocity.x = 0;
                if (this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                    this.cilovaZonaData.souradniceText.preFX.clear();
                    this.cilovaZonaData.blurFx = null;
                }
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            } else if (!this.cilovaZonaData.prekryvaZelenou) {
                console.log("Bedna vstoupila do zelené zóny!");
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            }
        } else if (jeBednaStredVCerveneZone) {
            this.cilovaZonaData.souradniceText.setText(txtCervena).setStyle({ fill: '#ff0000', fontStyle: '', shadowBlur: 2 }).setVisible(true);
            if (!this.cilovaZonaData.prekryvaCervenou) {
                console.log("Střed bedny vstoupil do červené zóny!");
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
        const rychlostPohybu = 150; // Nebo tvoje definovaná rychlost

        if (window.DEBUG_MODE) {
            console.log(this.chlapik);
            console.log(this.chlapik.body);
        }

        if (doleva) {
            this.chlapik.body.velocity.x = (-rychlostPohybu);
        } else if (doprava) {
            this.chlapik.body.velocity.x = (rychlostPohybu);
        } else {
            this.chlapik.body.velocity.x = (0);
        }

        const prekryvX = Phaser.Physics.Arcade.GetOverlapX(this.chlapik.body, this.bedna.body, true);
        const chlapikVlevo = this.chlapik.body.x < this.bedna.body.x;
        const chlapikVpravo = this.chlapik.body.x > this.bedna.body.x;

        const tlaciPodminka = (doleva && prekryvX !== 0 && chlapikVlevo) ||
            (doprava && prekryvX !== 0 && chlapikVpravo);

        /*         if (tlaciPodminka) {
                    this.zacniAnimaciTlaceni = true;
                } else {
                    this.zacniAnimaciTlaceni = false;
                } */

        /* if (this.zacniAnimaciTlaceni) {
            this.chlapikAnimace.play('tlaci', true);
        } else {
            if (this.chlapikAnimace.sprite && this.chlapikAnimace.sprite.anims && this.chlapikAnimace.sprite.anims.currentAnim && this.chlapikAnimace.sprite.anims.currentAnim.key !== 'stoji') {
                this.chlapikAnimace.play('stoji', true);
            } else if (this.chlapikAnimace.sprite && this.chlapikAnimace.sprite.anims && !this.chlapikAnimace.sprite.anims.currentAnim) {
                this.chlapikAnimace.play('stoji', true);
            } else if (!doleva && !doprava && this.chlapikAnimace.sprite && this.chlapikAnimace.sprite.anims && this.chlapikAnimace.sprite.anims.currentAnim.key !== 'stoji') {
                this.chlapikAnimace.play('stoji', true); // Zajištění animace stání, když se netlačí a nepohybuje
            }
        } */

        console.log('Doleva stisknuto:', doleva);
        console.log('Doprava stisknuto:', doprava);
        console.log('PrekryvX:', prekryvX);
        console.log('Chlapik vlevo:', chlapikVlevo);
        console.log('Chlapik vpravo:', chlapikVpravo);
//      console.log('zacniAnimaciTlaceni:', this.zacniAnimaciTlaceni);

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
                    console.log('nové x body.center chlapíka: ', this.chlapik.body.center.x);
                    console.log('nové x body.center bedny: ', this.bedna.body.center.x);
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

        const bednaBounds = this.bedna.getBounds();
        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds();

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
            console.log('Prázdna sekce pro stopky nebeží');
        }
    }

    muzeKolizovat(_chlapik, _bedna) {
        return true; // Pro teleportaci necháme kolize vždy povolené
        //console.log();

    }
}