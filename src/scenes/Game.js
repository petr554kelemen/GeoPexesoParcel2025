import { poziceMysi } from "../poziceMysi";

export default class Game extends Phaser.Scene {
    constructor() {
        super("Game");
        this.chlapik = null;
        this.bedna = null;
        this.poziceY = 436;
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
                //{ key: 'clovicek-tlaci-atlas', frame: 'Pic06a.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic07.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic08.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic09.png' },
                { key: 'clovicek-tlaci-atlas', frame: 'Pic10.png' },
                //{ key: 'clovicek-tlaci-atlas', frame: 'Pic11.png' }
            ],
            frameRate: 5,
            repeat: -1,
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
        // 1. Inicializace pozadí
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        // 2. Umístění chlapíka na cílovou počáteční pozici a nastavení alfy na 0 (neviditelný)
        this.chlapik = this.physics.add.sprite(355, this.poziceY, 'clovicek-jde-atlas').setOrigin(0.5, 1);

        //this.chlapik.setOffset(-85, 0);
        this.chlapik.alpha = 0; // Nastavíme průhlednost na 0

        this.createAnimations();

        this.bedna = this.physics.add.sprite(-100, this.poziceY, 'bedna-sprite').setOrigin(0.5, 0);
        //this.bedna.enableBody(-355, this.poziceY);
        //this.bedna.setOffset(350, 0);
        //this.bedna.alpha = 0;
        this.bedna.setImmovable();

        this.bedna.setScale(0.75); // Nastaví scaleX i scaleY na 0.75

        // Postupné zobrazení chlapíka pomocí tweenu
        this.tweens.add({
            y: 436 - this.chlapik.width/2,
            targets: this.chlapik,
            alpha: 1,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
                this.moveChlapikOffscreen(); // Spustíme první pohyb
            }
        });

        poziceYMysi(this);
    }

    moveChlapikOffscreen() {
        this.chlapik.flipX = true;
        this.chlapik.play('animace-chuze');
        this.tweens.add({
            targets: this.chlapik,
            x: -this.chlapik.displayWidth / 2, // Pohyb k levé hranici obrazovky (střed postavy na hranici)
            y: 436,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                this.waveAndVanish(); // Zavoláme novou funkci pro "vlnu" a zmizení
                this.chlapik.flipX = false;
            }
        });
    }

    moveChlapikToBedna() {
        this.chlapik.flipX = false;
        this.tweens.add({
            targets: this.chlapik,
            x: this.bedna.x + 85, // Pohyb těsně k bedně
            y: 436,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
                this.startPushing();
            }
        });
    }

    startPushing() {
        this.chlapik.play('animace-tlaceni');
        //this.bedna.alpha = 1;
        //this.bedna.enableBody(-100, this.poziceY);
        this.bedna.setImmovable();

        //this.physics.add.overlap(this.chlapik, this.bedna);

        const bednaCilX = this.poziceY - this.bedna.displayWidth / 2;

        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            x: bednaCilX,
            y: this.poziceY,
            duration: 7000,
            ease: 'Cubic',
            onUpdate: () => {
                this.chlapik.x = this.bedna.x; // - this.bedna.displayWidth / 2;
            },
            onComplete: () => {
                this.stopAnimation();
            }
        });
    }

    waveAndVanish() {
        // Krátký návrat do viditelné části
        this.tweens.add({
            targets: this.chlapik,
            x: -this.chlapik.displayWidth / 2 + 30, // Posuneme ho o kousek doprava
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true, // Způsobí, že se tween po dosažení cíle přehraje zpět
            onComplete: () => {
                // Po "vlně" spustíme plynulý pohyb na pozici před bednu
                this.tweens.add({
                    targets: this.chlapik,
                    x: -this.bedna.displayWidth / 2 - this.chlapik.displayWidth / 2 + 15 - 50, // poziceY těsně před bednou
                    y: 436,
                    duration: 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.prepareToPush();
                    }
                });
            }
        });
    }

    prepareToPush() {
        this.chlapik.alpha = 1; // Znovu ho zviditelníme
        this.chlapik.play('animace-tlaceni');
        this.bedna.x = -this.bedna.displayWidth / 2 - 150;
        this.bedna.setImmovable(false);
        this.physics.add.overlap(this.chlapik, this.bedna);

        const bednaCilX = this.scale.width / 2;

        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            x: bednaCilX + this.bedna.body,
            duration: 5000,
            ease: 'Linear',
            onComplete: () => {
                this.stopAnimation();
            }
        });
    }

    startMoveWithBedna() {
        // Tuto funkci nyní nebudeme volat přímo z waveAndVanish.
        // Její logika je přesunuta do prepareToPush().
    }

    stopAnimation() {
        this.chlapik.body.setVelocityX(0);
        this.bedna.body.setVelocityX(0);
        this.chlapik.play('animace-konec');

        // Nadpis
        const nadpis = this.add.text(494, 100, "", {});
        nadpis.setOrigin(0.5, 0.5);
        nadpis.text = "Finální souřadnice";
        nadpis.setStyle({ "align": "center", "backgroundColor": "#9bbbdbff", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "47px", "stroke": "#000000", "strokeThickness": 8, "shadow.offsetX": 10, "shadow.offsetY": 10, "shadow.color": "#624c4cff", "shadow.blur": 10, "shadow.fill": true });
        nadpis.setPadding({ "left": 10, "top": 10, "right": 10, "bottom": 10 });

        // textNaE
        const textNaE = this.add.text(281, 300, "", {});
        textNaE.scaleY = 2;
        textNaE.setOrigin(0, 0.5);
        textNaE.text = "N 50°00.000\nE 17°00.000";
        textNaE.setStyle({ "backgroundColor": "", "fontFamily": "Georgia", "fontSize": "62px", "strokeThickness": 1, "shadow.offsetX": 5, "shadow.offsetY": 5, "shadow.color": "#7b6363ff", "shadow.blur": 5, "shadow.fill": true });
        textNaE.setPadding({ "left": 10, "top": 10, "right": 10, "bottom": 10 });
    }

    update(time, delta) {
        // Sem můžeš přidat další logiku, pokud bude potřeba
        //console.log(time, delta);
    }
}