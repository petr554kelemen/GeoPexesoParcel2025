// 16/5/2025 19:38
/**
 * GameFinal Scene – logická mapa
 * 
 * Pořadí a závislosti:
 * 
 * 1. init(data)
 *    - Rozpozná, jestli má běžet režim „pouze souřadnice“ (preskocIntro)
 *    - Nastaví pozice, fyziku, pozadí (pokud není preskocIntro)
 * 
 * 2. create()
 *    - Pokud preskocIntro: zobrazí pouze souřadnice + tlačítko zpět, ukončí scénu
 *    - Jinak spouští herní režim:
 *        - initChlapik()
 *        - initBedna()
 *        - initCilovaZona()
 *        - initControls()
 *        - initStopky()
 *        - Napoveda
 *        - startTime, stopkyBezi
 * 
 * 3. update()
 *    - Jen v herním režimu (preskocIntro === false)
 *    - Sleduje stav hry: pohyb bedny, chlapíka, kolize, čas, zónu
 *    - Přepíná texty, spouští efekty, řeší dokončení nebo teleportace
 * 
 * Další klíčové funkce:
 *    - spustDokonceniHry() – zobrazí finální souřadnice
 *    - spustTeleportaci() – vrací objekty na start
 *    - tweenujText(), formatCas()
 *
 * Vstupní bod: create()
 * Výstup: Zobrazení souřadnic / dokončení hry / možnost restartu
 */

window.DEBUG_MODE = false;

import Phaser from 'phaser';
import Napoveda from './UI/napoveda.js';
import ChlapikAnimace from '../objects/ChlapikAnimace.js';
import { addFullscreenAndLandscape } from "../utils/fullscrandlandscape"; // <-- přidat
import { getSafeZones, showSafeZonesDebug, positionSafely, isPositionSafe } from "../utils/safeZones.js"; // <-- NOVÉ

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
        this.locale = null;
        this.textsByLocale = null;
        this.safeZones = null; // <-- NOVÉ: safe zones cache
        this.debugMode = false; // <-- NOVÉ: debug režim - nastavte na true pro ladění!
        
        // RYCHLÝ DEBUG TOGGLE: Zapnout při vývoji, vypnout pro produkci
        // this.debugMode = true; // <-- odkomentujte pro zobrazení safe zones
    }

    getLocaleTexts() {
        const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        if (lang.startsWith('cs') || lang.startsWith('sk')) return 'cs';
        if (lang.startsWith('pl')) return 'pl';
        return 'en';
    }

    getTextsByLocale(locale) {
        return {
            cs: {
                back: "↩️ Hrát znovu"
            },
            pl: {
                back: "↩️ Zagraj ponownie"
            },
            en: {
                back: "↩️ Play again"
            }
        }[locale];
    }

    init(data) {
        this.preskocIntro = data?.preskocIntro;
        if (!this.preskocIntro) {
            const { height, width } = this.scale.canvas;
            this.posBednaY = height * 0.615;
            this.posChlapikY = this.posBednaY - 25;
            this.physics.world.setBounds(0, 0, width, height);
            this.background = this.add.image(500, 390, "backgroundGame");
            this.background.setScale(0.878, 0.962);
            this.backgroundDefaultX = this.background.x;

            // Pokud už nemáš někde v create():
            this.background = this.add.tileSprite(
                this.scale.width / 2,
                this.scale.height / 2,
                this.scale.width,
                this.scale.height,
                'backgroundGame'
            );
            this.background.setDepth(0);
        }
    }

    create() {
        this.locale = this.getLocaleTexts();
        this.textsByLocale = this.getTextsByLocale(this.locale);

        // === INICIALIZACE SAFE ZONES ===
        this.safeZones = getSafeZones(this, {
            // Můžete přepsat výchozí marginy podle potřeby
            mobile: { top: 70, bottom: 100, left: 20, right: 20 }
        });
        
        // DEBUG: Zobrazení safe zones (nastavte na true pro ladění)
        if (this.debugMode) {
            this.debugOverlay = showSafeZonesDebug(this, this.safeZones, {
                showMargins: true,
                showGrid: true,
                alpha: 0.2
            });
        }

        // === MINIMALISTICKÝ REŽIM: Pouze souřadnice ===
        if (this.preskocIntro) {
            this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xffffff, 0.98);

            this.add.text(this.scale.width / 2, this.scale.height / 2, this.souradniceFinal, {
                color: "#33ff33",
                fontFamily: "DynaPuff, Arial, sans-serif",
                fontSize: "90px",
                stroke: "#1f1818ff",
                strokeThickness: 3,
                align: "center"
            }).setOrigin(0.5);

            // Lokalizované tlačítko zpět/hrát znovu
            const btn = this.add.text(0, 0, this.textsByLocale.back, {
                fontSize: 36, color: "#444", backgroundColor: "#fff", padding: { x: 24, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            // Použití safe zones pro pozicionování
            positionSafely(btn, 'bottomCenter', this.safeZones, { x: 0, y: -20 });
            
            btn.on('pointerdown', () => {
                localStorage.removeItem('cilSplnen');
                this.scene.start('Game');
            });
            return;
        }

        // === HERNÍ REŽIM (plná logika) ===
        this.initChlapik();
        this.initBedna();
        this.initCilovaZona();
        this.initControls();
        this.initStopky();
        this.napoveda = new Napoveda(this, this.cilovaZonaData.zelenaZonaObjekt);
        this.startTime = this.time.now;
        this.stopkyBezi = true;

        // Přidání fullscreen tlačítka a kontroly landscape (pouze Android)
        addFullscreenAndLandscape(this, 'fullscreen');
    }

    initStopky() {
        this.startTime = 0;
        this.runningTime = 0;
        this.stopkyBezi = false;
        
        // BEZPEČNÉ umístění stopek
        this.stopkyText = this.add.text(0, 0, "0:00:00", {
            font: '24px Arial',
            fill: '#fff',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0);
        
        // Použití safe zones
        positionSafely(this.stopkyText, 'topRight', this.safeZones, { x: -10, y: 5 });
    }

    initChlapik() {
        this.chlapikAnimace = new ChlapikAnimace(this, 50, this.posChlapikY + 40, 'stoji');
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
        this.bedna = this.physics.add.sprite(this.chlapik.x + 100, this.posBednaY + 40, 'bedna', 0);
        this.bedna.setScale(0.6);
        this.bedna.body.setCollideWorldBounds(true);
        this.bedna.body.setBounce(0.05);
        this.bedna.body.setMass(5);
        this.bedna.body.setDrag(this.vychoziTreniBedny);
        this.bedna.body.setSize(48, 48);
        this.bedna.setDepth(99);
        this.physics.add.collider(this.chlapik, this.bedna, null, this.muzeKolizovat, this);
    }

    initCilovaZona() {
        const x = this.scale.width / 2;
        const y = this.bedna.body.center.y + 40;
        this.cilovaZonaData = {
            xStred: x,
            yStred: y,
            cervenaZonaObjekt: this.add.rectangle(x, y, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.15),
            zelenaZonaObjekt: this.add.rectangle(x, y, 40, 40, 0x00ff00).setOrigin(0.5).setAlpha(0.4),
            souradniceTextFake: this.add.text(this.scale.width / 2, 300, this.souradniceFake, {
                color: "#cc2d2dff",
                fontFamily: "DynaPuff, Arial, sans-serif",
                fontSize: "90px",
                stroke: "#1f1818ff",
                strokeThickness: 3,
                align: "center"
            }).setOrigin(0.5, 1).setAlpha(1),
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
        
        // BEZPEČNÉ umístění ovládacích tlačítek
        this.buttonLeft = this.add.image(0, 0, 'arrow')
            .setDisplaySize(buttonSize, buttonSize)
            .setAlpha(1).setInteractive().setScrollFactor(0)
            .setFlipX(true);
        
        this.buttonRight = this.add.image(0, 0, 'arrow')
            .setDisplaySize(buttonSize, buttonSize)
            .setAlpha(1).setInteractive().setScrollFactor(0);
        
        // Použití safe zones pro pozicování
        positionSafely(this.buttonLeft, 'bottomLeft', this.safeZones, { x: 40, y: -40 });
        positionSafely(this.buttonRight, 'bottomRight', this.safeZones, { x: -40, y: -40 });
        
        // KONTROLA: Varování pokud jsou tlačítka mimo safe zone
        if (this.debugMode) {
            const leftSafe = isPositionSafe(this.buttonLeft.x, this.buttonLeft.y, this.safeZones);
            const rightSafe = isPositionSafe(this.buttonRight.x, this.buttonRight.y, this.safeZones);
            
            if (!leftSafe) console.warn('⚠️ Left button may be hidden by UI elements!');
            if (!rightSafe) console.warn('⚠️ Right button may be hidden by UI elements!');
        }
        
        // ...existing event handlers...
        this.buttonLeft.on('pointerdown', () => this.leftPressed = true);
        this.buttonLeft.on('pointerup', () => this.leftPressed = false);
        this.buttonLeft.on('pointerout', () => this.leftPressed = false);
        this.buttonRight.on('pointerdown', () => this.rightPressed = true);
        this.buttonRight.on('pointerup', () => this.rightPressed = false);
        this.buttonRight.on('pointerout', () => this.rightPressed = false);
    }

    spustDokonceniHry() {
        this.hraDokoncena = true;
        localStorage.setItem('cilSplnen', '1');

        if (this.bedna?.body) {
            this.bedna.body.setImmovable(true);
            this.bedna.body.setVelocity(0, 0);
            this.bedna.setFrame(1, true, true);
        }
        if (this.chlapik?.body) {
            this.chlapik.setVelocityX(0);
        }
        if (this.cilovaZonaData?.souradniceTextFinal) {
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
        }
        // Pokud se načítá pouze finální souřadnice (preskocIntro), možná potřebuješ inicializovat text:
        if (!this.cilovaZonaData) {
            const x = this.scale.width / 2;
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
                this.background.tilePositionX = 0;
                this.chlapik.setPosition(50, this.posChlapikY);
                this.bedna.setPosition(this.chlapik.x + 100, this.posBednaY);
                this.chlapik.setAlpha(1);
                this.bedna.setAlpha(1);
                this.bedna.body.setVelocity(0, 0);
                this.bedna.body.setImmovable(false);
                if (this.cilovaZonaData.souradniceTextFake) {
                    this.cilovaZonaData.souradniceTextFake.setText(this.souradniceFake).setAlpha(1);
                }
                if (this.cilovaZonaData.souradniceTextFinal) {
                    this.cilovaZonaData.souradniceTextFinal.setAlpha(0);
                }
                this.hraDokoncena = false;
                this.teleportaceBezi = false;
            }
        });
    }

    muzeKolizovat() {
        return true;
    }

    update() {
        if (this.preskocIntro) return; // Minimalistický režim neprovádí update!
        const isWebGL = this.sys.game.renderer.type === Phaser.WEBGL;
        const vzdalenostStredu = Math.abs(this.bedna.body.center.x - this.cilovaZonaData.zelenaZonaObjekt.x);
        const tolerance = 16;
        const velocityX = Math.abs(this.bedna.body.velocity.x);

        this.updateSouradniceTextFake(vzdalenostStredu);

        if (this.shouldCompleteGame(vzdalenostStredu, tolerance, velocityX)) {
            this.handleGameCompletion(isWebGL);
        }

        this.handleMovement();

        this.updateStopky();

        this.checkTeleportation();

        this.updateBackgroundScroll();
    }

    updateSouradniceTextFake(vzdalenostStredu) {
        if (!this.hraDokoncena && this.cilovaZonaData.souradniceTextFake) {
            const pomer = Phaser.Math.Clamp(1 - vzdalenostStredu / 200, 0, 1);
            this.cilovaZonaData.souradniceTextFake.setAlpha(pomer);
        }
    }

    shouldCompleteGame(vzdalenostStredu, tolerance, velocityX) {
        return vzdalenostStredu <= tolerance && velocityX <= 5 && !this.hraDokoncena;
    }

    handleGameCompletion(isWebGL) {
        this.spustDokonceniHry();
        this.bedna.body.setImmovable(true);
        this.bedna.body.setVelocity(0, 0);
        this.chlapik.setVelocityX(0);
        if (this.cilovaZonaData.souradniceTextFake) {
            this.cilovaZonaData.souradniceTextFake.destroy();
            this.cilovaZonaData.souradniceTextFake = null;
        }
        if (this.cilovaZonaData.souradniceTextFinal) {
            this.tweens.add({
                targets: this.cilovaZonaData.souradniceTextFinal,
                alpha: 1,
                duration: 800,
                ease: 'Power2'
            });
            if (isWebGL && this.cilovaZonaData.blurFx) {
                this.cilovaZonaData.souradniceTextFinal.postFX.remove(this.cilovaZonaData.blurFx);
                this.cilovaZonaData.blurFx = null;
            }
        }
    }

    handleMovement() {
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
    }

    updateStopky() {
        if (this.stopkyBezi) {
            this.runningTime = (this.time.now - this.startTime) / 1000;
            this.stopkyText.setText(this.formatCas(this.runningTime));
        }
    }

    checkTeleportation() {
        const vzdalenostZaZonou = this.bedna.body.center.x - this.cilovaZonaData.zelenaZonaObjekt.x;
        if (!this.hraDokoncena && vzdalenostZaZonou > 200 && !this.teleportaceBezi) {
            this.spustTeleportaci();
        }
    }

    updateBackgroundScroll() {
        if (this.chlapik?.body && !this.hraDokoncena) {
            if (this.chlapik.body.velocity.x !== 0) {
                this.background.tilePositionX -= (this.chlapik.body.velocity.x * 0.003) * (-1);
            }
        }
    }

    formatCas(cas) {
        const min = Math.floor(cas / 60);
        const sek = Math.floor(cas % 60);
        const ms = Math.floor((cas * 100) % 100);
        return `${min}:${sek.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    }
}
