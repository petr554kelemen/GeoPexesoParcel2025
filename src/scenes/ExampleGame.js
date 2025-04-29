import Phaser from 'phaser';
//import { poziceMysi } from '../poziceMysi.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.ctverec = null; // Prozatím nepoužitá proměnná instance třídy Game
    }

    preload ()
    {
        // preload() se volá před create(). Slouží k načtení všech potřebných assetů (obrázky, zvuky, atd.)
        // this.load.setBaseURL('https://cdn.phaserfiles.com/v385'); // Zakomentovaný řádek, pravděpodobně pro načítání z externího zdroje
        this.load.image('block', './assets/3d-arrow-left.png'); // Načtení obrázku 'block' z lokálního souboru
        this.load.spritesheet('boom', 'assets/3d-arrow-right.png', { frameWidth: 64, frameHeight: 64, endFrame: 1 });
        // Načtení spritesheetu 'boom'. Spritesheet obsahuje animaci rozloženou do několika snímků.
        // Objekt v třetím argumentu definuje rozměry jednoho snímku a poslední snímek animace.
        // V tomto případě je endFrame: 1, což znamená, že animace má pouze jeden snímek.
    }

    create ()
    {
        // create() se volá po preload(). Zde se inicializují herní objekty, nastavuje fyzika, animace atd.

        // this.ctverec = this.add.sprite(this.add.rectangle(100,100,200,200));
        // Zakomentovaný řádek, který by pravděpodobně vytvořil obdélník a poté sprite z něj.

        // Vytvoření animace 'explode'
        this.anims.create({
            key: 'explode', // Klíč (název) animace, pod kterým ji budeme volat
            frames: 'boom', // Klíč spritesheetu, ze kterého se mají vzít snímky
            frameRate: 20, // Rychlost přehrávání animace (snímků za sekundu)
            showOnStart: true, // Zda se má objekt zobrazit na začátku animace
            hideOnComplete: true // Zda se má objekt skrýt po dokončení animace
        });

        // Vytvoření skupiny fyzikálních objektů (bloků)
        const blocks = this.physics.add.group({
            defaultKey: 'block', // Výchozí klíč pro texturu každého bloku ve skupině
            bounceX: 1, // Koeficient odrazu od okrajů světa po ose X (1 = plný odraz)
            bounceY: 1, // Koeficient odrazu od okrajů světa po ose Y (1 = plný odraz)
            collideWorldBounds: true, // Zda mají bloky kolidovat s okraji herního světa
            dragX: 0.5, // Odpor vzduchu/tření působící na pohyb po ose X (zpomaluje pohyb)
            dragY: 0.5, // Odpor vzduchu/tření působící na pohyb po ose Y (zpomaluje pohyb)
            useDamping: true // Zda se má použít tlumení (alternativní způsob zpomalování, může být plynulejší)
        });

        // Vytvoření 10 bloků na náhodných pozicích
        for (let i = 0; i < 10; i++)
        {
            const block = blocks.create(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500));
            // Vytvoření nového bloku ve skupině na náhodné pozici X (100-700) a Y (100-500)

            block.setMass(Phaser.Math.Between(1, 2));
            // Nastavení hmotnosti bloku (ovlivňuje jak reaguje na síly a kolize)

            block.setScale(block.body.mass ** 0.5);
            // Nastavení škály (velikosti) bloku v závislosti na jeho hmotnosti (druhá odmocnina pro nelineární škálování)
        }

        // Vytvoření spritu pro efekt výbuchu
        const boom = this.add.sprite(0, 0, 'boom').setBlendMode('ADD').setScale(4).setVisible(false);
        // Vytvoření spritu 'boom' na pozici (0, 0), nastavení režimu prolnutí na 'ADD' (pro jasnější efekt),
        // nastavení škály na 4x původní velikost a zpočátku je neviditelný.

        // Nastavení interakce na událost stisknutí ukazatele (myši/dotyku)
        this.input.on('pointerdown', (pointer) =>
        {
            // Tato funkce se spustí, když je stisknuto tlačítko myši nebo dotyková obrazovka

            boom.copyPosition(pointer).play('explode');
            // Přesunutí spritu 'boom' na pozici ukazatele a spuštění animace 'explode'

            const vzdalenost = new Phaser.Math.Vector2(); // Vektor pro uložení vzdálenosti
            const sila = new Phaser.Math.Vector2(); // Vektor pro uložení síly
            const zrychleni = new Phaser.Math.Vector2(); // Vektor pro uložení zrychlení

            // Pro každý blok ve skupině 'blocks'
            for (const block of blocks.getChildren())
            {
                // Výpočet vektoru vzdálenosti od středu bloku k pozici kliknutí
                vzdalenost.copy(block.body.center).subtract(pointer);

                // Výpočet vektoru síly
                sila.copy(vzdalenost).setLength(5000000 / vzdalenost.lengthSq()).limit(1000);
                // Síla působí směrem od kliknutí k bloku a její velikost je nepřímo úměrná druhé mocnině vzdálenosti (simulace výbuchu).
                // .limit(1000) omezuje maximální velikost síly.

                // Výpočet zrychlení podle Newtonova zákona (F = ma -> a = F/m)
                zrychleni.copy(sila).scale(1 / block.body.mass);

                // Aplikování zrychlení na rychlost bloku
                block.body.velocity.add(zrychleni);
                // Tím se blok začne pohybovat ve směru od kliknutí.
            }
        });
    }

    update (time, delta)
    {
        // update() se volá v každém snímku herní smyčky (typicky 60x za sekundu).
        // Slouží k aktualizaci stavu hry, pohybu objektů, kontrole kolizí atd.

        // V tomto konkrétním příkladu funkce update() nic nedělá.
        // Všechna logika se odehrává v reakci na událost 'pointerdown' ve funkci create().
        // Pokud by se objekty měly pohybovat samy od sebe, reagovat na klávesy,
        // nebo kdyby se měla kontrolovat kolize v každém snímku, kód by byl zde.

        // 'time' je celkový čas od spuštění scény v milisekundách.
        // 'delta' je časový rozdíl mezi aktuálním a předchozím snímkem v milisekundách.
        // Tento rozdíl je užitečný pro plynulý pohyb nezávislý na snímkové frekvenci:
        // např.: object.x += speed * delta / 1000;
    }
}