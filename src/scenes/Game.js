import { poziceMysi } from "../poziceMysi";

export default class Game extends Phaser.Scene {
    constructor() {
        super("Game");
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
        this.createKonecAnim();
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
            repeat: -1
        });
    }

    createKonecAnim() {
        this.anims.create({
            key: 'animace-konec',
            frames: [{ key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' }],
            frameRate: 4,
            repeat: 0
        });
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        this.chlapik = this.physics.add.sprite(this.scale.width + 100, this.scale.height - 345, 'clovicek-jde-atlas').setOrigin(0.5, 1);
        this.chlapik.setBodySize(110, 140).setOffset(-1, -1);

        this.createAnimations();

        this.bedna = this.physics.add.sprite(-100, this.scale.height - 265, 'bedna-sprite').setOrigin(0.5, 1);
        this.bedna.setBodySize(150, 40).setOffset(-50, -1);
        this.bedna.setImmovable(true);

        this.moveChlapikOffscreen();

        poziceMysi(this);
    }

    moveChlapikOffscreen() {
        this.chlapik.flipX = true;
        this.chlapik.play('animace-chuze');
        this.tweens.add({
            targets: this.chlapik,
            x: -50,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.moveChlapikToBedna();
            }
        });
    }

    moveChlapikToBedna() {
        this.chlapik.flipX = false;
        this.tweens.add({
            targets: this.chlapik,
            x: this.bedna.x + this.bedna.displayWidth / 2 + this.chlapik.displayWidth / 2 + 20, // Pohyb těsně k bedně
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                this.startPushing();
            }
        });
    }

    startPushing() {
        this.chlapik.play('animace-tlaceni');
        this.bedna.setImmovable(false);

        this.physics.add.collider(this.chlapik, this.bedna);

        const bednaCilX = this.scale.width / 2 - this.bedna.displayWidth / 2;

        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            x: bednaCilX,
            duration: 5000,
            ease: 'Linear',
            onUpdate: () => {
                this.chlapik.x = this.bedna.x - this.bedna.displayWidth / 2 - this.chlapik.displayWidth / 2;
            },
            onComplete: () => {
                this.stopAnimation();
            }
        });
    }

    stopAnimation() {
        this.chlapik.body.setVelocityX(0);
        this.bedna.body.setVelocityX(0);
        this.chlapik.play('animace-konec');
    }

    update(time, delta) {
        // Sem můžeš přidat další logiku, pokud bude potřeba
    }
}