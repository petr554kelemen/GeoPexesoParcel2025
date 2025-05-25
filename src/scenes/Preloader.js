// // You can write more code here


// /* START OF COMPILED CODE */

// /* START-USER-IMPORTS */
// /* END-USER-IMPORTS */

// export default class Preloader extends Phaser.Scene {

// 	constructor() {
// 		super("Preloader");

// 		/* START-USER-CTR-CODE */
// 		// Write your code here.
// 		/* END-USER-CTR-CODE */
// 	}

// 	/** @returns {void} */
// 	editorCreate() {

// 		// background
// 		this.add.image(512, 384, "backgroundGame");

// 		// progressBar
// 		const progressBar = this.add.rectangle(511, 319, 468, 32);
// 		progressBar.isFilled = true;
// 		progressBar.fillColor = 14737632;
// 		progressBar.isStroked = true;

// 		// logo
// 		const logo = this.add.image(520, 227, "logo");
// 		logo.alpha = 0.5;
// 		logo.alphaTopLeft = 0.5;
// 		logo.alphaTopRight = 0.5;
// 		logo.alphaBottomLeft = 0.5;
// 		logo.alphaBottomRight = 0.5;

// 		this.progressBar = progressBar;

// 		this.events.emit("scene-awake");
// 	}

// 	/** @type {Phaser.GameObjects.Rectangle} */
// 	progressBar;

// 	/* START-USER-CODE */

// 	// Write your code here
//     init ()
//     {
//         this.editorCreate();

//         //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
//         const bar = this.add.rectangle(this.progressBar.x - this.progressBar.width / 2 + 4, this.progressBar.y, 4, 28, 0xffffff);

//         //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
//         this.load.on('progress', (progress) => {

//             //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
//             bar.width = 4 + (460 * progress);

//         });


//     }

//     preload ()
//     {
//         // Use the 'pack' file to load in any assets you need for this scene
//         this.load.pack('preload', 'assets/preload-asset-pack.json');
//     }

//     create ()
//     {
//         //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
//         //  For example, you can define global animations here, so we can use them in other scenes.
// 		//this.pathBuilder = this.plugins.get('PathBuilderPlugin');
//         //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
//         this.scene.start('Game');
//     }
//         /* END-USER-CODE */
// }

/* END OF COMPILED CODE */

// You can write more code here
// Návrh na preload od AI
 
// Preloader.js
export default class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
    const { width, height } = this.cameras.main;

    // 1) Pozadí a rám progress baru
    const barWidth = width * 0.6;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;

    // šedé pozadí
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 0.8);
    bg.fillRect(barX, barY, barWidth, barHeight);

    // barevný progress bar
    const bar = this.add.graphics();

    // text procent
    const percentText = this.add.text(width/2, barY - 20, '0 %', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // event, který se volá průběžně
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0xf0ad4e, 1);
      bar.fillRect(barX, barY, barWidth * value, barHeight);
      percentText.setText(parseInt(value * 100) + ' %');
    });

    // event po dokončení všech loadů
    this.load.on('complete', () => {
      percentText.setText('Hotovo!');
    });

    // 2) TU NAHRÁVÁŠ SVOJE ASSETY
    // např.:
    //this.load.image('tiles', 'assets/tiles.png');
    //this.load.audio('click', 'assets/click.mp3');
    //this.load.json('level1', 'assets/level1.json');
    // ...další obrázky, zvuky, JSONy atd.
    this.load.pack('preload', 'assets/preload-asset-pack.json');
    // WebFont.load({
    //         google: {
    //             families: ['Playpen Sans Arabic: 400', "DynaPuff: 600"] // Seznam vašich Google Fonts
    //         },
    //         active: () => {
    //             //console.log('Google Fonts načteny.');
    //             this.scene.start('Preloader'); // Spusťte další scénu až po načtení fontů
    //         },
    //         inactive: () => {
    //             console.warn('Google Fonts se nepodařilo načíst. Používám výchozí fonty.');
    //             this.scene.start('Preloader'); // I v případě neúspěchu pokračujte (s výchozími fonty)
    //         }
    //     });

        this.load.image('background', 'assets/bg.png');

        this.load.image("pictureChlapik", "assets/animace/Clovicek-stoji-jde-tlaci.png"); //spritesheet pro animace hry
        this.load.image("pictureBedna", "assets/Bedna.png"); //spritesheet bedny
        this.load.atlas('chlapik_animace', 'assets/animace/clovicek-stoji-jde-tlaci.png', 'assets/animace/clovicek-stoji-jde-tlaci.json');

        this.load.plugin('rexflipplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexflipplugin.min.js', true);
        this.load.plugin('rexlifetimeplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexlifetimeplugin.min.js', true);
        this.load.atlas('pexeso', "assets/images/atlas_pexeso.png", "assets/images/atlas_pexeso_atlas.json");

        this.load.image('heart', 'assets/images/heart-icon-2.png');

        this.load.image('arrow', 'assets/images/arrow.png'); //šipka pro tlačítka

        //this.load.image("BednaImg",'assets/BednaSpritesheet.png');
        this.load.spritesheet("bedna", "assets/BednaSpritesheet.png", {
            frameWidth: 128,
            frameHeight: 118
        });

    // 3) Zajistit minimální zobrazení scény (např. 1500 ms)
    const minDisplayTime = 1500;
    const startTime = this.time.now;
    this.load.on('complete', () => {
      const elapsed = this.time.now - startTime;
      const delay = Math.max(0, minDisplayTime - elapsed);
      this.time.delayedCall(delay, () => {
        //this.scene.start('PlayScene');
        this.scene.start('Game');
      });
    });
  }

  create() {
    // nic dalšího už nenačítáme – přechod proběhne v load.on('complete')
  }
}
