// 1/5/2025 17:38
import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';
import Napoveda from './UI/napoveda.js'; // Uprav cestu podle tvé struktury

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.bedna = null;
        this.chlapik = null;
        this.cursors = null;
        this.rychlostChlapikaText = null;
        this.rychlostBednyText = null;
        this.tlaceniZacatek = null;
        this.vychoziTreniBedny = 50;
        this.zneviditelnovaniBezi = false;
        this.zviditelnovaniBezi = false;
        this.hraDokoncena = false;
        this.teleportaceBezi = false; // Nezapomeň inicializovat tuto proměnnou
        //this.napoveda = null;
    }

    preload() {
        //this.load.image("background", "assets/bg.png");
        this.load.image("obrVlevo", "assets/3d-arrow-left.png");
        this.load.image("obrVpravo", "assets/3d-arrow-right.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        const objPositionY = this.scale.canvas.height / 2 * 1.21;
        console.log(this.scale.canvas.height);

        // background
        const background = this.add.image(500, 390, "backgroundGame");
        background.blendMode = Phaser.BlendModes.SOURCE_OUT;
        background.scaleX = 0.8784867183713885;
        background.scaleY = 0.9624751673844308;
        background.alpha = 0.8;
        background.alphaTopLeft = 0.8;
        background.alphaTopRight = 0.8;
        background.alphaBottomLeft = 0.8;
        background.alphaBottomRight = 0.8;

        this.chlapik = this.physics.add.sprite(100, objPositionY, 'obrVlevo');
        this.chlapik.setScale(0.5);
        this.chlapik.setCollideWorldBounds(true);
        this.chlapik.setBounce(0.2);
        this.chlapik.setMass(50);
        this.chlapik.setDrag(0.1);

        this.bedna = this.physics.add.sprite(this.chlapik.x + 60, objPositionY, 'obrVpravo');
        this.bedna.setScale(0.5);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.setBounce(0.1);
        this.bedna.setMass(75);
        this.bedna.setDrag(this.vychoziTreniBedny);

        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // cilova zona DATA
        const xStredZony = this.scale.width / 2;
        const yStredZony = this.bedna.body.center.y;

        this.cilovaZonaData = {
            xStred: xStredZony,
            yStred: yStredZony,
            cervenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.3), // cervena zona
            zelenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 40, 40, 0x00ff00).setOrigin(0.5).setAlpha(0.5), // zelena zona
            souradniceText: this.add.text(xStredZony, yStredZony - 30, "N 50°00.000 E017°00.000", {
                font: '20px Arial',
                align: 'center'
            }).setOrigin(0.5).setVisible(false),
            blurFx: null,
            prekryvaCervenou: false,
            prekryvaZelenou: false
        };

        const nejvyssiHloubka = 1000;
        this.chlapik.setDepth(nejvyssiHloubka);
        this.bedna.setDepth(nejvyssiHloubka);

        this.rychlostChlapikaText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff' });
        this.rychlostBednyText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff' });

        this.teleportujObjekty();

        // Nastavime a spustime kod pro rozmazanou napovedu (NYNÍ PO DEFINICI ZÓNY)
        // Používáme this.cilovaZonaData.souradniceText místo this.coordinatesText
        this.cilovaZonaData.souradniceText.setPosition(this.cilovaZonaData.xStred, this.cilovaZonaData.yStred - 30);

        this.vytvorTestovaciKlonyZon(); // Voláme funkci pro vytvoření klonů

        this.napoveda = new Napoveda(this, this.cilovaZonaData.zelenaZonaObjekt); // Používáme odkaz z objektu

    }

    vytvorTestovaciKlonyZon() {
        const posunX = this.scale.width / 2;

        // Klonujeme červenou zónu
        this.testCervenaZonaKlon = this.add.rectangle(
            this.cilovaZonaData.cervenaZonaObjekt.x + posunX - (this.scale.width / 2 - this.cilovaZonaData.cervenaZonaObjekt.x),
            this.cilovaZonaData.cervenaZonaObjekt.y,
            this.cilovaZonaData.cervenaZonaObjekt.width,
            this.cilovaZonaData.cervenaZonaObjekt.height,
            0xff0000
        ).setOrigin(0.5).setAlpha(0.3);

        // Klonujeme zelenou zónu
        this.testZelenaZonaKlon = this.add.rectangle(
            this.cilovaZonaData.zelenaZonaObjekt.x + posunX - (this.scale.width / 2 - this.cilovaZonaData.zelenaZonaObjekt.x),
            this.cilovaZonaData.zelenaZonaObjekt.y,
            this.cilovaZonaData.zelenaZonaObjekt.width,
            this.cilovaZonaData.zelenaZonaObjekt.height,
            0x00ff00
        ).setOrigin(0.5).setAlpha(0.5);
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
        const vertikalniPosun = this.chlapik.body.center.y;
        const konstantniVzdalenost = 70; // Nastav si požadovanou konstantní vzdálenost mezi nimi

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

    update(time, delta) {
        let tlaciSmer = null;
        let pohybDoleva = this.cursors.left.isDown;
        let pohybDoprava = this.cursors.right.isDown;
        let pohybNahoru = this.cursors.up.isDown;
        let pohybDolu = this.cursors.down.isDown;

        // Nastavíme rychlost na nulu pouze pokud se nic neděje
        if (!pohybDoleva && !pohybDoprava && !pohybNahoru && !pohybDolu && !this.tlaceniZacatek) {
            this.chlapik.body.setVelocityX(0);
            this.chlapik.body.setVelocityY(0);
        }

        if (this.chlapik.body.touching.right && pohybDoleva) {
            tlaciSmer = 'left';
            if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
        } else if (this.chlapik.body.touching.left && pohybDoprava) {
            tlaciSmer = 'right';
            if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
        } else if (this.chlapik.body.touching.down && pohybNahoru) {
            tlaciSmer = 'up';
            if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
        } else if (this.chlapik.body.touching.up && pohybDolu) {
            tlaciSmer = 'down';
            if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
        } else {
            this.tlaceniZacatek = null;
            this.bedna.setDrag(this.vychoziTreniBedny);
        }

        if (tlaciSmer && this.tlaceniZacatek) {
            // ... kód pro tlačení bedny ...
        } else {
            if (pohybDoleva) this.chlapik.body.setVelocityX(-100);
            else if (pohybDoprava) this.chlapik.body.setVelocityX(100);
            else if (pohybNahoru) this.chlapik.body.setVelocityY(-100);
            else if (pohybDolu) this.chlapik.body.setVelocityY(100);
        }

        //const okrajovaVzdalenost = 50;
        const bednaUOkrajeVlevo = this.bedna.body.left < 5; // Levý okraj těla bedny je méně než 5 pixelů od levého okraje obrazovky
        const bednaUOkrajeVpravo = this.bedna.body.right > this.scale.width - 5; // Pravý okraj těla bedny je více než 5 pixelů od pravého okraje obrazovky
        const bednaUOkrajeNahore = this.bedna.body.top < 5; // Horní okraj těla bedny je méně než 5 pixelů od horního okraje obrazovky
        const bednaUOkrajeDole = this.bedna.body.bottom > this.scale.height - 5; // Dolní okraj těla bedny je více než 5 pixelů od dolního okraje obrazovky

        //console.log('Je bedna i levého okraje?', bednaUOkrajeVlevo);
        //console.log('Je bedna u pravého okraje', bednaUOkrajeVpravo);

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
            // Pokud bedna není u okraje, resetujeme příznaky teleportace
            this.teleportaceBezi = false;
            this.bedna.alpha = 1; // Zajistíme, že bedna je viditelná
            this.chlapik.alpha = 1;
        }

        const bednaBounds = this.bedna.getBounds();
        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds(); // Používáme objekt pro červenou zónu

        // Detekce překryvu bedny s cílovou zónou (zelenou)
        if (Phaser.Geom.Rectangle.Overlaps(zelenaZonaBounds, bednaBounds)) {
            console.log('Hra dokončena!');
            //this.bedna.setVelocity(0);
        }

        // Definujeme "červenou" zónu jako oblast mezi mírně zvětšenou cílovou zónou a samotnou cílovou zónou
        const cervenaZonaSirsi = new Phaser.Geom.Rectangle(
            zelenaZonaBounds.x - 20,
            zelenaZonaBounds.y - 20,
            zelenaZonaBounds.width + 40,
            zelenaZonaBounds.height + 40
        );

        // Zobrazíme nápovědu, pokud se bedna překrývá s širší zónou, ALE NEPŘEKRÝVÁ se s cílovou zónou
        if (Phaser.Geom.Rectangle.Overlaps(cervenaZonaSirsi, bednaBounds) &&
            !Phaser.Geom.Rectangle.Overlaps(zelenaZonaBounds, bednaBounds)) {
            //this.napoveda.zobrazit();
        } else {
            //this.napoveda.skryt();
        }

        // Kontrola překryvu bedny s červenou zónou
        if (Phaser.Geom.Rectangle.Overlaps(cervenaZonaBounds, bednaBounds)) {
            if (!this.cilovaZonaData.prekryvaCervenou) {
                console.log("Bedna vstoupila do červené zóny!");
                this.cilovaZonaData.souradniceText.setStyle({ fill: '#ff0000' }); // Červená barva
                if (!this.cilovaZonaData.blurFx) {
                    this.cilovaZonaData.blurFx = this.cilovaZonaData.souradniceText.preFX.addBlur();
                    this.tweens.add({
                        targets: this.cilovaZonaData.blurFx,
                        strength: 10,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1
                    });
                }
                this.cilovaZonaData.souradniceText.setVisible(true);
                this.cilovaZonaData.prekryvaCervenou = true;
                this.cilovaZonaData.prekryvaZelenou = false;
            }
        } else if (Phaser.Geom.Rectangle.Overlaps(zelenaZonaBounds, bednaBounds)) {
            if (!this.cilovaZonaData.prekryvaZelenou) {
                console.log("Bedna vstoupila do zelené zóny!");
                this.cilovaZonaData.souradniceText.setStyle({ fill: '#00ff00' }); // Zelená barva
                if (this.cilovaZonaData.blurFx) {
                    this.cilovaZonaData.souradniceText.preFX.clear(); // Odstraníme efekt rozmazání
                    this.cilovaZonaData.blurFx = null;
                }
                this.cilovaZonaData.souradniceText.setVisible(true);
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            }
        } else {
            this.cilovaZonaData.souradniceText.setVisible(false);
            this.cilovaZonaData.prekryvaCervenou = false;
            this.cilovaZonaData.prekryvaZelenou = false;
            if (this.cilovaZonaData.blurFx) {
                this.cilovaZonaData.souradniceText.preFX.clear();
                this.cilovaZonaData.blurFx = null;
            }
        }

        //this.rychlostChlapikaText.setText(`Chlapík (50kg) rychlost X: ${Math.floor(this.chlapik.body.velocity.x)}, Y: ${Math.floor(this.chlapik.body.velocity.y)}`);
        //this.rychlostBednyText.setText(`Bedna (75kg) rychlost X: ${Math.floor(this.bedna.body.velocity.x)}, Y: ${Math.floor(this.bedna.body.velocity.y)}`);
    }

    muzeKolizovat(chlapik, bedna) {
        return true; // Pro teleportaci necháme kolize vždy povolené
        //console.log();

    }
}