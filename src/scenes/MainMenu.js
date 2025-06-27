/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { fadeToScene, initSceneWithFade } from "../utils/sceneTransitions.js";
/* END-USER-IMPORTS */

export default class MainMenu extends Phaser.Scene {

	constructor() {
		super("MainMenu");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(526, 382, "backgroundGame");
		background.scaleX = 0.9;
		background.scaleY = 0.95;

		// logo
		const logo = this.add.text(146, 338, "", {});
		logo.text = "Geocaching PEXESO";
		logo.setStyle({ "align": "center", "backgroundColor": "#c8ca9f6c", "color": "#c21e1eff", "fontFamily": "Arial", "fontSize": "72px", "fontStyle": "bold", "stroke": "#eee9e9ff", "strokeThickness": 2 });

		// text
		const text = this.add.text(512, 460, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "Spustit hru";
		text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here
	create() {
		// Fade in efekt při spuštění scény
		initSceneWithFade(this);
		
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'backgroundGame');

		this.editorCreate();

		this.input.once('pointerdown', () => {

			fadeToScene(this, 'Game');

		});
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
