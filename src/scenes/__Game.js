
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

		// Nadpis
		const nadpis = this.add.text(494, 116, "", {});
		nadpis.setOrigin(0.5, 0.5);
		nadpis.text = "Finální souřadnice";
		nadpis.setStyle({ "align": "center", "backgroundColor": "#9bbbdbff", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "47px", "stroke": "#000000", "strokeThickness": 8, "shadow.offsetX": 10, "shadow.offsetY": 10, "shadow.color": "#624c4cff", "shadow.blur": 10, "shadow.fill": true });
		nadpis.setPadding({"left":10,"top":10,"right":10,"bottom":10});

		// clovicek-pohyb
		const clovicek_pohyb = this.add.sprite(132, 468, "_MISSING");
		clovicek_pohyb.setOrigin(0, 1);
		clovicek_pohyb.play("boy-go");

		// textNaE
		const textNaE = this.add.text(281, 350, "", {});
		textNaE.scaleY = 2;
		textNaE.setOrigin(0, 0.5);
		textNaE.text = "N 50°00.000\nE 17°00.000";
		textNaE.setStyle({ "backgroundColor": "", "fontFamily": "Georgia", "fontSize": "62px", "strokeThickness": 1, "shadow.offsetX": 10, "shadow.offsetY": 10, "shadow.color": "#7b6363ff", "shadow.blur": 5, "shadow.fill": true });
		textNaE.setPadding({"left":10,"top":10,"right":10,"bottom":10});

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
