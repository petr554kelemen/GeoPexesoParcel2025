
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class __Game extends Phaser.Scene {

	constructor() {
		super("Game");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	preload() {

		this.load.pack("clovicek-jde-asset-pack", "assets/animace/clovicek-jde-asset-pack.json");
		this.load.pack("clovicek-tlaci-asset-pack", "assets/animace/clovicek-tlaci-asset-pack.json");
		this.load.pack("preload-asset-pack", "assets/preload-asset-pack.json");
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(527, 394, "backgroundGame");
		background.blendMode = Phaser.BlendModes.SOURCE_OUT;
		background.scaleX = 0.8784867183713885;
		background.scaleY = 0.9624751673844308;
		background.alpha = 0.8;
		background.alphaTopLeft = 0.8;
		background.alphaTopRight = 0.8;
		background.alphaBottomLeft = 0.8;
		background.alphaBottomRight = 0.8;

		// text_1
		const text_1 = this.add.text(299, 287, "", {});
		text_1.setOrigin(0, 1);
		text_1.alphaTopRight = 0.84;
		text_1.alphaBottomLeft = 0.81;
		text_1.tintFill = true;
		text_1.text = "N 50°00.000\nE 17°00.000";
		text_1.setStyle({ "color": "#cc2d2dff", "fontFamily": "DynaPuff", "fontSize": "90px", "stroke": "#1f1818ff", "strokeThickness": 2, "shadow.offsetX": 4, "shadow.color": "#060606ff", "shadow.blur": 5, "shadow.stroke": true, "shadow.fill": true });

		// arcadeimage_1
		const arcadeimage_1 = this.physics.add.image(579, 483, "BednaSpritesheet", 0);
		arcadeimage_1.body.setSize(128, 118, false);

		// colliderBednaVsChlapik
		this.physics.add.collider(pic100, sprite_1);

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
