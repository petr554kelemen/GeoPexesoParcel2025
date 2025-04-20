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
        this.load.image('bedna-sprite', 'assets/bedna.png'); // Předpokládám, že máš obrázek bedny
        this.load.image('backgroundGame', 'assets/images/freepikBackground.png'); // Předpokládám, že máš pozadí
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
            frames: getChuzeFrames('clovicek', 1, 10), // Používáme prefix 'clovicek' a rozsah 1 až 11
            frameRate: 8,
            repeat: -1,
        });
    }

    createTlaceniAnim() {
        const atlasTlaceniData = this.cache.json.get('clovicek-tlaci-atlas');
        const getTlaceniFrames = (prefix, start, end) => {
            const frames = [];
            for (let i = start; i <= end; i++) {
                const frameName = `${prefix}${String(i).padStart(2, '0')}.png`;
                if (atlasTlaceniData?.frames[frameName]) {
                    frames.push({ key: 'clovicek-tlaci-atlas', frame: frameName });
                }
            }
            return frames;
        };
        this.anims.create({
            key: 'animace-tlaceni',
            frames: [ // Ručně definuji pořadí snímků podle tvého JSONu
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
                //{ key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' }
            ],
            frameRate: 5,
            repeat: -1
        });
    }

    createKonecAnim() {
        const atlasKonecData = this.cache.json.get('clovicek-tlaci-atlas'); // Nebo 'clovicek-jde-atlas', záleží kde máš snímek konce
        this.anims.create({
            key: 'animace-konec',
            frames: [{ key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' }], // Uprav podle tvého atlasu a názvu snímku
            frameRate: 4,
            repeat: 0
        });
    }

    create() {
        // 1. Inicializace pozadí
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        // 2. Umístění chlapíka na počáteční pozici
        this.chlapik = this.physics.add.sprite(100, this.scale.height - 345, 'clovicek-jde-atlas').setOrigin(0.5, 1);
        this.chlapik.setBodySize(110, 140).setOffset(-1, -1); // Uprav si body size podle potřeby

        // Vytvoření animací (chůze, tlačení, konečná)
        this.createAnimations();

        // 4. Umístění bedny mimo obrazovku
        this.bedna = this.physics.add.sprite(-100, this.scale.height - 280, 'bedna-sprite').setOrigin(0.5, 1);
        this.bedna.setBodySize(100, 40).setOffset(-1, -1);
        this.bedna.setImmovable(true); // Na začátku je bedna nehybná

        // 3. Pohyb chlapíka mimo obrazovku
        this.moveChlapikOffscreen();

        //Zobrazit pozici mysi
        poziceMysi(this);
    }

    moveChlapikOffscreen() {
        this.chlapik.play('animace-chuze');
        this.tweens.add({
            targets: this.chlapik,
            x: -50, // Pohyb mimo levou stranu obrazovky
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.moveChlapikToBedna();
            }
        });
    }

    moveChlapikToBedna() {
        this.chlapik.flipX = false; // Otočí chlapíka
        this.physics.add.collider(this.chlapik, this.bedna); // Aktivujeme kolizi hned

        this.tweens.add({
            targets: this.chlapik,
            x: this.bedna.x - 200, // Pohyb k bedně
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                this.chlapik.play('animace-tlaceni'); // Spustíme animaci tlačení
                this.bedna.setImmovable(false); // Bedna už není nehybná

                this.tweens.add({
                    targets: [this.chlapik, this.bedna],
                    x: this.scale.width / 2,
                    duration: 5000,
                    ease: 'Linear'
                });
            }
        });
    }

    startPushing() {
        this.chlapik.play('animace-tlaceni');
        this.bedna.setImmovable(false); // Bedna už není nehybná

        this.physics.add.collider(this.chlapik, this.bedna); // Aktivujeme kolizi

        const bednaCilX = this.scale.width / 2 - this.bedna.displayWidth / 2; // Cílová X pro levou stranu bedny ve středu
        const chlapikCilX = bednaCilX - this.chlapik.displayWidth / 2; // Cílová X pro pravou stranu chlapíka u levé strany bedny

        this.tweens.add({
            targets: this.bedna,
            x: bednaCilX,
            duration: 5000,
            ease: 'Linear',
            onUpdate: () => {
                // Během pohybu bedny nastavujeme i pozici chlapíka, aby ji tlačil
                this.chlapik.x = this.bedna.x - this.chlapik.displayWidth / 2;
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