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
    constructor(scene, x, y, defaultAtlasKey) {
        this.scene = scene;
        this.sprite = this.scene.add.sprite(x, y, defaultAtlasKey);
        this.defaultAtlasKey = defaultAtlasKey;
        this.animaceAtlasy = {
            'beh': defaultAtlasKey,
            'stoji': defaultAtlasKey,
            'tlaceni': 'Chlapik-tlaci-atlas'
        };
        this.vytvorAnimace();
    }

    vytvorAnimace() {
        this.scene.anims.create({
            key: 'beh',
            frames: this.scene.anims.generateFrameNames(this.animaceAtlasy['beh'], {
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
            frames: [{ key: this.animaceAtlasy['stoji'], frame: 'Chlapik-jde-0000' }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'tlaceni',
            frames: this.scene.anims.generateFrameNames(this.animaceAtlasy['tlaceni'], {
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
        if (this.animaceAtlasy.hasOwnProperty(animationKey)) {
            console.log(`Přehrávám animaci: ${animationKey}, aktuální textura: ${this.sprite.texture.key}`);
            this.sprite.play(animationKey, ignoreIfPlaying);
        } else {
            console.warn(`Animace s klíčem '${animationKey}' není definována.`);
        }
    }

    setFlipX(flipX) {
        this.sprite.setFlipX(flipX);
    }
}

export default ChlapikAnimace;