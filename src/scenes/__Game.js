
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
		const background = this.add.image(500, 390, "backgroundGame");
		background.blendMode = Phaser.BlendModes.SOURCE_OUT;
		background.scaleX = 0.8784867183713885;
		background.scaleY = 0.9624751673844308;
		background.alpha = 0.8;
		background.alphaTopLeft = 0.8;
		background.alphaTopRight = 0.8;
		background.alphaBottomLeft = 0.8;
		background.alphaBottomRight = 0.8;

		// pic100
		const pic100 = this.add.image(355, 503, "Pic10", 0);
		pic100.setOrigin(1, 1);

		// sprite_1
		const sprite_1 = this.add.sprite(361, 501, "_MISSING");
		sprite_1.setOrigin(0, 1);

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
