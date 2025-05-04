import { Scene } from 'phaser';

export default class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
        //this.load.plugin({key:'PathBuilder', url:"<pathtoplugin>/PathBuilder.js",mapping:'PathBuilder'});
        
        this.load.image("obrVlevo", "assets/3d-arrow-left.png");
        this.load.image("obrVpravo", "assets/3d-arrow-right.png");

    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
