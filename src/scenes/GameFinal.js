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
        this.souradniceFake = "N 50°00.000 E 017°00.000";
        this.souradniceFinal = "N 50°05.111 E 017°20.111";
        this.souradniceZastupne = "N 50°XX.XXX E 017°XX.XXX";
    }

    init() {
        const { height, width } = this.scale.canvas;

        this.posBednaY = height * 0.615;
        this.posChlapikY = this.posBednaY - 25;

        this.physics.world.setBounds(0, 0, width, height);

        const background = this.add.image(500, 390, "backgroundGame");
        background.setScale(0.878, 0.962);
    }

    create() {
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
        this.chlapik.body.setAcceleration(10, 0);
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
            souradniceText: this.add.text(x, 30 + vyskaChlapika / 2 + mezeraNad, this.souradniceFake, {
                font: '48px Georgia',
                align: 'center',
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
            }).setOrigin(0.5).setVisible(false),
            blurFx: null,
            prekryvaCervenou: false,
            prekryvaZelenou: false
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
        this.bedna.body.setImmovable(true);
        this.bedna.body.setVelocity(0, 0);
        this.chlapik.setVelocityX(0);
        this.cilovaZonaData.souradniceText.setText(this.souradniceFinal).setVisible(true);
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
                this.cilovaZonaData.souradniceText.setText(this.souradniceFake).setVisible(false);
                this.hraDokoncena = false;
                this.teleportaceBezi = false;
            }
        });
    }

    muzeKolizovat() {
        return true;
    }

    update() {
        if (this.hraDokoncena) return;

        let tlaci = false;

        const jeKolizeSBednou = Phaser.Geom.Intersects.RectangleToRectangle(
            this.chlapik.getBounds(), this.bedna.getBounds()
        );

        if (this.cursors.left.isDown || this.leftPressed) {
            this.chlapik.setVelocityX(-70);
            this.chlapikAnimace.setFlipX(true);

            if (jeKolizeSBednou) {
                this.chlapikAnimace.play('tlaci', true);
                tlaci = true;
            } else {
                this.chlapikAnimace.play('jde', true);
            }

        } else if (this.cursors.right.isDown || this.rightPressed) {
            this.chlapik.setVelocityX(70);
            this.chlapikAnimace.setFlipX(false);

            if (jeKolizeSBednou) {
                this.chlapikAnimace.play('tlaci', true);
                tlaci = true;
            } else {
                this.chlapikAnimace.play('jde', true);
            }

        } else {
            this.chlapik.setVelocityX(0);
            this.chlapikAnimace.play('stoji', true);
        }

        // --- vyhodnocení zón a zobrazení souřadnic ---
        const isWebGL = this.sys.game.renderer.type === Phaser.WEBGL;
        const bednaBounds = this.bedna.getBounds();
        const cervena = this.cilovaZonaData.cervenaZonaObjekt.getBounds();
        const zelena = this.cilovaZonaData.zelenaZonaObjekt.getBounds();

        const prekryvaCervenou = Phaser.Geom.Intersects.RectangleToRectangle(bednaBounds, cervena);
        const prekryvaZelenou = Phaser.Geom.Intersects.RectangleToRectangle(bednaBounds, zelena);

        const tolerance = 25;
        const vzdalenostStredu = Math.abs(this.bedna.body.center.x - this.cilovaZonaData.zelenaZonaObjekt.x);
        const velocityX = Math.abs(this.bedna.body.velocity.x);

        if (prekryvaCervenou && !prekryvaZelenou) {
            if (isWebGL) {
                this.cilovaZonaData.souradniceText.setText(this.souradniceFake).setVisible(true).setColor('#ff3333');
                if (!this.cilovaZonaData.blurFx) {
                    this.cilovaZonaData.blurFx = this.cilovaZonaData.souradniceText.postFX.addBlur(4);
                } else {
                    this.cilovaZonaData.blurFx.radius = 4;
                }
            } else {
                this.cilovaZonaData.souradniceText.setText(this.souradniceZastupne).setVisible(true).setColor('#ff3333');
                this.cilovaZonaData.souradniceText.setAlpha(0.5);
                this.cilovaZonaData.souradniceText.setShadow(2, 2, "#fff", 6, true, true);
            }
        } else if (prekryvaZelenou && !(vzdalenostStredu < tolerance && velocityX < 5)) {
            if (isWebGL) {
                this.cilovaZonaData.souradniceText.setText(this.souradniceFinal).setVisible(true).setColor('#33ff33');
                if (!this.cilovaZonaData.blurFx) {
                    this.cilovaZonaData.blurFx = this.cilovaZonaData.souradniceText.postFX.addBlur(4);
                } else {
                    this.cilovaZonaData.blurFx.radius = 4;
                }
            } else {
                const realMasked = "N 50°05.XXX E 017°20.XXX";
                this.cilovaZonaData.souradniceText.setText(realMasked).setVisible(true).setColor('#33ff33');
                this.cilovaZonaData.souradniceText.setAlpha(0.5);
                this.cilovaZonaData.souradniceText.setShadow(2, 2, "#fff", 6, true, true);
            }
        } else if (prekryvaZelenou && vzdalenostStredu < tolerance && velocityX < 5) {
            this.cilovaZonaData.souradniceText.setText(this.souradniceFinal).setVisible(true).setColor('#33ff33');
            if (isWebGL && this.cilovaZonaData.blurFx) {
                this.cilovaZonaData.blurFx.radius = 0;
            }
            this.cilovaZonaData.souradniceText.setAlpha(1);
            this.cilovaZonaData.souradniceText.setShadow(0, 0, "#000", 0, false, false);
        } else {
            this.cilovaZonaData.souradniceText.setVisible(false);
            if (isWebGL && this.cilovaZonaData.blurFx) {
                this.cilovaZonaData.blurFx.radius = 0;
            }
            this.cilovaZonaData.souradniceText.setAlpha(1);
            this.cilovaZonaData.souradniceText.setShadow(0, 0, "#000", 0, false, false);
        }

        // --- vyhodnocení cílové zóny ---
        console.log("Kontrola cíle:", {
            prekryvaZelenou,
            vzdalenostStredu,
            velocityX,
            tolerance
        });

        if (prekryvaZelenou && vzdalenostStredu < tolerance && velocityX < 5) {
            this.spustDokonceniHry();
        }

        // --- stopky ---
        if (this.stopkyBezi) {
            this.runningTime = (this.time.now - this.startTime) / 1000;
            this.stopkyText.setText(this.formatCas(this.runningTime));
        }

        // --- teleportace, pokud bedna přejela ---
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
