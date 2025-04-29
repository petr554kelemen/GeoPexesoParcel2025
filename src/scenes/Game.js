import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.isPushing = false; // Vlastnost scény pro sledování tlačení
        this.pushStartTime = 0; // Čas začátku tlačení
        this.isChargingPush = false; // Sledujeme, zda hráč drží tlačítko pro "nabití" tahu
        this.chlapik = null;
        this.bedna = null;
        this.moveLeft = false;
        this.moveRight = false;
        this.stopThreshold = null;
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
        this.physics.world.enable(this);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        const bednaScale = 0.7;
        const bednaWidth = 155 * bednaScale;
        const bednaHeight = 120 * bednaScale;
        this.bednaSprite = this.add.sprite(this.scale.width / 2 + 100, 510 - bednaHeight / 2, 'bedna-sprite').setOrigin(0.5).setScale(bednaScale);
        this.physics.add.existing(this.bednaSprite);
        this.bednaSprite.body.setCollideWorldBounds(true);
        this.bednaSprite.body.pushable = true;
        this.bednaSprite.body.linearDamping = .85;
        this.bedna = this.bednaSprite;

        this.chlapikSprite = this.add.sprite(0, 0, 'clovicek-jde-atlas').setOrigin(0.5, 1); // Dočasné pozice
        this.createAnimations();
        this.chlapikSprite.play('animace-chuze', true);
        this.physics.add.existing(this.chlapikSprite);
        this.chlapikSprite.body.setSize(18, 100).setOffset(0, 0);
        this.chlapik = this.chlapikSprite;

        const nahodnaPoziceChlapika = this.najdiNahodnouPoziciProChlapika(); // Voláme funkci AŽ TEĎ
        this.chlapik.setPosition(nahodnaPoziceChlapika.x, nahodnaPoziceChlapika.y);

        this.collider = this.physics.add.collider(this.chlapikSprite, this.bednaSprite, this.handleCollision, null, this);

        // Odskok bedny od okraje
        this.physics.world.on('worldbounds', (body) => {
            if (body === this.bednaSprite.body) {
                const pushBackSpeed = 50;
                const stopDelay = 600;
                if (body.blocked.left) {
                    body.setVelocityX(pushBackSpeed);
                    this.chlapikSprite.body.setVelocityX(0);
                    this.isPushing = false;
                    this.time.delayedCall(stopDelay, () => {
                        if (this.bednaSprite.body && this.bednaSprite.body.velocity.x > 0) {
                            this.bednaSprite.body.setVelocityX(0);
                        }
                    });
                } else if (body.blocked.right) {
                    body.setVelocityX(-pushBackSpeed);
                    this.chlapikSprite.body.setVelocityX(0);
                    this.isPushing = false;
                    this.time.delayedCall(stopDelay, () => {
                        if (this.bednaSprite.body && this.bednaSprite.body.velocity.x < 0) {
                            this.bednaSprite.body.setVelocityX(0);
                        }
                    });
                }
            }
        });

        const targetZoneX = this.scale.width / 2;
        const targetZoneY = 510;
        const targetZoneWidth = 150;
        const targetZoneHeight = this.bednaSprite.height * this.bednaSprite.scaleY;
        this.targetZone = this.add.rectangle(targetZoneX, targetZoneY, targetZoneWidth, targetZoneHeight, 0x00ff00, 0.3).setOrigin(0.5, 0.5);
        this.physics.world.enable(this.targetZone);
        this.targetZone.body.setImmovable(true);
        this.targetZoneActive = false;
        this.coordinatesText = this.add.text(10, 60, '', { fontSize: '16px', fill: '#fff' });
        this.physics.add.overlap(this.bednaSprite, this.targetZone, this.handleBednaOverlapTarget, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        const buttonY = this.scale.height - 50;
        const buttonScale = 0.5;
        this.leftButton = this.add.image(50, buttonY, 'arrow_left').setInteractive().setAlpha(0.8).setScale(buttonScale).on('pointerdown', () => this.moveLeft = true).on('pointerup', () => this.moveLeft = false).on('pointerout', () => this.moveLeft = false);
        this.rightButton = this.add.image(this.scale.width - 50, buttonY, 'arrow_right').setInteractive().setAlpha(0.8).setScale(buttonScale).on('pointerdown', () => this.moveRight = true).on('pointerup', () => this.moveRight = false).on('pointerout', () => this.moveRight = false);
        this.chlapikInfoText = this.add.text(10, 20, '', { fontSize: '16px', fill: '#fff' });
    }

    update(time, delta) {
        this.chlapik.body.setVelocityX(0); // SPRÁVNĚ
        this.chlapik.body.setVelocityY(0);
        const deltaTime = delta / 1000; // Převod delta na sekundy

        // Synchronizace pozice spritu chlapíka s jeho fyzickým tělem
        this.chlapik.x = this.chlapik.body.x;
        this.chlapik.y = this.chlapik.body.y;

        // Synchronizace pozice spritu bedny s jejím fyzickým tělem
        this.bednaSprite.x = this.bednaSprite.body.x;
        this.bednaSprite.y = this.bednaSprite.body.y;

        const isMovingManually = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown || this.moveLeft || this.moveRight;
        const manualSpeed = 160;

        if (this.cursors.left.isDown || this.moveLeft) {
            this.chlapik.setVelocityX(-manualSpeed);
            this.chlapik.flipX = true;
            if (this.isPushing) {
                this.pushDirectionX = -1;
                if (!this.isChargingPush && this.collider && this.collider.active) {
                    this.isChargingPush = true;
                    this.pushStartTime = time;
                    // console.log('Začátek nabíjení tahu (LEFT)...');
                }
                this.chlapik.play('animace-tlaceni', true);
            } else {
                this.chlapik.play('animace-chuze', true);
            }
        } else if (this.cursors.right.isDown || this.moveRight) {
            this.chlapik.setVelocityX(manualSpeed);
            this.chlapik.flipX = false;
            if (this.isPushing) {
                this.pushDirectionX = 1;
                if (!this.isChargingPush && this.collider && this.collider.active) {
                    this.isChargingPush = true;
                    this.pushStartTime = time;
                    // console.log('Začátek nabíjení tahu (RIGHT)...');
                }
                this.chlapik.play('animace-tlaceni', true);
            } else {
                this.chlapik.play('animace-chuze', true);
            }
        } else {
            this.chlapik.stop('animace-chuze');
            this.chlapik.stop('animace-tlaceni');
            if (this.isChargingPush) {
                this.isChargingPush = false;
                const pushDuration = time - this.pushStartTime;
                //this.applyPushImpulse(pushDuration, this.pushDirectionX);
                //console.log('Konec nabíjení tahu... Aplikován impuls.');
            }
        }

        if (this.collider) {
            console.log('Stav collideru v update:', this.collider.active);
        }



        // Ruční aktualizace pozice bedny
        //this.bedna.x += this.bedna.body.velocity.x * deltaTime;
        //this.bedna.y += this.bedna.body.velocity.y * deltaTime;

        // Ruční aktualizace pozice chlapíka
        // this.chlapik.x += this.chlapik.body.velocity.x * deltaTime;
        // this.chlapik.y += this.chlapik.body.velocity.y * deltaTime;

        //console.log('isPushing:', this.isPushing);

        /*
        if (this.cursors.left.isDown || this.moveLeft) {
            this.chlapik.setVelocityX(-manualSpeed);
            this.chlapik.flipX = true;
            if (this.isPushing) {
                this.pushDirectionX = -1;
                if (!this.isChargingPush && this.collider && this.collider.active) {
                    this.isChargingPush = true;
                    this.pushStartTime = time;
                    this.chlapikPocatecniPoziceXPriTahu = this.chlapik.x;
                    this.collider.active = false;
                    //console.log('Začátek nabíjení tahu (LEFT)...');
                }
            } else {
                this.chlapik.play('animace-chuze', true);
            }
        } else if (this.cursors.right.isDown || this.moveRight) {
            this.chlapik.setVelocityX(manualSpeed);
            this.chlapik.flipX = false;
            if (this.isPushing) {
                this.pushDirectionX = 1;
                if (!this.isChargingPush && this.collider && this.collider.active) {
                    this.isChargingPush = true;
                    this.pushStartTime = time;
                    this.chlapikPocatecniPoziceXPriTahu = this.chlapik.x;
                    this.collider.active = false;
                    // console.log('Začátek nabíjení tahu (RIGHT)...');
                }
            } else {
                this.chlapik.play('animace-chuze', true);
            }
        } else {
            this.chlapik.stop('animace-chuze');
            this.isPushing = false; // Nastavujeme na false, když se hráč nehýbe
            if (this.isChargingPush) {
                this.isChargingPush = false;
                const pushDuration = time - this.pushStartTime;
                const pohybBehemTahu = Math.abs(this.chlapik.x - this.chlapikPocatecniPoziceXPriTahu);

                if (pushDuration >= this.casMinProTlak && pohybBehemTahu >= this.pohybMinProTlak) {
                    this.applyPushImpulse(pushDuration, this.pushDirectionX);
                } else {
                    // console.log('Tlak zrušen: příliš krátký stisk nebo malý pohyb.');
                }

                if (this.collider) {
                    this.collider.active = true;
                    this.collider = this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);
                    // console.log('Konec nabíjení tahu... Collider aktivován a kolize znovu nastavena.');
                }
            }
        }
        */

        /*
        const bednaBounds = this.bedna.getBounds();
        const targetZoneRect = this.targetZone.getBounds();

        if (Phaser.Geom.Rectangle.Overlaps(bednaBounds, targetZoneRect)) {
            if (!this.targetZoneActive) {
                this.coordinatesText.setText(`Souřadnice bedny: X: ${Math.floor(this.bedna.x)}, Y: ${Math.floor(this.bedna.y)}`);
                this.targetZoneActive = true;
            }
        } else {
            this.coordinatesText.setText('');
            this.targetZoneActive = false;
        }
        */
        // console.log('Souřadnice bedny v update: X:', this.bedna.x, 'Y:', this.bedna.y);
        // console.log('isPushing:', this.isPushing);
        //this.zkontrolujDosahCile();
    }

    applyPushImpulse(duration, directionX = 0) {
        /*
        if (this.bedna && this.bedna.body) {
            const fixedDuration = 150; // Dočasná konstanta pro dobu trvání (ms)
            const pushForce = fixedDuration / 500;
            const impulseVelocity = this.pushDirectionX * pushForce * 20;
            //console.log('Dočasná duration:', fixedDuration, 'pushForce:', pushForce, 'impulseVelocity:', impulseVelocity);
            this.bedna.body.setVelocityX(impulseVelocity);
            this.bedna.body.setVelocityY(0);
            //console.log('Aplikován impuls (s pevnou dobou), velocity:', impulseVelocity);
        }
        */

        if (this.bedna && this.bedna.body) {
            const pushForce = duration / 150; // Uprav tento faktor pro sílu impulsu
            const impulseVelocity = directionX * pushForce * 200; // Uprav tento faktor pro rychlost
            console.log('Doba stisku:', duration, 'Síla:', pushForce, 'Rychlost impulsu:', impulseVelocity);
            this.bedna.body.setVelocityX(impulseVelocity);
            this.bedna.body.setVelocityY(0);
        }
    }

    handleCollision(chlapik, bedna) {
        console.log("handleCollision se volá!");
        this.isPushing = true;
    }

    handleBednaOverlapTarget(bedna, targetZone) {
        //console.log('Bedna se překrývá s cílovou zónou!');
        // Zde můžeme později přidat logiku pro úspěch, například zastavení bedny, zobrazení zprávy atd.
        // Prozatím můžeme bednu zastavit, aby "nezmizela" za zónou:
        // bedna.body.setVelocityX(0);
    }

    //prozatím zakomentováno
    /*
    zkontrolujDosahCile() {
        const targetLeft = this.targetZone.x - this.targetZone.width / 2;
        const targetRight = this.targetZone.x + this.targetZone.width / 2;
        const bednaStredX = this.bedna.x;
        const toleranceRychlosti = 5; // Nastav si malou toleranci pro "stání"

        if (bednaStredX >= targetLeft && bednaStredX <= targetRight && Math.abs(this.bedna.body.velocity.x) < toleranceRychlosti) {
            //console.log('Bedna je v cílové zóně a stojí!');
            this.bedna.body.setVelocityX(0); // Pro jistotu zastavíme
            // this.gameWon();
            this.targetZoneActive = true;
        } else {
            this.targetZoneActive = false;
        }
    }
    */

}