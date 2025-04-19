export default class Game extends Phaser.Scene {
    constructor() {
        super("Game");
        this.chlapik = null;
        this.bedna = null;
    }

    preload() {
        this.load.atlas('clovicek-jde-atlas', 'assets/animace/clovicek_jde.png', 'assets/animace/clovicek_jde_atlas.json');
        this.load.atlas('clovicek-tlaci-sprite', 'assets/animace/clovicek_tlaci.png', 'assets/animace/clovicek_tlaci.json');
        this.load.image('bedna-sprite', 'assets/bedna.png'); // Předpokládám, že máš obrázek bedny
        this.load.image('backgroundGame', 'assets/images/freepikBackground.png'); // Předpokládám, že máš pozadí
    }

    create() {
        // 1. Inicializace pozadí
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        // 2. Umístění chlapíka na počáteční pozici
        this.chlapik = this.physics.add.sprite(100, this.scale.height - 100, 'clovicek-jde-atlas').setOrigin(0.5, 1);
        this.chlapik.setBodySize(110, 140).setOffset(-25, -100); // Uprav si body size podle potřeby

        // Vytvoření animací (chůze, tlačení, konečná)
        this.createAnimations();

        // 4. Umístění bedny mimo obrazovku
        this.bedna = this.physics.add.sprite(-50, this.scale.height - 150, 'bedna-sprite').setOrigin(0.5, 1);
        this.bedna.setImmovable(true); // Na začátku je bedna nehybná

        // 3. Pohyb chlapíka mimo obrazovku
        this.moveChlapikOffscreen();
    }

    createAnimations() {
        const atlasData = this.cache.json.get('clovicek-jde-atlas'); // Získání načtených dat z atlasu

        // Funkce pro extrahování názvů snímků pro daný rozsah
        const getFrames = (start, end, prefix = 'clovicek_') => {
            const frames = [];
            for (let i = start; i <= end; i++) {
                const filename = `${prefix}${i}`;
                const frameData = atlasData.frames.find(f => f.filename === filename);
                if (frameData) {
                    frames.push({ key: 'clovicek-jde-atlas', frame: filename });
                }
            }
            return frames;
        };

        this.anims.create({
            key: 'animace-chuze',
            frames: getFrames(1, 10, "clovicek_"),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'animace-tlaceni',
            frames: this.anims.generateFrameNumbers('clovicek-tlaci-atlas', { start: 0, end: 10 }), // Uprav si rozsah snímků
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'animace-konec',
            frames: this.anims.generateFrameNumbers('clovicek-tlaci-sprite', { start: 10, end: 11 }), // Uprav si rozsah snímků
            frameRate: 4,
            repeat: 0
        });
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
        this.chlapik.flipX = true; // Otočí chlapíka
        this.tweens.add({
            targets: this.chlapik,
            x: this.bedna.x + 100, // Pohyb k bedně
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                this.startPushing();
            }
        });
    }

    startPushing() {
        this.chlapik.play('animace-tlaceni');
        this.bedna.setImmovable(false); // Bedna už není nehybná

        this.physics.add.collider(this.chlapik, this.bedna); // Aktivujeme kolizi

        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            x: this.scale.width / 2,
            duration: 5000,
            ease: 'Linear',
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