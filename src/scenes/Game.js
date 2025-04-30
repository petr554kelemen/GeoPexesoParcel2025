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
        const deltaX = this.chlapik.x - this.bedna.x;
        const levyOkraj = 50;
        const pravyOkraj = this.scale.width - 50;
        const horniOkraj = 50;
        const dolniOkraj = this.scale.height - 50;

        if (this.bedna.x < 0) {
            this.bedna.x = pravyOkraj;
            this.chlapik.x = this.bedna.x + deltaX;
        } else if (this.bedna.x > this.scale.width) {
            this.bedna.x = levyOkraj;
            this.chlapik.x = this.bedna.x + deltaX;
        }

        if (this.bedna.y < 0) {
            this.bedna.y = dolniOkraj;
            this.chlapik.y = this.bedna.y + (this.chlapik.y - this.bedna.y); // Zachování delta Y
        } else if (this.bedna.y > this.scale.height) {
            this.bedna.y = horniOkraj;
            this.chlapik.y = this.bedna.y + (this.chlapik.y - this.bedna.y); // Zachování delta Y
        }

        // Zajištění, aby se chlapík a bedna nenarodili v cílové zóně (jednoduchá kontrola)
        const bednaVCiloveZone = Phaser.Geom.Rectangle.Contains(this.cilovaZona, this.bedna.body.center.x, this.bedna.body.center.y);
        if (bednaVCiloveZone) {
            this.teleportujObjekty(); // Pokud se náhodou teleportují do cílové zóny, zkusíme to znovu
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

        const okrajovaVzdalenost = 20;
        const bednaUOkrajeVlevo = this.bedna.x < okrajovaVzdalenost;
        const bednaUOkrajeVpravo = this.bedna.x > this.scale.width - okrajovaVzdalenost;
        const bednaUOkrajeNahore = this.bedna.y < okrajovaVzdalenost;
        const bednaUOkrajeDole = this.bedna.y > this.scale.height - okrajovaVzdalenost;

        if ((bednaUOkrajeVlevo && pohybDoleva) || (bednaUOkrajeVpravo && pohybDoprava) || (bednaUOkrajeNahore && pohybNahoru) || (bednaUOkrajeDole && pohybDolu)) {
            if (!this.teleportaceBezi) {
                this.teleportaceBezi = true;
                this.zneviditelniObjekty(() => {
                    this.teleportujObjekty();
                    this.zviditelniObjekty(() => {
                        this.teleportaceBezi = false;
                    });
                });
            }
        } else {
            // Pokud bedna není u okraje, resetujeme příznaky teleportace
            this.teleportaceBezi = false;
            this.bedna.alpha = 1; // Zajistíme, že bedna je viditelná
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
    }
}