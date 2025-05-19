'use strict'

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });        
    }

    init() {
        this.gameOver = false;
        this.odpocetCasu = null;
        this.casText = null;
        this.card = null;
    }

    preload() {
        //this.load.plugin('rexflipplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexflipplugin.min.js', true);
        //this.load.plugin('rexlifetimeplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexlifetimeplugin.min.js', true);
        //this.load.atlas("pexeso", "assets/images/atlas_pexeso.png", "assets/images/atlas_pexeso_atlas.json");
    }

    create() {
        //const self = this;

        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const bck_ground = this.add.image(gameWidth / 2, gameHeight / 2, "backgroundGame");
        bck_ground.scaleX = gameWidth / 800 * 1.6;
        bck_ground.scaleY = gameHeight / 600 * 1.25;

        bck_ground.preFX.addBlur(0, 4, 2, 2, 16777215, 4);
        this.casText = this.add.text(gameWidth - 150, 31, '').setVisible(false);

        const totalTime = 3 * 60 * 1000;
        const numHearts = 10;
        this.interval = totalTime / numHearts;
        this.heartsRemoved = 0;
        this.timerStarted = false;
        this.hearts = this.add.group();
        this.cards = this.add.group();
        this.selectedCards = [];

        let cardValues = ['card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4', 'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8', 'card9', 'card9',
            'card10', 'card10', 'card11', 'card11', 'card12', 'card12'];

        Phaser.Utils.Array.Shuffle(cardValues);

        const numCols = 6;
        const numRows = 4;
        const cardWidth = 150;
        const cardHeight = 152;
        const paddingX = (gameWidth - (numCols * cardWidth)) / (numCols + 1);
        const paddingY = (gameHeight - (numRows * cardHeight)) / (numRows + 3);
        let startX = paddingX + cardWidth / 2;
        let startY = paddingY + cardHeight / 2 + 50;
        let stepX = cardWidth + paddingX;
        let stepY = cardHeight + paddingY;
        this.index = 0;

        const startPileX = gameWidth / 2;
        const startPileY = gameHeight / 2;

        // Vytvoření pozadí bubliny
        const bubbleBackground = this.add.rectangle(gameWidth / 2, gameHeight / 2, 500, 200, 0xeeeeee)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x8c7ae6)
            .setDepth(2)
            .setInteractive() // Aby se na ni dalo kliknout pro zavření

        // Vytvoření textu bubliny
        const bubbleText = this.add.text(gameWidth / 2, gameHeight / 2,
            "Vítej ve hře !\nZa každých odehraných 18s,\nztracíš 1 život. Je to boj s časem.\nKlikni pro spuštění.",
            {
                fontFamily: "Playpen Sans Arabic",
                fontSize: 30,
                color: '#242424',
                align: 'center'
            })
            .setOrigin(0.5)
            .setDepth(3);

        // Skupina pro bublinu (pro snadnější manipulaci)
        const infoBubble = this.add.container(0, 0, [bubbleBackground, bubbleText]);

        // Vytvoření srdíček
        this.hearts = this.add.group();
        const heartSpacing = 30;
        let startHeartX = gameWidth - 350;
        const heartY = 50;

        for (let i = 0; i < 10; i++) {
            const heart = this.add.sprite(startHeartX + i * heartSpacing, heartY, 'heart').setScale(0.35);
            this.hearts.add(heart);
        }

        // Funkce pro spuštění hry (rozdání karet a skrytí bubliny)
        const startGame = () => {
            this.input.off('pointerdown', startGame); // Odstranění listeneru kliknutí

            // Animace zmizení bubliny
            this.tweens.add({
                targets: infoBubble,
                alpha: 0,
                duration: 1000,
                ease: 'Linear',
                onComplete: () => { // Změníme zpět na standardní funkci
                    infoBubble.destroy();

                    // Spuštění časovače ubírání srdíček ZDE!
                    this.timerStarted = true;
                    this.heartTimer = this.time.addEvent({
                        delay: this.interval,
                        callback: () => {
                            if (this.heartsRemoved < this.hearts.getChildren().length) {
                                const heartToRemove = this.hearts.getChildren()[this.heartsRemoved];
                                heartToRemove.setTint(0x808080);
                                heartToRemove.setAlpha(0.5);
                                this.heartsRemoved++;
                            } else {
                                if (this.heartTimer) {
                                    this.heartTimer.destroy();
                                }
                                //this.scene.pause(this);
                                this.gameOver = true;
                                this.goToText(this, "Vypršel časový limit\nZkusit znovu?");
                                this.input.once('pointerdown', () => {
                                    this.scene.restart();
                                });
                            }
                        },
                        callbackScope: this,
                        loop: true
                    });

                    // Animace rozdávání karet
                    for (let row = 0; row < numRows; row++) {
                        for (let col = 0; col < numCols; col++) {
                            const card = this.add.sprite(startPileX, startPileY, 'pexeso', 'cardback')
                                .setInteractive()
                                .setData('value', cardValues[this.index]);

                            card.on('pointerdown', () => {
                                this.flipCard(card);
                            });

                            if (!this.cards) {
                                console.log("this.cards vratil false");

                            } else this.cards.add(card);


                            this.tweens.add({
                                targets: card,
                                x: startX + col * stepX,
                                y: startY + row * stepY,
                                duration: 500 + this.index * 50,
                                ease: 'Cubic.Out'
                            });

                            this.index++;
                        }
                    }
                }
            });
        };

        // Spuštění hry po kliknutí na obrazovku
        this.input.once('pointerdown', startGame);
    }

    removeHeartDelayed() {
        if (this.heartsRemoved < this.hearts.getChildren().length) {
            this.time.delayedCall(this.interval, () => {
                const heartToRemove = this.hearts.getChildren()[this.heartsRemoved];
                heartToRemove.setTint(0x808080);
                heartToRemove.setAlpha(0.5);
                this.heartsRemoved++;
                this.removeHeartDelayed(); // Naplánujeme další odebrání
            }, this);
        } else {
            //this.scene.pause(this);
            this.gameOver = true;
            this.goToText(this, "Vypršel časový limit\nZkusit znovu?");
            this.input.once('pointerdown', () => {
                this.scene.restart();
            });
        }
    }

    flipCard(card) {

        if (this.selectedCards.length < 2 && !this.selectedCards.includes(card) && !this.gameOver) {
            let value = card.getData('value');

            let flip = this.plugins.get('rexflipplugin').add(card, {
                duration: 800, // Zkrátíme trvání pro svižnější efekt
                face: 'back',
                front: { frame: value },
                back: { frame: 'cardback' },
                flipAxis: 'y', // Otočení kolem svislé osy (pro standardní flip)
                perspective: 600, // Přidáme perspektivu pro 3D dojem
                ease: 'Sine.InOut', // Plynulejší easing
            });

            flip.flip();

            this.selectedCards.push(card);

            // Aplikace efektu levitace a zvětšení
            card.baseY = card.y;
            this.tweens.add({
                targets: card,
                y: card.baseY - 10, // Mírné posunutí nahoru
                scaleX: 1.1, // Mírné zvětšení
                scaleY: 1.1,
                duration: 150,
                ease: 'Sine.Out',
                onComplete: () => {
                    if (this.selectedCards.length === 2) {
                        // Falešný stín                        
                        let shadow = this.add.image(card.x + 8, card.y + 8, 'card');
                        shadow.setTint(0x000000);
                        shadow.setAlpha(0.5);
                        shadow.setScale(1);
                        shadow.setDepth(card.depth - 1); // Pod kartu
                        card.shadow = shadow;

                        this.checkMatch();
                    }
                }
            });
        }
    }

    checkMatch() {
        let [card1, card2] = this.selectedCards;

        if (card1.getData('value') === card2.getData('value')) {
            this.time.delayedCall(800, () => {
                this.tweens.add({
                    targets: [card1, card2],
                    y: (card) => card.y + 15,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Sine.In',
                    onComplete: () => {
                        card1.destroy();
                        card2.destroy();

                        //if (window.DEBUG_MODE) console.log('this.cards:', this.cards);
                        //if (window.DEBUG_MODE) console.log('this:', this);

                        if (this.cards.getChildren().length === 0) {
                            this.scene.stop();
                            this.scene.start('GameFinal'); //prepnuti na finalni scénu
                        };
                    }
                });

                let chain = this.tweens.chain({
                    targets: card1,
                    tweens: [
                        {
                            x: -2000,
                            y: -1000,
                            alpha: .5,
                            ease: 'Cubic',
                            duration: 800,
                        },
                    ],
                    completeDelay: 0,
                    loop: 0,
                    repeatDelay: 0,
                    paused: false,
                    persist: false,
                });

                chain.add({
                    targets: card2,
                    x: -2000,
                    y: -1000,
                    alpha: .5,
                    ease: 'Cubic',
                    duration: 800,
                });

                chain.restart();
            });
            this.selectedCards = [];

        } else {
            this.time.delayedCall(1200, () => {

                // Otočení karet zpět pomocí flip pluginu
                let flip1 = this.plugins.get('rexflipplugin').add(card1, {
                    duration: 300,
                    face: 'front', // Začínáme zobrazenou stranou
                    front: { frame: card1.getData('value') },
                    back: { frame: 'cardback' },
                    flipAxis: 'y',
                    perspective: 800,
                    ease: 'Sine.InOut',
                });

                flip1.flip();

                let flip2 = this.plugins.get('rexflipplugin').add(card2, {
                    duration: 300,
                    face: 'front',
                    front: { frame: card2.getData('value') },
                    back: { frame: 'cardback' },
                    flipAxis: 'y',
                    perspective: 800,
                    ease: 'Sine.InOut',
                });

                flip2.flip();

                this.tweens.add({
                    targets: [card1, card2],
                    y: (card) => card.baseY,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Sine.In',
                    onComplete: (card) => {
                        if (card.shadow) card.shadow.destroy();
                        this.selectedCards = [];
                    }
                });
            });
        }
    }

    goToText(scene, txt) {
        scene.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height / 2,
            txt,
            { align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#8c7ae6" })
            .setOrigin(.5)
            .setDepth(3)
            .setInteractive();
    }

    update() {

    }
}