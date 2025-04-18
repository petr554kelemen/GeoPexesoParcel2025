export default class Game extends Phaser.Scene {
	constructor() {
		super("Game");
		this.myPath = null;
		this.clovicek = null;
		this.chlapik = null;
	}

	preload() {
		this.load.json('myPathsData', 'assets/simple-path.json');
		this.load.spritesheet('clovicek-sprite', 'assets/animace/clovicek_jde.png', { frameWidth: 110, frameHeight: 140 });
		this.load.image('bedna-sprite', "assets/krabička.png");
		this.load.atlas('clovicek-tlaci', 'assets/animace/clovicek_tlaci.png','assets/animace/clovicek_tlaci.json');
	}

	editorCreate() {
		const background = this.add.image(510, 384, "backgroundGame");
		background.scaleX = 0.8784867183713885;
		background.scaleY = 0.9624751673844308;

		const text = this.add.text(512, 384, "zde bude vyhodnocení", {
			align: "center",
			color: "#ffffff",
			fontFamily: "Arial Black",
			fontSize: "38px",
			stroke: "#000000",
			strokeThickness: 8
		});

		this.events.emit("scene-awake");
	}

	create() {
		const pathsData = this.cache.json.get('myPathsData');
		this.myPath = pathsData.paths.simplePath;

		if (!this.anims.exists('animace-chuze')) {
			this.anims.create({
				key: 'animace-chuze',
				frames: this.anims.generateFrameNumbers('clovicek-sprite', { start: 0, end: 7 }),
				frameRate: 8,
				repeat: -1, // Přehrávání v cyklu
				timescale: 1
			});
		}

			if (!this.anims.exists('animace-tlaku')) {
			this.anims.create({
				key: 'animace-tlaku',
				frames: 'clovicek-tlaci',
				frameRate: 10,
				repeat: -1, // Přehrávání v cyklu
				timescale: 1
			});
		}

		// Vytvoření pozadí
		this.editorCreate();

		// Nastavení a spuštění fyziky
		this.chlapik = this.physics.add.sprite(this.myPath.points[0].x, this.myPath.points[0].y, 'clovicek-sprite');
		this.bedna = this.physics.add.sprite(500, 500, 'bedna-sprite');
		this.bedna.scale = 0.1;

		// Nastavení hloubky vykreslování
		this.bedna.setDepth(1);
		this.chlapik.setDepth(2);

		this.chlapik.setBodySize(100, 140);
		this.bedna.setBodySize(150, 150);

		this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);

		// Nastavení vlastností fyzikálních objektů
		this.chlapik.setCollideWorldBounds(true);
		//this.bedna.setImmovable(true);

		//tlaceni bedny
		this.physics.add.collider(this.chlapik, this.bedna, this.handleCollision, null, this);

    	// Nastavení, že bedna může být tlačena
    	this.bedna.setImmovable(false);

		if (this.myPath && Array.isArray(this.myPath.points) && this.myPath.points.length > 1) {
			this.chlapik.play('animace-chuze');

			this.pathIndex = 1; // Začneme od druhého bodu na dráze

		} else {
			console.warn('Cesta v JSONu neobsahuje alespoň dva body.');
		}

		this.input.once('pointerdown', () => {
			this.scene.start('GameOver');
		});
	}

	handleCollision(chlapik, bedna) {
		chlapik.body.setVelocity(0); // Zastavení pohybu "chlapíka"
		chlapik.play('animace-tlaku'); // Přehrání animace tlačení
	}

	update() {
		if (this.myPath && this.myPath.points && this.pathIndex < this.myPath.points.length) {
			const targetPoint = this.myPath.points[this.pathIndex];

			// Pohyb "chlapíka" k cílovému bodu
			this.physics.moveToObject(this.chlapik, targetPoint, 60);

			// Kontrola, zda "chlapík" dosáhl cílového bodu
			const distance = Phaser.Math.Distance.Between(this.chlapik.x, this.chlapik.y, targetPoint.x, targetPoint.y);
			if (distance < 5) {
				this.pathIndex++;
			}
		} else {
			// Zastavení pohybu a přehrání animace dřepu
			if (this.chlapik && this.chlapik.body.speed > 0) {
				this.chlapik.body.setVelocity(0);
				this.chlapik.play('animace-tlaku');
				this.chlapik.body.setVelocity(3);
			}
		}

		// Přehrání animace chůze, pokud se "chlapík" pohybuje
		if (this.chlapik && this.chlapik.body.speed > 0) {
			console.log('Chlapík se pohybuje!'); // Ověření detekce pohybu
			if (this.chlapik.anims.currentAnim.key !== 'animace-chuze') {
				this.chlapik.play('animace-chuze');
			}
		}
	}
}