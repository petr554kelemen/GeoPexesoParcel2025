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
        this.tlaceniZacatek = null; // Čas začátku tlačení
        this.vychoziTreniBedny = 50; // Naše aktuální vysoké tření
    }

    preload() {
        this.load.image("obrVlevo", "assets/3d-arrow-left.png");
        this.load.image("obrVpravo", "assets/3d-arrow-right.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        // Chlapík (tlačící)
        this.chlapik = this.physics.add.sprite(100, this.scale.height / 2, 'obrVlevo');
        this.chlapik.setScale(0.5);
        this.chlapik.setCollideWorldBounds(true);
        this.chlapik.setBounce(0.2);
        this.chlapik.setMass(50);
        this.chlapik.setDrag(0.1);

        // Bedna (tlačená)
        this.bedna = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'obrVpravo');
        this.bedna.setScale(0.5);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.setBounce(0.1);
        this.bedna.setMass(75);
        this.bedna.setDrag(this.vychoziTreniBedny); // Nastavíme výchozí vysoké tření

        this.physics.add.collider(this.chlapik, this.bedna);

        // Ovladače z klávesnice
        this.cursors = this.input.keyboard.createCursorKeys();

        // Text pro zobrazení rychlosti
        this.rychlostChlapikaText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff' });
        this.rychlostBednyText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff' });
    }

    update(time, delta) {
        let tlaciSmer = null;
        let pohybDoleva = this.cursors.left.isDown;
        let pohybDoprava = this.cursors.right.isDown;
        let pohybNahoru = this.cursors.up.isDown;
        let pohybDolu = this.cursors.down.isDown;

        this.chlapik.body.setVelocityX(0);
        this.chlapik.body.setVelocityY(0);

        // Určíme směr tlačení a zaznamenáme čas začátku
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
            this.tlaceniZacatek = null; // Resetujeme čas, pokud netlačíme
            this.bedna.setDrag(this.vychoziTreniBedny); // Vracíme výchozí tření
        }

        // Pohyb chlapíka a bedny při tlačení
        if (tlaciSmer) {
            const dobaTlaceni = time - this.tlaceniZacatek;
            // Korekční faktor pro tření (čím déle tlačíme, tím nižší tření)
            const korekcniFaktorTreni = Math.max(0.1, 1 - dobaTlaceni / 2000); // Max 2 sekundy pro snížení tření

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
        } else { // Pohyb chlapíka bez tlačení
            if (pohybDoleva) this.chlapik.body.setVelocityX(-100);
            else if (pohybDoprava) this.chlapik.body.setVelocityX(100);
            else if (pohybNahoru) this.chlapik.body.setVelocityY(-100);
            else if (pohybDolu) this.chlapik.body.setVelocityY(100);
        }

        // Aktualizujeme text s rychlostmi
        this.rychlostChlapikaText.setText(`Chlapík (50kg) rychlost X: ${Math.floor(this.chlapik.body.velocity.x)}, Y: ${Math.floor(this.chlapik.body.velocity.y)}`);
        this.rychlostBednyText.setText(`Bedna (75kg) rychlost X: ${Math.floor(this.bedna.body.velocity.x)}, Y: ${Math.floor(this.bedna.body.velocity.y)}`);
    }
}