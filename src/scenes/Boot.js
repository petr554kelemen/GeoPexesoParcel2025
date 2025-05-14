import { Scene } from 'phaser';

export default class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');

        this.load.image("pictureChlapik", "assets/3d-arrow-left.png"); //statický obrázek pro nastavení hry
        //this.load.image("pictureBedna", "assets/3d-arrow-right.png"); //statický obrázek pro nastavení hry
        this.load.image("pictureBedna", "assets/bedna.png"); //statický obrázek pro nastavení hry

        //this.load.atlas('chlapik_jde', 'assets/animace/clovicek_jde.png', 'assets/animace/clovicek_jde_atlas.json');
        //this.load.spritesheet('chlapik_stoji', 'assets/animace/clovicek_jde.png', { frameWidth: 110, frameHeight: 140 });
        //this.load.atlas('chlapik_tlaci', 'assets/animace/Chlapik-tlaci-spritesheet.png', 'assets/animace/Chlapik-tlaci-atlas.json');
    }

    create() {
        this.scene.start('Preloader');
    }
}
