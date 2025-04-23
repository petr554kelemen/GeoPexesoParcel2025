import Phaser from 'phaser';
import { poziceMysi } from '../poziceMysi.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.chlapik = null;
        this.bedna = null;
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
        this.anims.create({
            key: 'animace-tlaceni',
            frames: [
                { key: 'clovicek-tlaci-atlas', frame: 'Pic01.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic02.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic03.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic04.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic05.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic06.png' },
                //{ key: 'clovicek-tlaci-atlas', frame: 'Pic06a.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic07.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic08.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic09.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic10.png' },
                //{ key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' },
            ],
            frameRate: 5,
            repeat: -1,
        });
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');
    
        this.chlapik = this.physics.add.sprite(295, 513, 'clovicek-jde-atlas').setOrigin(0.5, 1);
        this.chlapik.body.setSize(18, 140);
        this.chlapik.body.setGravityY(0);
        this.time.delayedCall(10, () => {
            if (this.chlapik && this.chlapik.body) {
                this.chlapik.body.offsetX = -1;
                this.chlapik.body.offsetY = 0;
                this.chlapik.refreshBody();
                console.log("Offset nastaven se zpožděním - X:", this.chlapik.body.offsetX, "Y:", this.chlapik.body.offsetY);
            } else {
                console.error("Chlapík nebo jeho fyzické tělo není dostupné při zpožděném volání.");
            }
        }, [], this);
    
        console.log("Chlapík vytvořen na X:", this.chlapik.x, "Y:", this.chlapik.y, "Origin Y:", this.chlapik.originY);
        console.log("Chlapík body.offsetX (před zpožděním):", this.chlapik.body.offsetX, "body.offsetY:", this.chlapik.body.offsetY);
        console.log("Chlapík body.y:", this.chlapik.body.y, "position.y:", this.chlapik.body.position.y);
    
        this.bedna = this.physics.add.sprite(350, 510, 'bedna-sprite').setOrigin(0, 1);
        this.bedna.setImmovable(false); // Aby se mohla hýbat
        this.bedna.body.pushable = true; // Nastavujeme, že může být tlačena
        this.bedna.setScale(0.7);
    
        this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);
    
        this.createAnimations();
    
        this.cursors = this.input.keyboard.createCursorKeys();
    
        this.chlapikInfoText = this.add.text(10, 20, '', { fontSize: '16px', fill: '#fff' });
        this.bednaInfoText = this.add.text(10, 40, '', { fontSize: '16px', fill: '#fff' });
    }
    
     update(time, delta) {
        this.chlapik.setVelocityX(0);
        this.chlapik.setVelocityY(0);
        let isPushing = false;
    
        if (this.cursors.left.isDown) {
            this.chlapik.setVelocityX(-160);
            this.chlapik.flipX = true;
            this.chlapik.play('animace-chuze', true);
        } else if (this.cursors.right.isDown) {
            this.chlapik.setVelocityX(160);
            this.chlapik.flipX = false;
            this.chlapik.play('animace-chuze', true);
        } else if (this.cursors.up.isDown) {
            this.chlapik.setVelocityY(-160);
            this.chlapik.play('animace-chuze', true);
        } else if (this.cursors.down.isDown) {
            this.chlapik.setVelocityY(160);
            this.chlapik.play('animace-chuze', true);
        } else {
            this.chlapik.stop('animace-chuze');
        }
    
        // Kontrola kolize a pohybu pro animaci tlačení
        if (this.physics.overlap(this.chlapik, this.bedna) && (this.chlapik.body.velocity.x !== 0 || this.chlapik.body.velocity.y !== 0)) {
            this.chlapik.play('animace-tlaceni', true);
            isPushing = true;
        }
    
        if (!isPushing) {
            this.chlapik.stop('animace-tlaceni');
        }
    
        this.chlapikInfoText.setText(`Chlapík X: ${Math.floor(this.chlapik.x)}, Y: ${Math.floor(this.chlapik.y)}`);
        this.bednaInfoText.setText(`Bedna X: ${Math.floor(this.bedna.x)}, Y: ${Math.floor(this.bedna.y)}`);
    }
    
     handleCollision(gameObjectA, gameObjectB) {
        console.log("--- Kolize nastala! ---");
        // Už nemusíme ručně posouvat, o to by se měla postarat fyzika díky pushable
        console.log("Chlapík body size:", gameObjectA.body.width, gameObjectA.body.height, "offset:", gameObjectA.body.offsetX, gameObjectA.body.offsetY);
        console.log("Bedna body size:", gameObjectB.body.width, gameObjectB.body.height, "offset:", gameObjectB.body.offsetX, gameObjectB.body.offsetY);
        console.log("Chlapík pozice (sprite):", gameObjectA.x, gameObjectA.y);
        console.log("Bedna pozice (sprite):", gameObjectB.x, gameObjectB.y);
        console.log("Chlapík pozice (body):", gameObjectA.body.position.x, gameObjectA.body.position.y);
        console.log("Bedna pozice (body):", gameObjectB.body.position.x, gameObjectB.body.position.y);
    }
}