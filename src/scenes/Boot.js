import { Scene } from 'phaser';

export default class Boot extends Scene {
    constructor() {
        super('Boot');
    }
    
    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        //this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'Kontroluji připojení...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        WebFont.load({
            google: {
                families: ['Playpen Sans Arabic: 400'] // Seznam vašich Google Fonts
            },
            active: () => {
                console.log('Google Fonts načteny.');
                this.scene.start('Preloader'); // Spusťte další scénu až po načtení fontů
            },
            inactive: () => {
                console.warn('Google Fonts se nepodařilo načíst. Používám výchozí fonty.');
                this.scene.start('Preloader'); // I v případě neúspěchu pokračujte (s výchozími fonty)
            }
        });
        
        this.load.image('background', 'assets/bg.png');

        this.load.image("pictureChlapik", "assets/animace/Clovicek-stoji-jde-tlaci.png"); //spritesheet pro animace hry
        this.load.image("pictureBedna", "assets/Bedna.png"); //spritesheet bedny
        this.load.atlas('chlapik_animace', 'assets/animace/clovicek-stoji-jde-tlaci.png', 'assets/animace/clovicek-stoji-jde-tlaci.json');

        this.load.plugin('rexflipplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexflipplugin.min.js', true);
        this.load.plugin('rexlifetimeplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexlifetimeplugin.min.js', true);
        this.load.atlas('pexeso', "assets/images/atlas_pexeso.png", "assets/images/atlas_pexeso_atlas.json");

        this.load.image('heart', 'assets/images/heart-icon-2.png');

        this.load.image('arrow', 'assets/images/arrow.png'); //šipka pro tlačítka
    }

    create() {
        this.scene.start('Preloader');
    }
}
