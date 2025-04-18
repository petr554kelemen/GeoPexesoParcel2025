/* START OF COMPILED CODE */
//import PathBuilder from 'phaser3-plugin-pathbuilder/dist/PathBuilder.js';
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Game extends Phaser.Scene {


	constructor() {
		super("Game");

		/* START-USER-CTR-CODE */
		// Write your code here.
		this.myPath = null;
		this.objekt = null;

		/* END-USER-CTR-CODE */
	}

	preload() {
		//this.load.baseURL = 'https://cdn.rawgit.com/samid737/phaser3-plugin-pathbuilder/v1.8.0/';
		//this.load.plugin('PathBuilder.min', 'dist/PathBuilder.min.js', 'PathBuilder');

		// Načti svůj JSON soubor. Ujisti se o správné cestě.
		this.load.json('myPathsData', 'assets/simple-path.json');
		//this.load.json('myPathsData', 'assets/simple-path.json');

		// Načti také assety pro sprite, pokud ho chceš po cestě pohybovat
		this.load.spritesheet('clovicek-jde', 'assets/animace/clovicek_jde.png', { frameWidth: 110, frameHeight: 140 });
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(510, 384, "backgroundGame");
		background.blendMode = Phaser.BlendModes.SOURCE_OUT;
		background.scaleX = 0.8784867183713885;
		background.scaleY = 0.9624751673844308;
		background.alpha = 0.8;
		background.alphaTopLeft = 0.8;
		background.alphaTopRight = 0.8;
		background.alphaBottomLeft = 0.8;
		background.alphaBottomRight = 0.8;

		// text
		const text = this.add.text(512, 384, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "zde bude vyhodnocení";
		text.setStyle({ "align": "center", "color": "#ffffff", "fontFamily": "Arial Black", "fontSize": "38px", "stroke": "#000000", "strokeThickness": 8 });

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		const pathsData = this.cache.json.get('myPathsData');
		this.myPath = pathsData.paths.simplePath;

		this.anims.create({
			key: 'boy-go',
			frames: this.anims.generateFrameNumbers('clovicek-jde', { start: 1, end: -1 }),
			frameRate: 8,
			repeat: -1
		});

		this.editorCreate();

		if (this.myPath && Array.isArray(this.myPath.points) && this.myPath.points.length > 1) {
			const clovicek = this.add.sprite(this.myPath.points[0].x, this.myPath.points[0].y, 'clovicek-jde', 0).setOrigin(0.5, 0.5);
			clovicek.play('boy-go');

			let currentTween = null;
			const createTween = (target, x, y, duration, ease, onCompleteCallback) => {
				return this.tweens.add({
					targets: target,
					x: x,
					y: y,
					duration: duration,
					ease: ease,
					onComplete: onCompleteCallback
				});
			};

			const createTweenChain = (target, points, index, reverse) => {
				if (index >= 0 && index < points.length) {
					const currentPoint = points[index];
					const nextPoint = points[index + (reverse ? -1 : 1)];

					if (nextPoint) {
						// Nastavíme flipX podle směru pohybu
						if (nextPoint.x > currentPoint.x) {
							target.flipX = false; // Pohyb doprava
						} else if (nextPoint.x < currentPoint.x) {
							target.flipX = true; // Pohyb doleva
						}

						// Nastavíme easing podle směru pohybu
						const ease = index === points.length - 2 ? 'Linear' : currentPoint.y > nextPoint.y ? 'Sine.easeOut' : 'Sine.easeIn'; // Lineární pro poslední segment

						currentTween = createTween(
							target,
							currentPoint.x,
							currentPoint.y,
							2000,
							ease,
							() => createTweenChain(target, points, index + (reverse ? -1 : 1), reverse)
						);
					} else {
						// Pro couvání použijeme lineární easing
						currentTween = createTween(
							target,
							currentPoint.x,
							currentPoint.y,
							2000,
							'Linear',
							() => createTweenChain(target, points, index + (reverse ? -1 : 1), !reverse)
						);
					}
				} else {
					createTweenChain(target, points, reverse ? points.length - 2 : 1, !reverse);
				}
			};

			createTweenChain(clovicek, this.myPath.points, 1, false); // Spustíme řetězec Tweenů
		} else {
			console.warn('Cesta v JSONu neobsahuje alespoň dva body.');
		}

	}

	update(time, delta) {
		//this.t += this.speed;
		//if (this.t > 1) {
		//	this.t = 0; // Začít znovu od začátku cesty
		//}
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */
// You can write more code here
