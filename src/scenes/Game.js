import Phaser from 'phaser';
import { poziceMysi } from '../poziceMysi.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.isPushing = false; // Vlastnost scény pro sledování tlačení
        this.chlapik = null;
        this.bedna = null;
        this.moveLeft = false;
        this.moveRight = false;
    }

    preload() {
        this.load.atlas('clovicek-jde-atlas', 'assets/animace/clovicek_jde.png', 'assets/animace/clovicek_jde_atlas.json');
        this.load.atlas('clovicek-tlaci-atlas', 'assets/animace/clovicek_tlaci.png', 'assets/animace/clovicek_tlaci.json');
        this.load.image('bedna-sprite', 'assets/bedna.png');
        this.load.image('backgroundGame', 'assets/images/freepikBackground.png');
    }

    createAnimations() {
        this.createChuzeAnim();
        this.createTlaceniAnim();
        //this.createKonecAnim();
    }

    createChuzeAnim() {
        const getChuzeFrames = (prefix, start, end) => {
            const frames = [];
            for (let i = start; i <= end; i++) {
                const frameName = `${prefix}_${i}`;
                frames.push({ key: 'clovicek-jde-atlas', frame: frameName });
            }
            return frames;
        };

        this.anims.create({
            key: 'animace-chuze',
            frames: getChuzeFrames('clovicek', 1, 10),
            frameRate: 8,
            repeat: -1,
        });
    }

    createTlaceniAnim() {
        const atlasTlaceniData = this.cache.json.get('clovicek-tlaci-atlas');
        this.anims.create({
            key: 'animace-tlaceni',
            frames: [
                { key: 'clovicek-tlaci-atlas', frame: 'Pic01.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic02.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic03.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic04.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic05.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic06.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic06a.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic07.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic08.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic09.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic10.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' }
            ],
            frameRate: 5,
            repeat: -1,
        });
    }

    najdiNahodnouPoziciProChlapika() {
        const bednaX = this.bedna.x;
        const bednaSirka = this.bedna.width * this.bedna.scaleX;
        const chlapikSirkaPolovina = this.chlapik.width / 2;
        const maxPokusu = 100;
        const pevnaY = 507; // Pevná pozice na ose Y

        for (let i = 0; i < maxPokusu; i++) {
            const nahodneX = Phaser.Math.Between(chlapikSirkaPolovina, this.scale.width - chlapikSirkaPolovina);
            const prekryvaX = nahodneX > bednaX - chlapikSirkaPolovina && nahodneX < bednaX + bednaSirka + chlapikSirkaPolovina;

            if (!prekryvaX) {
                return { x: nahodneX, y: pevnaY };
            }
        }

        console.warn("Nepodařilo se najít bezpečnou náhodnou X pozici pro chlapíka.");
        return { x: 50, y: pevnaY }; // Výchozí bezpečná pozice
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        const bednaScale = 0.7;
        //this.bedna = this.physics.add.sprite(this.scale.width / 2 + 100, 510, 'bedna-sprite').setOrigin(0, 1).setScale(bednaScale).setImmovable(false).setCollideWorldBounds(true).body.pushable = true;
        this.bedna = this.physics.add.sprite(this.scale.width / 2 + 100, 510, 'bedna-sprite').setOrigin(0, 1).setScale(bednaScale).setImmovable(true).setCollideWorldBounds(true);
        this.bedna.body.pushable = true; // Nastavujeme pushable až po vytvoření spritu
        console.log("Bedna po vytvoření:", this.bedna); // Přidáme log pro kontrolu bedny
        console.log("Tělo bedny po vytvoření:", this.bedna.body) // Přidáme log pro kontrolu těla hned po vytvoření
        //console.log("Tělo bedny:", this.bedna ? this.bedna.body : null);

        this.chlapik = this.physics.add.sprite(0, 0, 'clovicek-jde-atlas').setOrigin(0.5, 1); // Vytvoříme ho nejdřív bez konkrétní pozice
        this.chlapik.body.setSize(18, 140).setGravityY(0).setCollideWorldBounds(true);

        const nahodnaPoziceChlapika = this.najdiNahodnouPoziciProChlapika(); // Teď už this.chlapik existuje
        this.chlapik.setPosition(nahodnaPoziceChlapika.x, nahodnaPoziceChlapika.y);

        this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);

        this.createAnimations();

        this.cursors = this.input.keyboard.createCursorKeys();

        const buttonY = this.scale.height - 50;
        const buttonScale = 0.5;
        this.leftButton = this.add.image(50, buttonY, 'arrow_left').setInteractive().setAlpha(0.8).setScale(buttonScale).on('pointerdown', () => this.moveLeft = true).on('pointerup', () => this.moveLeft = false).on('pointerout', () => this.moveLeft = false);
        this.rightButton = this.add.image(this.scale.width - 50, buttonY, 'arrow_right').setInteractive().setAlpha(0.8).setScale(buttonScale).on('pointerdown', () => this.moveRight = true).on('pointerup', () => this.moveRight = false).on('pointerout', () => this.moveRight = false);

        this.chlapikInfoText = this.add.text(10, 20, '', { fontSize: '16px', fill: '#fff' });
    }

    update(time, delta) {
        //this.chlapik.play('animace-tlaceni', true);
        //console.log("Chlapík:", this.chlapik);
        //console.log("Tělo chlapíka:", this.chlapik ? this.chlapik.body : null);
        //console.log("Bedna:", this.bedna);
        //console.log("Tělo bedny:", this.bedna ? this.bedna.body : null);


        this.chlapik.setVelocityX(0);
        this.chlapik.setVelocityY(0);

        const isMovingManually = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown || this.moveLeft || this.moveRight;
        const autoMoveSpeed = 80;
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const isNearLeftEdgeChlapik = this.chlapik.x < 50;
        const isNearRightEdgeChlapik = this.chlapik.x > this.scale.width - 50;
        const isNearTopEdgeChlapik = this.chlapik.y < 50;
        const isNearBottomEdgeChlapik = this.chlapik.y > this.scale.height - 50;
        const edgeThreshold = 10;
        const isBednaAtLeftEdge = this.bedna.x < edgeThreshold;
        const isBednaAtRightEdge = this.bedna.x > this.scale.width - this.bedna.width * this.bedna.scaleX - edgeThreshold;
        const isBednaAtTopEdge = this.bedna.y < edgeThreshold;
        const isBednaAtBottomEdge = this.bedna.y > this.scale.height - this.bedna.height * this.bedna.scaleY - edgeThreshold;
        const manualSpeed = 160;

        if (!isMovingManually) {
            // Automatický pohyb chlapíka ke středu
            if (isNearLeftEdgeChlapik && this.chlapik.x < centerX) {
                this.chlapik.setVelocityX(autoMoveSpeed);
                if (!this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
                this.chlapik.flipX = false;
            } else if (isNearRightEdgeChlapik && this.chlapik.x > centerX) {
                this.chlapik.setVelocityX(-autoMoveSpeed);
                if (!this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
                this.chlapik.flipX = true;
            } else if (isNearTopEdgeChlapik && this.chlapik.y < centerY) {
                this.chlapik.setVelocityY(autoMoveSpeed);
                if (!this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (isNearBottomEdgeChlapik && this.chlapik.y > centerY) {
                this.chlapik.setVelocityY(-autoMoveSpeed);
                if (!this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else {
                this.chlapik.stop('animace-chuze');
            }
        } else {
            // Manuální ovládání chlapíka
            if (this.cursors.left.isDown || this.moveLeft) {
                this.chlapik.setVelocityX(-manualSpeed);
                this.chlapik.flipX = true;
                if (!this.isPushing && !this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.right.isDown || this.moveRight) {
                this.chlapik.setVelocityX(manualSpeed);
                this.chlapik.flipX = false;
                if (!this.isPushing && !this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.up.isDown) {
                this.chlapik.setVelocityY(-manualSpeed);
                if (!this.isPushing && !this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.down.isDown) {
                this.chlapik.setVelocityY(manualSpeed);
                if (!this.isPushing && !this.chlapik.anims.isPlaying) { // Přidali jsme kontrolu !this.chlapik.anims.isPlaying
                    this.chlapik.play('animace-chuze', true);
                }
            } else {
                this.chlapik.stop('animace-chuze');
            }
        }

        // Logika tlačení
        if (this.chlapik && this.chlapik.body && this.bedna && this.bedna.body) {
            const isMoving = (this.chlapik.body.velocity.x !== 0 || this.chlapik.body.velocity.y !== 0);

            if (this.isPushing && isMoving) { // Jednodušší podmínka pro testování
                console.log("Pokouším se přehrát animaci tlačení (jednodušší)");
                this.chlapik.play('animace-tlaceni', true);
                this.bedna.body.velocity.x = this.chlapik.body.velocity.x;
                this.bedna.body.velocity.y = this.chlapik.body.velocity.y;
            } else if (this.isPushing && !isMoving) {
                this.isPushing = false;
                this.chlapik.stop('animace-tlaceni');
                this.bedna.body.velocity.x *= 0.95;
                this.bedna.body.velocity.y *= 0.95;
                if (Math.abs(this.bedna.body.velocity.x) < 5) this.bedna.body.velocity.x = 0;
                if (Math.abs(this.bedna.body.velocity.y) < 5) this.bedna.body.velocity.y = 0;
            }
        }

        
        /*
        if (!this.isPushing) {
            this.chlapik.stop('animace-tlaceni');
        }
        */

        this.chlapikInfoText.setText(`Chlapík X: ${Math.floor(this.chlapik.x)}, Y: ${Math.floor(this.chlapik.y)}, Tlačí: ${this.isPushing}, Man. Ovládání: ${isMovingManually}`);

    }


    handleCollision(chlapik, bedna) {
        
            console.log("DOŠLO KE KOLIZI!");
            this.isPushing = true; // Nastavujeme isPushing při kolizi
        
    }
}