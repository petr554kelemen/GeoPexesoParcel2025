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
                families: ['Playpen Sans Arabic: 400', "DynaPuff: 600"] // Seznam vašich Google Fonts
            },
            active: () => {
                this.scene.start('Preloader'); // Spusťte další scénu až po načtení fontů
            },
            inactive: () => {
                console.warn('Google Fonts se nepodařilo načíst. Používám výchozí fonty.');
                this.scene.start('Preloader'); // I v případě neúspěchu pokračujte (s výchozími fonty)
            }
        });        
    }

}