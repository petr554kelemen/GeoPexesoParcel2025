// ChlapikAnimace.js
import Phaser from 'phaser'; // Důležité pro typování a některé funkce

class ChlapikAnimace {
    /**
     * Animace pro Game scenu
     * @param {Phaser.Scene} scene - Instance herní scény Phaseru.
     * @param {number} x - Počáteční X souřadnice spritu.
     * @param {number} y - Počáteční Y souřadnice spritu.
     * @param {string} textureKey - Klíč textury (atlasu) pro animace chůze.
     */
    constructor(scene, x, y, textureKey) {
        this.scene = scene;
        this.sprite = this.scene.add.sprite(x, y, textureKey);
        this.vytvorAnimace();
    }

    vytvorAnimace() {
        // Animace běhu (dříve 'chuzi-vpravo')
        this.scene.anims.create({
            key: 'beh',
            frames: this.scene.anims.generateFrameNames('Chlapik-jde-atlas', {
                prefix: 'Chlapik-jde-',
                start: 0,
                end: 29,
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'stoji',
            frames: [{ key: 'Chlapik-jde-atlas', frame: 'Chlapik-jde-0000' }],
            frameRate: 20
        });

        // Animace tlačení (zůstává beze změny)
        this.scene.anims.create({
            key: 'tlaceni',
            frames: this.scene.anims.generateFrameNames('Chlapik-tlaci-atlas', {
                prefix: 'Chlapik-tlaci',
                start: 0,
                end: 12,
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });
    }

    play(animationKey, ignoreIfPlaying = false) {
        this.sprite.play(animationKey, ignoreIfPlaying);
    }

    setFlipX(flipX) {
        this.sprite.setFlipX(flipX);
    }

    // ... další metody třídy ChlapikAnimace ...
}

export default ChlapikAnimace;