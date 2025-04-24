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
        this.load.image('arrow_left', 'assets/3d-arrow-left.png');
        this.load.image('arrow_right', 'assets/3d-arrow-right.png');
    }

    createAnimations() {
        this.createChuzeAnim();
        this.createTlaceniAnim();
    }

    createChuzeAnim() {
        const getChuzeFrames = (prefix, start, end) => {
            const frames = [];
            for (let i = start; i <= end; i++) {
                const frameName = prefix + "_" + i;
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
        this.anims.create({
            key: 'animace-tlaceni',
            frames: [
                { key: 'clovicek-tlaci-atlas', frame: 'Pic01.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic02.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic03.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic04.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic05.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic06.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic07.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic08.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic09.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic10.png' },
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
        const pevnaY = this.scale.height / 2; // Pevná pozice na ose Y

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
        this.bedna = this.physics.add.sprite(this.scale.width / 2 + 100, 510, 'bedna-sprite').setOrigin(0, 1).setScale(bednaScale).setImmovable(false).setCollideWorldBounds(true).body.pushable = true;

        const nahodnaPoziceChlapika = this.najdiNahodnouPoziciProChlapika();
        this.chlapik = this.physics.add.sprite(nahodnaPoziceChlapika.x, nahodnaPoziceChlapika.y, 'clovicek-jde-atlas').setOrigin(0.5, 1);
        this.chlapik.body.setSize(18, 140).setGravityY(0).setCollideWorldBounds(true);

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
                this.chlapik.play('animace-chuze', true);
                this.chlapik.flipX = false;
            } else if (isNearRightEdgeChlapik && this.chlapik.x > centerX) {
                this.chlapik.setVelocityX(-autoMoveSpeed);
                this.chlapik.play('animace-chuze', true);
                this.chlapik.flipX = true;
            } else if (isNearTopEdgeChlapik && this.chlapik.y < centerY) {
                this.chlapik.setVelocityY(autoMoveSpeed);
                this.chlapik.play('animace-chuze', true);
            } else if (isNearBottomEdgeChlapik && this.chlapik.y > centerY) {
                this.chlapik.setVelocityY(-autoMoveSpeed);
                this.chlapik.play('animace-chuze', true);
            } else {
                this.chlapik.stop('animace-chuze');
            }
        } else {
            // Manuální ovládání chlapíka
            if (this.cursors.left.isDown || this.moveLeft) {
                this.chlapik.setVelocityX(-manualSpeed);
                this.chlapik.flipX = true;
                if (!this.isPushing) {
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.right.isDown || this.moveRight) {
                this.chlapik.setVelocityX(manualSpeed);
                this.chlapik.flipX = false;
                if (!this.isPushing) {
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.up.isDown) {
                this.chlapik.setVelocityY(-manualSpeed);
                if (!this.isPushing) {
                    this.chlapik.play('animace-chuze', true);
                }
            } else if (this.cursors.down.isDown) {
                this.chlapik.setVelocityY(manualSpeed);
                if (!this.isPushing) {
                    this.chlapik.play('animace-chuze', true);
                }
            } else {
                this.chlapik.stop('animace-chuze'); // Zastavíme animaci, pokud se manuálně nepohybuje
            }
        }

        // Logika tlačení
        if (this.physics.overlap(this.chlapik, this.bedna) && (this.chlapik.body.velocity.x !== 0 || this.chlapik.body.velocity.y !== 0)) {
            this.chlapik.play('animace-tlaceni', true);
            this.isPushing = true;
            this.bedna.body.velocity.x = this.chlapik.body.velocity.x;
            this.bedna.body.velocity.y = this.chlapik.body.velocity.y;
        } else if (this.bedna.body.velocity.x !== 0 || this.bedna.body.velocity.y !== 0) {
            this.bedna.body.velocity.x *= 0.95;
            this.bedna.body.velocity.y *= 0.95;
            if (Math.abs(this.bedna.body.velocity.x) < 5) {
                this.bedna.body.velocity.x = 0;
            }
            if (Math.abs(this.bedna.body.velocity.y) < 5) {
                this.bedna.body.velocity.y = 0;
            }
        }

        // Logika "odpružení" bedny od okraje
        const bounceSpeed = 100;
        if (isBednaAtLeftEdge && this.bedna.body.velocity.x < 0) {
            this.bedna.setVelocityX(bounceSpeed);
        } else if (isBednaAtRightEdge && this.bedna.body.velocity.x > 0) {
            this.bedna.setVelocityX(-bounceSpeed);
        }
        if (isBednaAtTopEdge && this.bedna.body.velocity.y < 0) {
            this.bedna.setVelocityY(bounceSpeed);
        } else if (isBednaAtBottomEdge && this.bedna.body.velocity.y > 0) {
            this.bedna.setVelocityY(-bounceSpeed);
        }

        if (!this.isPushing) {
            this.chlapik.stop('animace-tlaceni');
        }

        this.chlapikInfoText.setText(`Chlapík X: ${Math.floor(this.chlapik.x)}, Y: ${Math.floor(this.chlapik.y)}, Tlačí: ${this.isPushing}, Man. Ovládání: ${isMovingManually}`);
    }

    handleCollision(chlapik, bedna) {
        // Zde může být logika pro interakci chlapíka a bedny při kolizi (zatím prázdné)
    }
}