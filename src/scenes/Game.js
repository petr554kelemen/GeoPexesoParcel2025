import Phaser from 'phaser';
import { poziceMysi } from '../poziceMysi.js';

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
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGame');

        const bednaScale = 0.7;
        this.bedna = this.physics.add.sprite(this.scale.width / 2 + 100, 510, 'bedna-sprite');
        this.bedna.setOrigin(0, 1);
        this.bedna.setScale(bednaScale);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.body.pushable = true;
        this.bedna.body.linearDamping = 0.3;
        this.bedna.body.setSize(155, 120).setOffset(0, -30);
        this.bedna.body.setMass(2); // Nebo zkus i vyšší hodnotu, např. 3 nebo 4
        this.bedna.body.setGravity(0, 0);
        this.bedna.body.setDamping(false);
        this.bedna.body.slideFactor.set(0.15);

        console.log(this.bedna.body.x);

        this.chlapik = this.physics.add.sprite(0, 0, 'clovicek-jde-atlas');
        this.chlapik.setOrigin(0.5, 1);
        this.chlapik.body.setSize(18, 100);
        this.chlapik.body.setGravity(0, 0);
        this.chlapik.body.setMass(2); // Nebo zkus i vyšší hodnotu, např. 3 nebo 4
        this.chlapik.setCollideWorldBounds(true);
        this.chlapik.body.slideFactor.set(0.5);
        const nahodnaPoziceChlapika = this.najdiNahodnouPoziciProChlapika();
        this.chlapik.setPosition(nahodnaPoziceChlapika.x, nahodnaPoziceChlapika.y);

        this.pushDirectionX = 1;

        this.collider = this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);
        //console.log('Hodnota this.collider po vytvoření:', this.collider); // Přidaný log

        this.createAnimations();

        // Odskok bedny od okraje
        this.bedna.body.onWorldBounds = true;
        const bounceSpeed = 5; // Nastavíme sílu odrazu


        this.physics.world.on('worldbounds', (body) => {
            //console.log("body:", body);
            if (body.gameObject === this.bedna) {
                if (body.blocked.left) {
                    body.setVelocityX(bounceSpeed);
                    this.chlapik.body.setVelocityX(0); // Zde nulujeme rychlost chlapíka na ose X
                    this.isPushing = false;
                } else if (body.blocked.right) {
                    body.setVelocityX(-bounceSpeed);
                    this.chlapik.body.setVelocityX(0); // Zde nulujeme rychlost chlapíka na ose X
                    this.isPushing = false;
                }
                // Vertikální odraz prozatím vynecháme
            }
        });


        const targetZoneX = this.scale.width / 2;
        const targetZoneY = 510; // Zhruba Y pozice bedny
        const targetZoneWidth = 150; // Nastav si požadovanou šířku
        const targetZoneHeight = this.bedna.height; // Nastav si požadovanou výšku

        this.targetZone = this.add.rectangle(targetZoneX, targetZoneY, targetZoneWidth, targetZoneHeight, 0x00ff00, 0.3).setOrigin(0.5, 0.5);
        this.physics.world.enable(this.targetZone);
        this.targetZone.body.setImmovable(true); // Nastavíme jako statické těleso

        this.targetZoneActive = false; // Proměnná pro sledování, zda je bedna v zóně
        this.coordinatesText = this.add.text(10, 60, '', { fontSize: '16px', fill: '#fff' });

        // Sledujeme překryv bedny a cílové zóny
        this.physics.add.overlap(this.bedna, this.targetZone, this.handleBednaOverlapTarget, null, this);

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
        const deltaTime = delta / 1000; // Převod delta na sekundy

        const isMovingManually = this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown || this.moveLeft || this.moveRight;
        const manualSpeed = 160;

        // Ruční aktualizace pozice bedny
        //this.bedna.x += this.bedna.body.velocity.x * deltaTime;
        //this.bedna.y += this.bedna.body.velocity.y * deltaTime;

        // Ruční aktualizace pozice chlapíka
        // this.chlapik.x += this.chlapik.body.velocity.x * deltaTime;
        // this.chlapik.y += this.chlapik.body.velocity.y * deltaTime;

        console.log('isPushing:', this.isPushing);

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
        this.zkontrolujDosaženíCíle();
    }

    applyPushImpulse(duration, directionX = 0) {
        if (this.bedna && this.bedna.body) {
            const fixedDuration = 150; // Dočasná konstanta pro dobu trvání (ms)
            const pushForce = fixedDuration / 500;
            const impulseVelocity = this.pushDirectionX * pushForce * 20;
            //console.log('Dočasná duration:', fixedDuration, 'pushForce:', pushForce, 'impulseVelocity:', impulseVelocity);
            this.bedna.body.setVelocityX(impulseVelocity);
            this.bedna.body.setVelocityY(0);
            //console.log('Aplikován impuls (s pevnou dobou), velocity:', impulseVelocity);
        }
    }

    handleCollision(chlapik, bedna) {
        // console.log("DOŠLO KE KOLIZI! isPushing nastaveno na true");
        // console.trace('Zásobník volání handleCollision:');
        this.isPushing = true;
    }

    handleBednaOverlapTarget(bedna, targetZone) {
        console.log('Bedna se překrývá s cílovou zónou!');
        // Zde můžeme později přidat logiku pro úspěch, například zastavení bedny, zobrazení zprávy atd.
        // Prozatím můžeme bednu zastavit, aby "nezmizela" za zónou:
        // bedna.body.setVelocityX(0);
    }

    zkontrolujDosaženíCíle() {
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

}