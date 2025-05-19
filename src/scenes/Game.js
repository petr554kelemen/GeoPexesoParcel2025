'use strict'

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init() {
        // Reset herního stavu
        this.gameOver = false;
        this.selectedCards = [];
        this.cards = null;
        this.hearts = null;
        this.heartsRemoved = 0;
        this.interval = 0;
        this.index = 0;
    }

    preload() {
        // Pluginy a atlas se načítají ve scéně Boot
    }

    create() {
        const { width, height } = this.scale;
        //dočasné vypnutí scény
        this.scene.stop();
        this.scene.start("GameFinal");
        return;

        // Pozadí
        const background = this.add.image(width / 2, height / 2, 'backgroundGame');
        background.setScale(width / 800 * 1.6, height / 600 * 1.25);
        background.preFX.addBlur(0, 4, 2, 2, 0xffffff, 4);

        // Text časovače (zatím skrytý)
        this.casText = this.add.text(width - 150, 31, '').setVisible(false);

        // Konstanty
        const TOTAL_TIME = 3 * 60 * 1000;
        const NUM_HEARTS = 10;
        this.interval = TOTAL_TIME / NUM_HEARTS;

        // Vytvoření skupin
        this.cards = this.add.group();
        this.hearts = this.add.group();

        // Rozmístění srdíček
        const heartSpacing = 30;
        let startX = width - 350;
        for (let i = 0; i < NUM_HEARTS; i++) {
            this.hearts.add(this.add.sprite(startX + i * heartSpacing, 50, 'heart').setScale(0.35));
        }

        // Předdefinované hodnoty karet
        let values = Array.from({ length: 12 }, (_, i) => `card${i + 1}`).flatMap(v => [v, v]);
        Phaser.Utils.Array.Shuffle(values);

        // Úvodní bublina s informací
        this.showStartBubble(() => {
            this.spawnCards(values);
            this.startTimer();
        });
    }

    showStartBubble(callback) {
        const { width, height } = this.scale;

        const bubbleBg = this.add.rectangle(width / 2, height / 2, 500, 200, 0xeeeeee)
            .setOrigin(0.5).setStrokeStyle(4, 0x8c7ae6).setDepth(2);

        const bubbleText = this.add.text(width / 2, height / 2,
            'Vítej ve hře!\nZa každých 18s ztratíš 1 život.\nKlikni pro spuštění.',
            { fontSize: 28, fontFamily: 'Playpen Sans Arabic', color: '#242424', align: 'center' })
            .setOrigin(0.5).setDepth(3);

        const container = this.add.container(0, 0, [bubbleBg, bubbleText]);

        this.input.once('pointerdown', () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    container.destroy();
                    callback();
                }
            });
        });
    }

    spawnCards(values) {
        const { width, height } = this.scale;

        const NUM_COLS = 6, NUM_ROWS = 4;
        const CARD_WIDTH = 150, CARD_HEIGHT = 152;

        const padX = (width - (NUM_COLS * CARD_WIDTH)) / (NUM_COLS + 1);
        const padY = (height - (NUM_ROWS * CARD_HEIGHT)) / (NUM_ROWS + 3);

        const startX = padX + CARD_WIDTH / 2;
        const startY = padY + CARD_HEIGHT / 2 + 50;

        let i = 0;
        for (let row = 0; row < NUM_ROWS; row++) {
            for (let col = 0; col < NUM_COLS; col++) {
                const card = this.add.sprite(width / 2, height / 2, 'pexeso', 'cardback')
                    .setInteractive().setData('value', values[i]);

                card.on('pointerdown', () => this.flipCard(card));
                this.cards.add(card);

                this.tweens.add({
                    targets: card,
                    x: startX + col * (CARD_WIDTH + padX),
                    y: startY + row * (CARD_HEIGHT + padY),
                    duration: 500 + i * 50,
                    ease: 'Cubic.Out'
                });

                i++;
            }
        }
    }

    startTimer() {
        this.heartTimer = this.time.addEvent({
            delay: this.interval,
            callback: () => {
                if (this.heartsRemoved < this.hearts.getLength()) {
                    const heart = this.hearts.getChildren()[this.heartsRemoved++];
                    heart.setTint(0x808080).setAlpha(0.5);

                    if (this.heartsRemoved === this.hearts.getLength()) {
                        this.endGame('Vypršel časový limit\nZkusit znovu?');
                    }
                }
            },
            loop: true
        });
    }

    endGame(message) {
        this.gameOver = true;
        if (this.heartTimer) this.heartTimer.destroy();

        const text = this.add.text(this.scale.width / 2, this.scale.height / 2, message,
            { align: 'center', fontSize: 40, color: '#8c7ae6', fontStyle: 'bold' })
            .setOrigin(0.5).setDepth(3).setInteractive();

        this.time.delayedCall(800, () => {
            this.input.once('pointerdown', () => this.scene.restart());
        });
    }

    flipCard(card) {
        if (this.selectedCards.length >= 2 || this.selectedCards.includes(card) || this.gameOver) return;

        const value = card.getData('value');
        card.baseY = card.y;

        const flip = this.plugins.get('rexflipplugin').add(card, {
            duration: 800,
            face: 'back',
            front: { frame: value },
            back: { frame: 'cardback' },
            flipAxis: 'y',
            perspective: 600,
            ease: 'Sine.InOut'
        });

        flip.flip();
        this.selectedCards.push(card);

        this.tweens.add({
            targets: card,
            y: card.baseY - 10,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            ease: 'Sine.Out',
            onComplete: () => {
                if (this.selectedCards.length === 2) this.checkMatch();
            }
        });
    }

    checkMatch() {
        const [c1, c2] = this.selectedCards;
        const match = c1.getData('value') === c2.getData('value');

        if (match) {
            this.time.delayedCall(800, () => {
                this.removeMatchedCards(c1, c2);
                this.selectedCards = [];
            });
        } else {
            this.time.delayedCall(1200, () => {
                this.flipBack(c1);
                this.flipBack(c2);
                this.selectedCards = [];
            });
        }
    }

    removeMatchedCards(c1, c2) {
        [c1, c2].forEach(card => {
            this.tweens.add({
                targets: card,
                y: card.y + 15,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Sine.In',
                onComplete: () => card.destroy()
            });
        });

        // Kontrola vítězství
        if (this.cards.getChildren().length <= 2) {
            this.scene.start('GameFinal');
        }
    }

    flipBack(card) {
        const value = card.getData('value');

        this.plugins.get('rexflipplugin').add(card, {
            duration: 300,
            face: 'front',
            front: { frame: value },
            back: { frame: 'cardback' },
            flipAxis: 'y',
            perspective: 800,
            ease: 'Sine.InOut'
        }).flip();

        this.tweens.add({
            targets: card,
            y: card.baseY,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Sine.In'
        });
    }

    update() {
        // Herní smyčka není potřeba, vše řešeno událostmi
    }
}
