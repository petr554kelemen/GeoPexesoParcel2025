// 16/5/2025 19:38
window.DEBUG_MODE = true;

import Phaser from 'phaser';
import Napoveda from './UI/napoveda.js';
import ChlapikAnimace from '../objects/ChlapikAnimace.js';

export default class GameFinal extends Phaser.Scene {
    constructor() {
        super('GameFinal');
        this.bedna = null;
        this.chlapik = null;
        this.cursors = null;
        this.napoveda = null;
        this.teleportaceBezi = false;
        this.zneviditelnovaniBezi = false;
        this.zviditelnovaniBezi = false;
        this.hraDokoncena = false;
        this.zacniAnimaciTlaceni = false;
        this.vychoziTreniBedny = 30;
        this.souradniceFake = `N 50°00.000\nE 017°00.000`;
        this.souradniceFinal = `N 50°05.111\nE 017°20.111`;
        this.souradniceZastupne = `N 50°XX.XXX\nE 017°XX.XXX`;
    }

    init(data) {
        const { height, width } = this.scale.canvas;
        this.posBednaY = height * 0.615;
        this.posChlapikY = this.posBednaY - 25;
        this.physics.world.setBounds(0, 0, width, height);
        //const background = this.add.image(500, 390, "backgroundGame");
        //background.setScale(0.878, 0.962);
        this.background = this.add.image(500, 390, "backgroundGame");
        this.background.setScale(0.878, 0.962);
        this.backgroundDefaultX = this.background.x;

        this.preskocIntro = data && data.preskocIntro;
    }

    create() {
        if (this.preskocIntro) {
            this.spustDokonceniHry(); // nebo ekvivalent pro zobrazení finálních souřadnic
            return;
        }
        this.initChlapik();
        this.initBedna();
        this.initCilovaZona();
        this.initControls();
        this.initStopky();
        this.napoveda = new Napoveda(this, this.cilovaZonaData.zelenaZonaObjekt);
        this.startTime = this.time.now;
        this.stopkyBezi = true;
    }

    initStopky() {
        this.startTime = 0;
        this.runningTime = 0;
        this.stopkyBezi = false;
        this.stopkyText = this.add.text(this.cameras.main.width - 20, 20, "0:00:00", {
            font: '24px Arial',
            fill: '#fff',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0);
    }

    initChlapik() {
        this.chlapikAnimace = new ChlapikAnimace(this, 50, this.posChlapikY, 'stoji');
        this.chlapik = this.chlapikAnimace.sprite;
        this.chlapik.body.setCollideWorldBounds(true);
        this.chlapik.body.setBounce(0.1);
        this.chlapik.body.setMass(5);
        this.chlapik.body.setSize(53, 118);
        this.chlapik.body.setOffset(10, 2);
        this.chlapik.body.setMaxSpeed(120);
        this.chlapik.setDepth(100);
    }

    initBedna() {
        this.bedna = this.physics.add.sprite(this.chlapik.x + 100, this.posBednaY, 'pictureBedna');
        this.bedna.setScale(0.6);
        this.bedna.body.setCollideWorldBounds(true);
        this.bedna.body.setBounce(0.05);
        this.bedna.body.setMass(5);
        this.bedna.body.setDrag(this.vychoziTreniBedny);
        this.bedna.body.setSize(96, 96);
        this.bedna.setDepth(99);
        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);
    }

    initCilovaZona() {
        const x = this.scale.width / 2;
        const y = this.bedna.body.center.y;
        const vyskaChlapika = 120;
        const mezeraNad = 30;

        this.cilovaZonaData = {
            xStred: x,
            yStred: y,
            cervenaZonaObjekt: this.add.rectangle(x, y, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.15),
            zelenaZonaObjekt: this.add.rectangle(x, y, 80, 80, 0x00ff00).setOrigin(0.5).setAlpha(0.4),
            // Tento je „fake“ text, bude fade-in na začátku
            souradniceTextFake: this.add.text(this.scale.width / 2, 300, this.souradniceFake, {
                color: "#cc2d2dff",
                fontFamily: "DynaPuff, Arial, sans-serif",
                fontSize: "90px",
                stroke: "#1f1818ff",
                strokeThickness: 3,
                shadow: { offsetX: 4, color: "#060606ff", blur: 5, stroke: true, fill: true },
                align: "center"
            }).setOrigin(0.5, 1).setAlpha(1),
            // Tento je „finální“ text, je nejdříve neviditelný
            souradniceTextFinal: this.add.text(this.scale.width / 2, 300, this.souradniceFinal, {
                color: "#33ff33",
                fontFamily: "DynaPuff, Arial, sans-serif",
                fontSize: "90px",
                stroke: "#1f1818ff",
                strokeThickness: 3,
                align: "center"
            }).setOrigin(0.5, 1).setAlpha(0),
            blurFx: null
        };
    }

    initControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.leftPressed = false;
        this.rightPressed = false;

        const buttonSize = 64;
        const buttonY = this.cameras.main.height - buttonSize / 2 - 40;

        this.buttonLeft = this.add.image(buttonSize / 2 + 40, buttonY, 'arrow')
            .setDisplaySize(64, 64)
            .setAlpha(1).setInteractive().setScrollFactor(0)
            .setFlipX(true);
        this.buttonLeft.on('pointerdown', () => this.leftPressed = true);
        this.buttonLeft.on('pointerup', () => this.leftPressed = false);
        this.buttonLeft.on('pointerout', () => this.leftPressed = false);

        this.buttonRight = this.add.image(this.cameras.main.width - buttonSize / 2 - 40, buttonY, 'arrow')
            .setDisplaySize(64, 64)
            .setAlpha(1).setInteractive().setScrollFactor(0);
        this.buttonRight.on('pointerdown', () => this.rightPressed = true);
        this.buttonRight.on('pointerup', () => this.rightPressed = false);
        this.buttonRight.on('pointerout', () => this.rightPressed = false);
    }

    spustDokonceniHry() {
        this.hraDokoncena = true;

        // Pokud objekty existují, nastav jejich stav (pouze v „herním“ režimu)
        if (this.bedna && this.bedna.body) {
            this.bedna.body.setImmovable(true);
            this.bedna.body.setVelocity(0, 0);
        }
        if (this.chlapik && this.chlapik.body) {
            this.chlapik.setVelocityX(0);
        }

        // Vždy zobraz finální text
        if (this.cilovaZonaData && this.cilovaZonaData.souradniceTextFinal) {
            this.cilovaZonaData.souradniceTextFinal
                .setText(this.souradniceFinal)
                .setAlpha(1)
                .setVisible(true);

            this.tweens.add({
                targets: this.cilovaZonaData.souradniceTextFinal,
                alpha: 1,
                duration: 800,
                ease: "Power2"
            });

            if (this.sys.game.renderer.type === Phaser.WEBGL && this.cilovaZonaData.blurFx) {
                this.cilovaZonaData.souradniceTextFinal.postFX.remove(this.cilovaZonaData.blurFx);
                this.cilovaZonaData.blurFx = null;
            }
            this.cilovaZonaData.souradniceTextFinal.setShadow(0, 0, "#000", 0, false, false);
        } else {
            // Pokud se načítá pouze finální souřadnice (preskocIntro), možná potřebuješ inicializovat text:
            if (!this.cilovaZonaData) {
                // Vytvoř alespoň text a potřebný objekt!
                const x = this.scale.width / 2;
                const y = this.scale.height * 0.615; // orientačně do výšky bedny
                this.cilovaZonaData = {
                    souradniceTextFinal: this.add.text(x, 300, this.souradniceFinal, {
                        color: "#33ff33",
                        fontFamily: "DynaPuff, Arial, sans-serif",
                        fontSize: "90px",
                        stroke: "#1f1818ff",
                        strokeThickness: 3,
                        align: "center"
                    }).setOrigin(0.5, 1).setAlpha(1),
                    blurFx: null
                };
            }
        }
    }




    tweenujText() {
        this.tweens.add({
            targets: this.cilovaZonaData.souradniceText,
            x: this.scale.width / 2,
            alpha: 1,
            duration: 800,
            ease: "Power2",
            yoyo: false
        });
    }

    spustTeleportaci() {
        this.teleportaceBezi = true;
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                this.chlapik.setPosition(50, this.posChlapikY);
                this.bedna.setPosition(this.chlapik.x + 100, this.posBednaY);
                this.chlapik.setAlpha(1);
                this.bedna.setAlpha(1);
                this.bedna.body.setVelocity(0, 0);
                this.bedna.body.setImmovable(false);
                this.background.x = this.backgroundDefaultX;
                //this.cilovaZonaData.souradniceText.setText(this.souradniceFake).setVisible(false);
                //this.hraDokoncena = false;
                //this.teleportaceBezi = false;
                this.cilovaZonaData.souradniceTextFake.setText(this.souradniceFake).setAlpha(1);
                this.cilovaZonaData.souradniceTextFinal.setAlpha(0);
                this.hraDokoncena = false;
                this.teleportaceBezi = false;
            }
        });
    }

    muzeKolizovat() {
        return true;
    }

    update() {
        const isWebGL = this.sys.game.renderer.type === Phaser.WEBGL;

        // Výpočet vzdáleností a rychlosti pro vyhodnocení stavu
        const vzdalenostStredu = Math.abs(this.bedna.body.center.x - this.cilovaZonaData.zelenaZonaObjekt.x);
        const tolerance = 16; // můžeš upravit dle potřeb
        const velocityX = Math.abs(this.bedna.body.velocity.x);

        // Fade-in efekt pro FAKE text (pouze pokud ještě není dokončeno)
        if (!this.hraDokoncena && this.cilovaZonaData.souradniceTextFake) {
            const vzdalenost = vzdalenostStredu;
            const pomer = Phaser.Math.Clamp(1 - vzdalenost / 200, 0, 1);
            this.cilovaZonaData.souradniceTextFake.setAlpha(pomer);
        }

        // Přepnutí na FINÁLNÍ text při zastavení bedny ve zóně
        if (vzdalenostStredu <= tolerance && velocityX <= 5 && !this.hraDokoncena) {
            this.hraDokoncena = true;
            this.bedna.body.setImmovable(true);
            this.bedna.body.setVelocity(0, 0);
            this.chlapik.setVelocityX(0);

            // Znič FAKE text (pokud existuje)
            if (this.cilovaZonaData.souradniceTextFake) {
                this.cilovaZonaData.souradniceTextFake.destroy();
                this.cilovaZonaData.souradniceTextFake = null;
            }

            // Fade-in FINÁLNÍHO textu (pokud existuje)
            if (this.cilovaZonaData.souradniceTextFinal) {
                this.tweens.add({
                    targets: this.cilovaZonaData.souradniceTextFinal,
                    alpha: 1,
                    duration: 800,
                    ease: 'Power2'
                });
                // Odstranění případného rozmazání na textu
                if (isWebGL && this.cilovaZonaData.blurFx) {
                    this.cilovaZonaData.souradniceTextFinal.postFX.remove(this.cilovaZonaData.blurFx);
                    this.cilovaZonaData.blurFx = null;
                }
            }
        }

        // Vložen paralax efect
        if (!this.hraDokoncena && this.background) {
            const paralaxRatio = 0.15; // uprav si sílu efektu dle vkusu
            this.background.x -= this.chlapik.body.velocity.x * paralaxRatio * this.game.loop.delta / 1000;
        }

        // Ovládání chlapíka
        const jeKolizeSBednou = Phaser.Geom.Intersects.RectangleToRectangle(
            this.chlapik.getBounds(), this.bedna.getBounds()
        );

        if (this.cursors.left.isDown || this.leftPressed) {
            this.chlapik.setVelocityX(-70);
            this.chlapikAnimace.setFlipX(true);
            this.chlapikAnimace.play(jeKolizeSBednou ? 'tlaci' : 'jde', true);
        } else if (this.cursors.right.isDown || this.rightPressed) {
            this.chlapik.setVelocityX(70);
            this.chlapikAnimace.setFlipX(false);
            this.chlapikAnimace.play(jeKolizeSBednou ? 'tlaci' : 'jde', true);
        } else {
            this.chlapik.setVelocityX(0);
            this.chlapikAnimace.play('stoji', true);
        }

        // Stopky (časovač)
        if (this.stopkyBezi) {
            this.runningTime = (this.time.now - this.startTime) / 1000;
            this.stopkyText.setText(this.formatCas(this.runningTime));
        }

        // Pokud bedna přejede cílovou zónu doprava (trestná teleportace zpět)
        const vzdalenostZaZonou = this.bedna.body.center.x - this.cilovaZonaData.zelenaZonaObjekt.x;
        if (!this.hraDokoncena && vzdalenostZaZonou > 200 && !this.teleportaceBezi) {
            this.spustTeleportaci();
        }
    }


    formatCas(cas) {
        const min = Math.floor(cas / 60);
        const sek = Math.floor(cas % 60);
        const ms = Math.floor((cas * 100) % 100);
        return `${min}:${sek.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    }
}
