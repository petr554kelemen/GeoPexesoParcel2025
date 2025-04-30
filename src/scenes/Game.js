import Phaser from 'phaser';
import { poziceMysi } from '../poziceMysi.js';

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
    }

    preload() {
        this.load.image("obrVlevo", "assets/3d-arrow-left.png");
        this.load.image("obrVpravo", "assets/3d-arrow-right.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        this.chlapik = this.physics.add.sprite(100, this.scale.height / 2, 'obrVlevo');
        this.chlapik.setScale(0.5);
        this.chlapik.setCollideWorldBounds(true);
        this.chlapik.setBounce(0.2);
        this.chlapik.setMass(50);
        this.chlapik.setDrag(0.1);

        this.bedna = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'obrVpravo');
        this.bedna.setScale(0.5);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.setBounce(0.1);
        this.bedna.setMass(75);
        this.bedna.setDrag(this.vychoziTreniBedny);

        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // cilova zona
        const yPoziceCiloveZony = this.bedna.body.center.y;
        console.log("pozice y z center:", yPoziceCiloveZony);
        const xPoziceCiloveZony = this.scale.width / 2;

        const cilovaZonaVnejsi = this.add.rectangle(xPoziceCiloveZony, yPoziceCiloveZony, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.3); //cervema zona
        const cilovaZonaVnitrni = this.add.rectangle(xPoziceCiloveZony, yPoziceCiloveZony, 40, 40, 0x00ff00).setOrigin(0.5).setAlpha(0.5); //zelena zona

        this.cilovaZona = cilovaZonaVnitrni.getBounds();

        const nejvyssiHloubka = 1000; // Zvol si dostatečně vysoké číslo
        this.chlapik.setDepth(nejvyssiHloubka);
        this.bedna.setDepth(nejvyssiHloubka);

        this.rychlostChlapikaText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff' });
        this.rychlostBednyText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff' });

        // Spustíme teleportaci hned na začátku hry
        this.teleportujObjekty();
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
        const konstantniVzdalenost = 100; // Nastav si požadovanou konstantní vzdálenost mezi nimi

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

        this.chlapik.body.setVelocityX(0);
        this.chlapik.body.setVelocityY(0);

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
            const dobaTlaceni = time - this.tlaceniZacatek;
            const korekcniFaktorTreni = Math.max(0.1, 1 - dobaTlaceni / 2000);
            this.bedna.setDrag(this.vychoziTreniBedny * korekcniFaktorTreni);

            switch (tlaciSmer) {
                case 'left':
                    this.chlapik.body.setVelocityX(-100);
                    this.bedna.body.setVelocityX(-100);
                    break;
                case 'right':
                    this.chlapik.body.setVelocityX(100);
                    this.bedna.body.setVelocityX(100);
                    break;
                case 'up':
                    this.chlapik.body.setVelocityY(-100);
                    this.bedna.body.setVelocityY(-100);
                    break;
                case 'down':
                    this.chlapik.body.setVelocityY(100);
                    this.bedna.body.setVelocityY(100);
                    break;
            }
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

        const jeBednaVCiloveZone = Phaser.Geom.Rectangle.Contains(this.cilovaZona, this.bedna.body.center.x, this.bedna.body.center.y);

        if (jeBednaVCiloveZone && !this.hraDokoncena) {
            this.hraDokoncena = true;
            console.log("Hra dokončena!");
            // Zde můžeš přidat kód pro zobrazení vítězné obrazovky, zastavení hry atd.
        }

        this.rychlostChlapikaText.setText(`Chlapík (50kg) rychlost X: ${Math.floor(this.chlapik.body.velocity.x)}, Y: ${Math.floor(this.chlapik.body.velocity.y)}`);
        this.rychlostBednyText.setText(`Bedna (75kg) rychlost X: ${Math.floor(this.bedna.body.velocity.x)}, Y: ${Math.floor(this.bedna.body.velocity.y)}`);
    }

    muzeKolizovat(chlapik, bedna) {
        return true; // Pro teleportaci necháme kolize vždy povolené
        //console.log();

    }
}