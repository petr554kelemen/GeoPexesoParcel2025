import Boot from './scenes/Boot';
import Game from './scenes/Game';
import GameOver from './scenes/GameOver';
import MainMenu from './scenes/MainMenu';
import Preloader from './scenes/Preloader';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        //PathBuilder,
        Preloader,
        MainMenu,
        Game,
        GameOver
    ],
    physics: {
        default: 'arcade',
        arcade: {
        //    x: 0,
        //    y: 0,
        //    width: this.sys.scale.width,
        //    height: this.sys.scale.height,
            gravity: {
                x: 0,
                y: 0
            },
            checkCollision: {
        //        up: true,
        //        down: true,
                left: true,
                right: true
            },
        //    customUpdate: false,
        //    fixedStep: true,
            fps: 25,
            timeScale: 1,     // 2.0 = half speed, 0.5 = double speed
        //    customUpdate: false,
            overlapBias: 4,
        //    tileBias: 16,
            forceX: false,
        //    isPaused: false,
            debug: true,
            debugShowBody: true,
            debugShowStaticBody: true,
            debugShowVelocity: true,
            debugBodyColor: 0xff00ff,
            debugStaticBodyColor: 0x0000ff,
            debugVelocityColor: 0x00ff00,
        //    maxEntries: 16,
        //    useTree: true   // set false if amount of dynamic bodies > 5000
        }
    }
};

export default new Phaser.Game(config);
