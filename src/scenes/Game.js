// 1/5/2025 17:38
import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';
import Napoveda from './UI/napoveda.js'; // Uprav cestu podle tvé struktury
import ChlapikAnimace from '../objects/ChlapikAnimace.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.bedna = null;
        this.chlapik = null;
        this.cursors = null;
        this.rychlostChlapikaText = null;
        this.rychlostBednyText = null;
        this.tlaceniZacatek = null;
        this.vychoziTreniBedny = 38;
        this.zneviditelnovaniBezi = false;
        this.zviditelnovaniBezi = false;
        this.hraDokoncena = false;
        this.teleportaceBezi = false; // Nezapomeň inicializovat tuto proměnnou
        this.napoveda = null;
        this.tlaciSmer = null;
        this.pocetUpdate = 0;

        //nastavíme flags pro přepínání animací
        this.jeAnimaceTlaceniAktivni = false;
        this.pocetSnímkuOdTlaceni = 0;
        this.minimalniDobaTlaceni = 10;

        this.jeAnimaceBehuAktivni = false;
        this.pocetSnímkuOdBehu = 0;
        this.minimalniDobaBehu = 5;
        this.posledniAnimace = 'stoji';

        this.dotykaSeBedny = false; // Stav dotyku v aktuálním snímku
        this.predchoziDotykBedny = false; // Stav dotyku v předchozím snímku
        this.pocetSnímkuDotyku = 0;
        this.dobaStabilizaceDotyku = 3; // Počet snímků, po které se musí dotyk držet

        this.prahDotyku = 0; // Předběžná hodnota, budeme ladit
        this.prahOdstupu = 0; // Předběžná hodnota, budeme ladit
        this.posledniAnimace = 'stoji';

        this.prvniKolize = 0;
        this.posledníKolize = 0;
    }

    preload() {
        // přesunuto do boot.js
        // this.load.image("obrVlevo", "assets/3d-arrow-left.png");
        // this.load.image("obrVpravo", "assets/3d-arrow-right.png");
    }

    create() {
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        const objPositionY = this.scale.canvas.height / 2 * 1.21;

        this.posledniKolizeCas = 0; // Inicializujeme proměnnou pro uložení času poslední kolize
        this.dobaProSpusteniTlaceni = 300; // Nastavíme dobu v milisekundách, po kterou musí kolize trvat

        this.chlapikAnimace = new ChlapikAnimace(this, 100, objPositionY, 'Chlapik-jde-atlas'); // Upravená inicializace
        this.chlapik = this.chlapikAnimace.sprite; // Získání spritu až po vytvoření ChlapikAnimace

        // Přidáme sprite do fyzikálního světa a získáme jeho fyzikální tělo
        this.physics.add.existing(this.chlapik, false);
        //this.physics.add.sprite(100, objPositionY, this.chlapik);
        this.chlapik.body.setCollideWorldBounds(true); // Fyzikální metoda se volá na .body
        this.chlapik.body.setBounce(0.2);
        this.chlapik.body.setMass(5);
        this.chlapik.body.setDrag(0.1);
        this.chlapik.body.setGravityY(0); // Pokud chceš gravitaci
        this.chlapik.body.velocity.x = 0;

        // Vlastnosti spritu se volají přímo na 'this.chlapik'
        this.chlapik.setScale(.8);
        this.chlapik.body.setSize(100, 100);
        //this.chlapik.body.offsetY = 50;

        // background
        const background = this.add.image(500, 390, "backgroundGame");
        background.blendMode = Phaser.BlendModes.SOURCE_OUT;
        background.scaleX = 0.8784867183713885;
        background.scaleY = 0.9624751673844308;
        background.alpha = 0.98;
        background.alphaTopLeft = 0.8;
        background.alphaTopRight = 0.8;
        background.alphaBottomLeft = 0.8;
        background.alphaBottomRight = 0.8;

        this.bedna = this.physics.add.sprite(this.chlapik.x + 60, objPositionY, 'obrVpravo');
        this.bedna.setScale(0.5);
        this.bedna.setCollideWorldBounds(true);
        this.bedna.setBounce(0.15);
        this.bedna.setMass(7);
        this.bedna.setDrag(this.vychoziTreniBedny);

        const polovinaSirkyChlapika = this.chlapik.body.width / 2;
        const polovinaSirkyBedny = this.bedna.body.width / 2;
        this.prahDotyku = polovinaSirkyChlapika + polovinaSirkyBedny + 5;
        this.prahOdstupu = this.prahDotyku + 10;

        this.physics.add.collider(this.chlapik, this.bedna, this.priKolizi, this.muzeTlacit, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // cilova zona DATA
        const xStredZony = this.scale.width / 2;
        const yStredZony = this.bedna.body.center.y;

        const vyskaChlapika = 120; // Předpokládaná výška postavy
        const mezeraNadChlapikem = 30; // Zvětšil jsem mezeru pro jistotu

        this.cilovaZonaData = {
            xStred: xStredZony,
            yStred: yStredZony,
            cervenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 180, 80, 0xff0000).setOrigin(0.5).setAlpha(0.15), // cervena zona
            zelenaZonaObjekt: this.add.rectangle(xStredZony, yStredZony, 40, 40, 0x00ff00).setOrigin(0.5).setAlpha(0.5), // zelena zona
            souradniceText: this.add.text(xStredZony, 30 + vyskaChlapika / 2 + mezeraNadChlapikem, "N 50°00.000 E 017°00.000", {
                font: '48px Georgia',
                align: 'center',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 2,
                    fill: true
                }
            }).setOrigin(0.5).setVisible(false),
            blurFx: null,
            prekryvaCervenou: false,
            prekryvaZelenou: false
        };

        const nejvyssiHloubka = 1000;
        this.chlapik.setDepth(nejvyssiHloubka);
        this.bedna.setDepth(nejvyssiHloubka);

        //this.rychlostChlapikaText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#fff' });
        //this.rychlostBednyText = this.add.text(10, 30, '', { fontSize: '16px', fill: '#fff' });

        this.teleportujObjekty();

        const buttonSize = 50; // Zvětšíme trochu velikost pro lepší dotyk
        const buttonAlpha = 1;
        const buttonY = this.cameras.main.height - buttonSize / 2 - 40; // Umístíme je níže

        // Tlačítko doleva (levá strana dolní části obrazovky)
        this.buttonLeft = this.add.rectangle(buttonSize / 2 + 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonLeft.on('pointerdown', () => this.cursors.left.isDown = true);
        this.buttonLeft.on('pointerup', () => this.cursors.left.isDown = false);
        this.buttonLeft.on('pointerout', () => this.cursors.left.isDown = false);

        // Tlačítko doprava (pravá strana dolní části obrazovky)
        this.buttonRight = this.add.rectangle(this.cameras.main.width - buttonSize / 2 - 40, buttonY, buttonSize, buttonSize, 0x888888).setAlpha(buttonAlpha).setInteractive();
        this.buttonRight.on('pointerdown', () => this.cursors.right.isDown = true);
        this.buttonRight.on('pointerup', () => this.cursors.right.isDown = false);
        this.buttonRight.on('pointerout', () => this.cursors.right.isDown = false);

        // Zajistíme, aby tlačítka zůstala na svém místě
        this.buttonLeft.setScrollFactor(0);
        this.buttonRight.setScrollFactor(0);

        this.startTime = 0;
        this.runningTime = 0;
        this.stopkyText = this.add.text(this.cameras.main.width - 20, 20, "0:00:00", {
            font: '24px Arial',
            fill: '#fff',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0); // Umístění v pravém horním rohu a fixní na obrazovce

        this.stopkyBezi = false; // Příznak, zda stopky běží

        this.napoveda = new Napoveda(this, this.cilovaZonaData.zelenaZonaObjekt); // Používáme odkaz z objektu

        /* 
        setInterval(() => {
            const aktualniAnimace = this.chlapikAnimace.sprite.anims.currentAnim ? this.chlapikAnimace.sprite.anims.currentAnim.key : 'zadna';
            const tlaciSmerLog = this.tlaciSmer ? this.tlaciSmer : 'zadny';
            const tlaceniZacatekLog = this.tlaceniZacatek ? 'ano' : 'ne';

            console.log(
                'Aktuální animace:', aktualniAnimace,
                'Tlačí směr:', tlaciSmerLog,
                'Tlačení začalo:', tlaceniZacatekLog
            );
        }, 300); // Logovat každých 300 milisekund  
        */
    }

    muzeTlacit(chlapik, bedna) {
        const doleva = this.cursors.left.isDown;
        const doprava = this.cursors.right.isDown;
        const chlapikX = chlapik.body.center.x;
        const bednaX = bedna.body.center.x;
        const chlapikVlevoOdBedny = chlapikX < bednaX;
        const kontakt = chlapik.body.touching.left || chlapik.body.touching.right;

        /* if (this.prvniKolize === 0 && !(this.posledniKolizeCas > 0)) { //jde o první kolizi ve sledovaném čase
            this.posledníKolize = 0;
            this.prvniKolize++;
            this.posledniKolizeCas  = this.time.now - this.prvniKolize; // Uložíme si čas poslední zaznamenané kolize
            console.log("Nastaven flag prví kolize")
        } else if (this.prvniKolize > 0){
            this.posledniKolizeCas  = this.time.now - this.prvniKolize; // Uložíme si čas poslední zaznamenané kolize
            console.log('Ulozeny cas op prvni kolize:', this.posledniKolizeCas);
            
        }else console.log("Nespecifikovaná podmínka"); */

        // Nastavujeme flag 'tlaci' pouze pokud je kontakt a držíme správnou klávesu
        this.tlaci = kontakt && ((chlapikVlevoOdBedny && doprava) || (!chlapikVlevoOdBedny && doleva));

        /* if (this.posledniKolize > 300) {
            this.prvniKolize = 0;
            //this.posledniKolize = 0;
            return true
        }
        else { return false } */
        return true;
    }

    priKolizi(_chlapik, _bedna) {
        // Zde můžeme mít logiku specifickou pro okamžik kolize,
        /* if (this.prvniKolize === 0 && !(this.posledniKolizeCas > 0)) { //jde o první kolizi ve sledovaném čase
            this.posledniKolize = 0;
            this.prvniKolize++;
            this.posledniKolizeCas = this.time.now - this.prvniKolize; // Uložíme si čas poslední zaznamenané kolize
            console.log("Nastaven flag prví kolize")
        } else if (this.prvniKolize > 0) {
            this.posledniKolizeCas = this.time.now - this.prvniKolize; // Uložíme si čas poslední zaznamenané kolize
            console.log('Ulozeny cas op prvni kolize:', this.posledniKolizeCas);

        } else console.log("Nespecifikovaná podmínka"); */
    }

    zneviditelniObjekty(callback) {
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 0,
            duration: 300,
            onComplete: callback,
            callbackScope: this
        });
    }

    teleportujObjekty() {
        const vertikalniPosun = this.chlapik.body.center.y;
        const konstantniVzdalenost = 50; // Nastav si požadovanou konstantní vzdálenost mezi nimi

        if (this.bedna.body.right > this.scale.width - 5) { // Bedna u pravého okraje
            // Bedna blíže ke středu levé třetiny
            const novaBednaX = this.scale.width / 6;
            // Chlapík ještě více vlevo
            const novaChlapikX = novaBednaX - konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, vertikalniPosun);
            this.bedna.setPosition(novaBednaX, vertikalniPosun);
        } else if (this.bedna.body.left < 5) { // Bedna u levého okraje
            // Bedna blíže ke středu pravé třetiny
            const novaBednaX = this.scale.width * 5 / 6;
            // Chlapík ještě více vpravo
            const novaChlapikX = novaBednaX + konstantniVzdalenost;
            this.chlapik.setPosition(novaChlapikX, vertikalniPosun);
            this.bedna.setPosition(novaBednaX, vertikalniPosun);
        }
    }

    zviditelniObjekty(callback) {
        this.tweens.add({
            targets: [this.chlapik, this.bedna],
            alpha: 1,
            duration: 300,
            onComplete: callback,
            callbackScope: this
        });
    }

    vyhodnotCilovouZonu() {
        const bednaStredX = this.bedna.body.center.x;
        const bednaStredY = this.bedna.body.center.y;
        const rychlostBednyX = Math.abs(this.bedna.body.velocity.x);
        const rychlostBednyY = Math.abs(this.bedna.body.velocity.y);
        const maximalniRychlostProDokonceni = 10;
        const txtCervena = "N50 00 000 E 017 00 000";
        const txtZelena = "N50 49 111 E 017 29 999";

        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const jeBednaStredVZeleneZone = Phaser.Geom.Rectangle.Contains(zelenaZonaBounds, bednaStredX, bednaStredY);
        const jeBednaPomalna = rychlostBednyX < maximalniRychlostProDokonceni && rychlostBednyY < maximalniRychlostProDokonceni;

        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds();
        const jeBednaStredVCerveneZone = Phaser.Geom.Rectangle.Contains(cervenaZonaBounds, bednaStredX, bednaStredY);

        if (jeBednaStredVZeleneZone) {
            this.cilovaZonaData.souradniceText.setText(txtZelena).setStyle({ fill: '#00ff00', fontStyle: '', shadowBlur: 0 }).setVisible(true);
            if (jeBednaPomalna && !this.hraDokoncena) {
                console.log('Hra dokončena (střed bedny v zóně a bedna je pomalá)!');
                this.hraDokoncena = true;
                this.bedna.setVelocity(0);
                if (this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                    this.cilovaZonaData.souradniceText.preFX.clear();
                    this.cilovaZonaData.blurFx = null;
                }
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            } else if (!this.cilovaZonaData.prekryvaZelenou) {
                console.log("Bedna vstoupila do zelené zóny!");
                this.cilovaZonaData.prekryvaZelenou = true;
                this.cilovaZonaData.prekryvaCervenou = false;
            }
        } else if (jeBednaStredVCerveneZone) {
            this.cilovaZonaData.souradniceText.setText(txtCervena).setStyle({ fill: '#ff0000', fontStyle: '', shadowBlur: 2 }).setVisible(true);
            if (!this.cilovaZonaData.prekryvaCervenou) {
                console.log("Střed bedny vstoupil do červené zóny!");
                if (!this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                    this.cilovaZonaData.blurFx = this.cilovaZonaData.souradniceText.preFX.addBlur();
                    this.tweens.add({ targets: this.cilovaZonaData.blurFx, strength: 1.5, duration: 1000, yoyo: true, repeat: -1 });
                }
                this.cilovaZonaData.prekryvaCervenou = true;
                this.cilovaZonaData.prekryvaZelenou = false;
            }
        } else {
            this.cilovaZonaData.souradniceText.setVisible(false);
            this.cilovaZonaData.prekryvaCervenou = false;
            this.cilovaZonaData.prekryvaZelenou = false;
            if (this.cilovaZonaData.blurFx && this.cilovaZonaData.souradniceText.preFX) {
                this.cilovaZonaData.souradniceText.preFX.clear();
                this.cilovaZonaData.blurFx = null;
            }
        }
    }

    update(time, _delta) {

        const rychlostTlaceni = 50; // Pomalejší rychlost tlačení (pohyb s bednou)
        const rychlostPohybu = 100;
    const doleva = this.cursors.left.isDown;
    const doprava = this.cursors.right.isDown;

    if (!this.chlapikStouchlBednu) {
        // Pokud neprobíhá šťouchnutí, přehráváme animace pohybu/stání
        if (doleva) {
            this.chlapikAnimace.play('beh', true);
            this.chlapikAnimace.setFlipX(true);
            this.chlapik.body.velocity.x = -rychlostPohybu;
        } else if (doprava) {
            this.chlapikAnimace.play('beh', true);
            this.chlapikAnimace.setFlipX(false);
            this.chlapik.body.velocity.x = rychlostPohybu;
        } else {
            this.chlapikAnimace.play('stoji', true);
            this.chlapik.body.velocity.x = 0;
        }
    }
    // Pokud this.chlapikStouchlBednu je true, čekáme na onComplete callback.



        /* 
        kontrola hodnot zda jsou v rozsahu min a max
        **********************************************************************
        let jeVRozsahu = (hodnota, minimum, maximum) => {
            return hodnota >= minimum && hodnota <= maximum;
        };

        // Použití:
        let aktualniBod = 5;
        let minStret = 2;
        let maxStret = 8;

        if (jeVRozsahu(aktualniBod, minStret, maxStret)) {
            console.log(`${aktualniBod} je v bodě střetu (v rozsahu).`);
        } else {
            console.log(`${aktualniBod} není v bodě střetu (mimo rozsah).`);
        }
         **********************************************************************
         
        **  Návrh 1: Použití proměnné stavu pro "záměr tlačit":

        *   Když hráč stiskne šipku ve směru bedny a chlapík se poprvé dotkne bedny, nastavíme booleovskou proměnnou (například jeZamyslenoTlacit na true).
        *   Animaci tlačení budeme přehrávat, pokud je tato proměnná true a zároveň stále držíme šipku ve správném směru.
        *   Proměnnou jeZamyslenoTlacit nastavíme na false, když hráč přestane držet šipku nebo když se chlapík přestane dotýkat bedny (s určitou malou tolerancí, viz další návrh).

        **  Návrh 2: Přidání malé "hystereze" nebo tolerance pro odpojení:

        *   Můžeme si pamatovat, že kontakt s bednou byl navázán. Pokud se v následujícím velmi krátkém časovém úseku (například několik frameů) kontakt ztratí, ale hráč stále drží šipku ve směru bedny, budeme stále považovat, že tlačí, a přehrávat animaci tlačení.
        *   To by mohlo pomoct překlenout ty krátké okamžiky, kdy se objekty fyzikálně mírně oddálí.
        
        **  Návrh 3: Kontrola překrývání bounding boxů:

        *   Místo body.touching, která je binární (dotýká se / nedotýká se), můžeme zkusit zjistit, zda se bounding boxy chlapíka a bedny stále překrývají. Phaser má pro to utility (například Phaser.Geom.Rectangle.Overlaps). Pokud se překrývají, je velmi pravděpodobné, že jsou stále v kontaktu nebo velmi blízko něj.
        
        */

        /* let jeBodStretu = (hodnotaX) => {
            const minHodnota = 0; // Nahraď skutečnou minimální hodnotou
            const maxHodnota = 120; // Nahraď skutečnou maximální hodnotou
            return (hodnotaX >= minHodnota) && (hodnotaX <= maxHodnota);
        };

        if (this.cursors.left.isDown) {
            this.chlapik.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.chlapik.flipX = false;
        }

        if (this.chlapik.body.touching.left || this.chlapik.body.touching.right) {
            pozadavekTlacení = true;
        }

        // logika pro animace

        let animujStuj = !this.cursors.left.isDown && !this.cursors.right.isDown;
        let animujTlacVlevo = this.cursors.left.isDown && !this.cursors.right.isDown && pozadavekTlacení && this.chlapik.body.velocity.x < 3 && this.chlapik.flipX;
        let animujTlacVpravo = this.cursors.right.isDown && !this.cursors.left.isDown && pozadavekTlacení && this.chlapik.body.velocity.x > 3 && !this.chlapik.flipX;
        let animujBehVlevo = !animujStuj && !animujTlacVlevo && !animujTlacVpravo && this.chlapik.flipX;
        let animujBehVpravo = !animujStuj && !animujTlacVlevo && !animujTlacVpravo && !this.chlapik.flipX;

        //const vysledek = Number(a) + Number(b) + Number(c) + Number(d) === 1;
        let vysledekLogiky = Number(animujTlacVlevo) + Number(animujTlacVpravo) + Number(animujStuj) + Number(animujBehVlevo) + Number(animujBehVpravo) === 1;

        //kontrola konzistentnosti podminek
        if (!vysledekLogiky) {
            console.log("chybne sestavena podminka");
            console.log("BehVlevo: ", animujBehVlevo);
            console.log("BehVpravo: ", animujBehVpravo);
            console.log('TlacVpravo: ', animujTlacVpravo);
            console.log('TlacVlevo: ', animujTlacVlevo);
            console.log('Stuj: ', animujStuj);
            return;
        } else {
            switch (true) {
                case animujBehVlevo:
                    this.chlapikAnimace.play('beh', true);
                    this.chlapikAnimace.sprite.setFlipX(true);
                    if (this.chlapik.body.velocity.x >= -3) {
                        this.chlapik.body.velocity.x = -50;
                    } else {
                        this.chlapik.body.velocity.x += 0.02;
                    }
                    break;
                case animujBehVpravo:
                    this.chlapikAnimace.play('beh', true);
                    this.chlapikAnimace.sprite.setFlipX(false);
                    if (this.chlapik.body.velocity.x <= 3) {
                        this.chlapik.body.velocity.x = 50;
                    } else {
                        this.chlapik.body.velocity.x -= 0.02;
                    }
                    break;
                case animujTlacVlevo:
                    this.chlapikAnimace.play('tlaceni', true);
                    this.chlapikAnimace.sprite.setFlipX(true);
                    break;
                case animujTlacVpravo:
                    this.chlapikAnimace.play('tlaceni', true);
                    this.chlapikAnimace.sprite.setFlipX(false);
                    break;
                case animujStuj:
                    this.chlapikAnimace.play('stoji', true);
                    this.chlapik.body.velocity.x = 0;
                    break;
                default:
                    console.log("Neočekávaný stav, nutna kontrola kodu");
                    break;
            }
        } */

        /*         // Nastavíme rychlost na nulu pouze pokud se nic neděje
                if (!pohybDoleva && !pohybDoprava && !pohybNahoru && !pohybDolu && !this.tlaceniZacatek) {
                    this.chlapik.body.setVelocityX(0);
                    this.chlapik.body.setVelocityY(0);
                }
        
                const rychlost = 100;
                let aktualniAnimaceKlic = this.chlapikAnimace.sprite.anims.currentAnim ? this.chlapikAnimace.sprite.anims.currentAnim.key : '';
        
                if (this.chlapik.body.touching.left && pohybDoleva) {
                    tlaciSmer = 'left';
                    if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
                    // Spustit animaci tlačení a nastavit rychlosti ZDE
                    if (aktualniAnimaceKlic !== 'tlaceni') {
                        this.chlapikAnimace.play('tlaceni', true);
                    }
                    this.chlapikAnimace.sprite.setFlipX(true);
                    this.chlapik.body.setVelocityX(-rychlostTlaceni);
                    this.bedna.body.setVelocityX(-rychlostTlaceni);
                } else if (pohybDoleva) { // Běh se spustí JEN když není kolize a je pohyb
                    if (aktualniAnimaceKlic !== 'beh' || this.chlapikAnimace.sprite.flipX !== true) {
                        this.chlapikAnimace.play('beh', true);
                        this.chlapikAnimace.sprite.setFlipX(true);
                    }
                    this.chlapik.body.setVelocityX(-rychlost);
                } else {
                    this.chlapikAnimace.play("stoji", true);
                }
        
                if (this.chlapik.body.touching.right && pohybDoprava) {
                    tlaciSmer = 'right';
                    if (!this.tlaceniZacatek) this.tlaceniZacatek = time;
                    // Spustit animaci tlačení a nastavit rychlosti ZDE
                    if (aktualniAnimaceKlic !== 'tlaceni') {
                        this.chlapikAnimace.play('tlaceni', true);
                    }
                    this.chlapikAnimace.sprite.setFlipX(false);
                    this.chlapik.body.setVelocityX(-rychlostTlaceni);
                    this.bedna.body.setVelocityX(-rychlostTlaceni);
                } else if (pohybDoprava) { // Běh se spustí JEN když není kolize a je pohyb
                    if (aktualniAnimaceKlic !== 'beh' || this.chlapikAnimace.sprite.flipX !== false) {
                        this.chlapikAnimace.play('beh', true);
                        this.chlapikAnimace.sprite.setFlipX(true);
                    }
                    this.chlapik.body.setVelocityX(-rychlost);
                } else {
                    this.chlapikAnimace.play("stoji", true);
                } */


        //Testovací kod

        /* this.pocetUpdate = 60 * this.pocetUpdate;

        if (this.pocetUpdate % 30 === 0  ) {
            console.log('Vypis aktualniho stavu');

            console.log("BehVlevo: ", animujBehVlevo);
            console.log("BehVpravo: ", animujBehVpravo);
            console.log('TlacVpravo: ', animujTlacVpravo);
            console.log('TlacVlevo: ', animujTlacVlevo);
            console.log('Stuj: ', animujStuj);
            console.log('Rychlost chlapika: ', this.chlapik.body.velocity.x);
            console.log('Pozadavek tlaceni:', this.anims.key);

            //return;
        }

        //Testovací kod konec */

        //const okrajovaVzdalenost = 50;
        const bednaUOkrajeVlevo = this.bedna.body.left < 5; // Levý okraj těla bedny je méně než 5 pixelů od levého okraje obrazovky
        const bednaUOkrajeVpravo = this.bedna.body.right > this.scale.width - 5; // Pravý okraj těla bedny je více než 5 pixelů od pravého okraje obrazovky
        const bednaUOkrajeNahore = this.bedna.body.top < 5; // Horní okraj těla bedny je méně než 5 pixelů od horního okraje obrazovky
        const bednaUOkrajeDole = this.bedna.body.bottom > this.scale.height - 5; // Dolní okraj těla bedny je více než 5 pixelů od dolního okraje obrazovky

        if ((bednaUOkrajeVlevo) || (bednaUOkrajeVpravo) || (bednaUOkrajeNahore) || (bednaUOkrajeDole)) {
            if (!this.teleportaceBezi) {
                this.teleportaceBezi = true;
                this.zneviditelniObjekty(() => {
                    this.teleportujObjekty();
                    console.log('nové x body.center chlapíka: ', this.chlapik.body.center.x);
                    console.log('nové x body.center bedny: ', this.bedna.body.center.x);

                    this.zviditelniObjekty(() => {
                        this.teleportaceBezi = false;
                    });
                });
            }
        } else {
            // Pokud bedna není u okraje, resetujeme příznaky teleportace
            this.teleportaceBezi = false;
            this.bedna.alpha = 1; // Zajistíme, že bedna je viditelná
            this.chlapik.alpha = 1;
        }

        const bednaBounds = this.bedna.getBounds();
        const zelenaZonaBounds = this.cilovaZonaData.zelenaZonaObjekt.getBounds();
        const cervenaZonaBounds = this.cilovaZonaData.cervenaZonaObjekt.getBounds(); // Používáme objekt pro červenou zónu

        this.vyhodnotCilovouZonu(); // Voláme naši novou funkci pro vyhodnocení zón

        this.updateStopky(time);
    }

    updateStopky(time) {
        if (!this.hraDokoncena) { // Přidali jsme tuto podmínku
            if (!this.stopkyBezi) {
                this.startTime = time;
                this.stopkyBezi = true;
            }

            if (this.stopkyBezi) {
                this.runningTime = time - this.startTime;
                const minutes = Math.floor(this.runningTime / 60000).toString().padStart(2, '0');
                const seconds = Math.floor((this.runningTime % 60000) / 1000).toString().padStart(2, '0');
                const milliseconds = Math.floor((this.runningTime % 1000) / 10).toString().padStart(2, '0');
                this.stopkyText.setText(`${minutes}:${seconds}:${milliseconds}`);
            }
        } else {
            console.log('casovac a destroy');

        }
    }

    muzeKolizovat(_chlapik, _bedna) {
        return true; // Pro teleportaci necháme kolize vždy povolené
        //console.log();

    }

    setAnimeChlapik() {

    }
}