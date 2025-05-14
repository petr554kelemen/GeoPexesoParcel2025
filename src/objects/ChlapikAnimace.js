// ChlapikAnimace.js
import Phaser from 'phaser'; // Důležité pro typování a některé funkce

class ChlapikAnimace {
    /**
     * Animace pro Game scenu
     * @param {Phaser.Scene} scene - Instance herní scény Phaseru.
     * @param {number} x - Počáteční X souřadnice spritu.
     * @param {number} y - Počáteční Y souřadnice spritu.
     * @param {string} defaultTextureKey - Klíč pro zobrazení animace.
     */

    constructor(scene, x, y, defaultTextureKey) { // Změnili jsme parametry
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, defaultTextureKey);

        this.createAnimations();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'stoji',
            frames: [{ key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10000' }],
            frameRate: 20,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'jde',
            frames: [
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10001' },
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10002' },
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10003' },
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10004' },
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10005' },
            ],
            frameRate: 7,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'tlaci',
            frames: [
                //{ key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10006' },
                //{ key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10007' },
                { key: 'chlapik_animace', frame: 'Clovicek-stoji-jde-tlaci-10008' }
            ],
            frameRate: 2,
            repeat: 1 // Nebo 0, pokud to má být statický obrázek
        });
    }

    play(key, ignoreIfPlaying) {
        this.sprite.play(key, ignoreIfPlaying);
    }

    setFlipX(value) {
        this.sprite.setFlipX(value);
    }
}

export default ChlapikAnimace;
