'use strict'

//import casomira from './casomirascene.js';
//import texty from './texty.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });

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
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const bck_ground = this.add.image(gameWidth / 2, gameHeight / 2, "backgroundGame");
        bck_ground.scaleX = gameWidth / 800 * 1.6; // Přizpůsobení škály pozadí
        bck_ground.scaleY = gameHeight / 600 * 1.25;
        bck_ground.preFX.addBlur(0, 4, 2, 2, 16777215, 4);

        this.casText = this.add.text(gameWidth - 150, 31, '');

        this.cards = this.add.group();
        this.selectedCards = [];
        let cardValues = ['card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4', 'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8', 'card9', 'card9',
            'card10', 'card10', 'card11', 'card11', 'card12', 'card12'];

        Phaser.Utils.Array.Shuffle(cardValues);

        const numCols = 6;
        const numRows = 4;
        const cardWidth = 150; // Šířka karty (pro výpočet mezer)
        const cardHeight = 152; // Výška karty

        // Výpočet počáteční pozice a mezer
        const paddingX = (gameWidth - (numCols * cardWidth)) / (numCols + 1);
        const paddingY = (gameHeight - (numRows * cardHeight)) / (numRows + 3); // Trochu větší mezera nahoře a dole

        let startX = paddingX + cardWidth / 2;
        let startY = paddingY + cardHeight / 2 + 30; // Mírné posunutí dolů
        let stepX = cardWidth + paddingX;
        let stepY = cardHeight + paddingY;
        let index = 0;

        // Počáteční pozice pro všechny karty (střed obrazovky)
        const startPileX = gameWidth / 2;
        const startPileY = gameHeight / 2;

        // Rozmístění karet s animací
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let card = this.add.sprite(startPileX, startPileY, 'pexeso', 'cardback') // Počáteční pozice
                    .setInteractive()
                    .setData('value', cardValues[index]);

                card.on('pointerdown', () => {
                    this.flipCard(card);
                });

                this.cards.add(card);

                // Animace pro "přilétnutí" karty na její pozici
                this.tweens.add({
                    targets: card,
                    x: startX + col * stepX,
                    y: startY + row * stepY,
                    duration: 500 + index * 50, // Postupné zpoždění animací
                    ease: 'Cubic.Out'
                });

                index++;
            }
        }

        this.odpocetCasu = this.plugins.get('rexlifetimeplugin').add(this.cards, {
            lifeTime: 3 * 60 * 1000,
            destroy: false,
            start: true
        });

        this.odpocetCasu.on('complete', () => {
            this.goToText(this, "Vypršel časový limit\nZkusit znovu?");

            this.input.once('pointerdown', () => {
                this.add.tween({
                    targets: this.goToText(this, "Vypršel časový limit\nZkusit znovu?"),
                    ease: Phaser.Math.Easing.Bounce.InOut,
                    y: -1000,
                    onComplete: () => {
                        let scene = this;

                        scene.scene.transition({
                            target: scene,
                            data: null,
                            duration: 3000,
                            remove: true,
                        });

                        this.scene.stop();
                        this.scene.run('Game');
                    }
                });
            });
        });
    }

    flipCard(card) {
    if (this.selectedCards.length < 2 && !this.selectedCards.includes(card)) {
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
        this.tweens.add({
            targets: card,
            y: card.y - 15, // Mírné posunutí nahoru
            scaleX: 1.05, // Mírné zvětšení
            scaleY: 1.05,
            duration: 200,
            ease: 'Sine.Out',
            onStart: () => {
                // Přidáme stín, pokud jsme ho předtím chtěli
                // card.preFX.addShadow(5, 5, 0.1, 0.8, 0, 2, 0.8);
            },
            onComplete: () => {
                if (this.selectedCards.length === 2) {
                    this.checkMatch();
                }
            }
        });
    }
    // Pokud je karta již vybraná, neděláme nic
}

    checkMatch() {
    let [card1, card2] = this.selectedCards;

    const removeShadow = (card) => {
        card.preFX.clear();
        card.setDepth(0); // Vrátíme hloubku na výchozí hodnotu
    };

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
                    //removeShadow(card1);
                    //removeShadow(card2);
                    card1.destroy();
                    card2.destroy();
                    if (this.cards.getChildren().length === 0) {
                        this.scene.start('EndGame');
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
                        duration: 1000,
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
                duration: 1000,
            });
            chain.restart();
        });
        this.selectedCards = [];
    } else {
        this.time.delayedCall(1500, () => {
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
                y: (card) => card.y + 15,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Sine.In',
                onComplete: () => {
                    removeShadow(card1);
                    removeShadow(card2);
                    this.selectedCards = [];
                }
            });
        });
    }
}

    goToText(scene, txt) {
        scene.add.text(this.sys.game.scale.width / 2, this.sys.game.scale.height / 2,
            txt,
            { align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#8c7ae6" }
        )
            .setOrigin(.5)
            .setDepth(3)
            .setInteractive();
    }

    update() {
        let time = Phaser.Math.RoundTo(this.odpocetCasu.remainder / 1000, 0);
       
        if (time < 30) {
            this.casText.text = time;
        }
    }
}