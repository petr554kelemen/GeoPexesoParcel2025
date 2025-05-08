// ChlapikAnimace.js
import Phaser from 'phaser'; // Důležité pro typování a některé funkce

class ChlapikAnimace {
    /**
     * Animace pro Game scenu
     * @param {Phaser.Scene} scene - Instance herní scény Phaseru.
     * @param {number} x - Počáteční X souřadnice spritu.
     * @param {number} y - Počáteční Y souřadnice spritu.
     * @param {string} defaultTextureKey - Klíč animace pro zobrazení.
     */

    constructor(scene, x, y, defaultTextureKey) { // Změnili jsme parametry
        this.scene = scene;
        this.sprite = this.scene.add.sprite(x, y, defaultTextureKey); // Použijeme defaultTextureKey
        this.vytvorAnimace();
    }

    vytvorAnimace() {
        this.scene.anims.create({
            key: 'beh',
            //frames: this.scene.anims.generateFrameNames('Chlapik-jde-atlas', { /* ... */ }),
            frames: 'Chlapik-jde-atlas',
            frameRate: 15,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'stoji',
            //frames: [{ key: 'Chlapik-jde-atlas', frame: 'Chlapik-jde-0000' }],
            frames: [{ key: 'cerveny-obdelnik' }],
            //'cerveny-obdelnik'
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'tlaceni',
            //frames: this.scene.anims.generateFrameNames('Chlapik-tlaci-atlas', { /* ... */ }),
            frames: 'Chlapik-tlaci-atlas',
            frameRate: 15,
            repeat: -1
        });
    }

    /**
     * 
     * @param {string} animeKey - key animace k přehrávání
     * @param {boolean} ignoreIfPlaying - pokud true, přehraje vždy od začátku
     */
    play(animeKey, ignoreIfPlaying = true) {
        this.sprite.play(animeKey, ignoreIfPlaying);
        //console.log(this.scene.anims.get(animeKey));
    }

    /**
     * 
     * @param {boolean} flipX - false je normal, true je otočený
     */
    setFlipX(flipX) {
        this.sprite.setFlipX(flipX);
    }
}

export default ChlapikAnimace;
