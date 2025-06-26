'use strict'
import { BLUE_BUTTON_STYLE } from "../objects/buttons";
import { addFullscreenAndLandscape } from "../utils/fullscrandlandscape";

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
        //localStorage.setItem('cilSplnen', '1'); // PRO LADĚNÍ - po dokončení zakomentuj nebo smaž
        //localStorage.removeItem('cilSplnen');
        //dočasné vypnutí scény
        //this.scene.stop();
        //this.scene.start("GameFinal");
        //return;

        // Přidání fullscreen tlačítka a kontroly landscape (pouze Android)
        addFullscreenAndLandscape(this, 'fullscreen');

        // Pozadí
        const background = this.add.image(width / 2, height / 2, 'backgroundGame');
        background.setScale(width / 800 * 1.6, height / 600 * 1.25);
        background.preFX.addBlur(0, 4, 2, 2, 0xffffff, 4);

        // Text časovače (zatím skrytý)
        this.casText = this.add.text(width - 150, 81, '').setVisible(false);

        // Konstanty
        const TOTAL_TIME = 3 * 60 * 1000;
        const NUM_HEARTS = 10;
        this.interval = TOTAL_TIME / NUM_HEARTS;

        // Vytvoření skupin
        this.cards = this.add.group();
        this.hearts = this.add.group();

        // Rozmístění srdíček - nyní vlevo nahoře
        const heartSpacing = 30;
        let startX = 40; // <-- změna: začátek vlevo
        for (let i = 0; i < NUM_HEARTS; i++) {
            this.hearts.add(this.add.sprite(startX + i * heartSpacing, 50, 'heart').setScale(0.35)); // y=50 pro horní okraj
        }

        // Předdefinované hodnoty karet
        let values = Array.from({ length: 12 }, (_, i) => `card${i + 1}`).flatMap(v => [v, v]);
        Phaser.Utils.Array.Shuffle(values);

        // >>> TADY JE ROZHODOVÁNÍ <<<
        const cilSplnen = localStorage.getItem('cilSplnen') === '1';
        if (cilSplnen) {
            this.showStartBubble(null, true, () => {
                localStorage.removeItem('cilSplnen');
                this.showStartBubble(() => {
                    this.spawnCards(values);
                    this.startTimer();
                });
            });
            return; // Bez tohoto by hra jela dál...
        }

        // Pokud hráč nemá splněno:
        this.showStartBubble(() => {
            this.spawnCards(values);
            this.startTimer();
        });
    }

    /**
     * Univerzální bublina: pokud splněno=true, zobrazí dvě tlačítka; jinak normální intro s typewriter efektem.
     * @param {Function} callback - volá se při kliknutí na "Pokračovat"/"Hrát znovu"
     * @param {boolean} splneno - true pokud hráč už má splněno
     * @param {Function} hratznovuCallback - volá se při kliknutí na "Hrát znovu" (pouze při splněno)
     *
     * Lokalizuje text v bublině podle jazyka prohlížeče:
     * pokud je cs nebo sk, zobrazí češtinu, pokud pl, tak polštinu, jinak angličtinu.
    */
    getLocaleTexts() {
        const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        if (lang.startsWith('cs') || lang.startsWith('sk')) return 'cs';
        if (lang.startsWith('pl')) return 'pl';
        return 'en';
    }

    getTextsByLocale(locale) {
        return {
            cs: {
                done: 'Máš již splněno!\nChceš hrát znovu, nebo jen zobrazit souřadnice?',
                intro: 'Vítej ve hře!\n\nBude to boj s časem\nZa každých 18s ztratíš 1 život.',
                btn1done: 'Souřadnice',
                btn2done: 'Hrát',
                btn1intro: 'Pokračovat'
            },
            pl: {
                done: 'Już ukończone!\nChcesz zagrać ponownie czy tylko zobaczyć współrzędne?',
                intro: 'Witamy w grze!\n\nTo będzie walka z czasem\nCo 18s tracisz 1 życie.',
                btn1done: 'Współrzędne',
                btn2done: 'Graj',
                btn1intro: 'Kontynuuj'
            },
            en: {
                done: 'You have already completed it!\nDo you want to play again or just show the coordinates?',
                intro: 'Welcome to the game!\n\nIt will be a race against time\nEvery 18s you lose 1 life.',
                btn1done: 'Coordinates',
                btn2done: 'Play',
                btn1intro: 'Continue'
            }
        }[locale];
    }

    createBubbleBackground(width, height) {
        return this.add.rectangle(width / 2, height / 2, 500, 220, 0xffffff, 0.6)
            .setOrigin(0.5)
            .setStrokeStyle(4, 0x8c7ae6)
            .setDepth(10);
    }

    createBubbleText(width, height) {
        return this.add.text(width / 2, height / 2 - 35, '', {
            fontSize: 26,
            fontFamily: 'Playpen Sans Arabic',
            color: '#242424',
            align: 'center',
            wordWrap: { width: 440 }
        })
            .setOrigin(0.5)
            .setDepth(11);
    }

    showStartBubble(callback, splneno = false, hratznovuCallback = null) {
        const { width, height } = this.scale;
        const locale = this.getLocaleTexts();
        const t = this.getTextsByLocale(locale);

        // 1. Vytvoření kontejneru
        const bubbleContainer = this.add.container(0, 0);

        let fullText, btn1Label, btn2Label;
        if (splneno) {
            fullText = t.done;
            btn1Label = t.btn1done;
            btn2Label = t.btn2done;
        } else {
            fullText = t.intro;
            btn1Label = t.btn1intro;
            btn2Label = null;
        }

        // 2. Přidání pozadí a textu do kontejneru
        const bubbleBg = this.createBubbleBackground(width, height);
        bubbleContainer.add(bubbleBg);

        const bubbleText = this.createBubbleText(width, height);
        bubbleContainer.add(bubbleText);

        let charIndex = 0;
        const revealSpeed = 64;

        function handleClick() {
            bubbleContainer.destroy(); // Zničí vše včetně tlačítek, textu i pozadí
            if (splneno) {
                if (arguments[0] === 1 && callback) callback();
                else if (hratznovuCallback) hratznovuCallback();
            } else if (callback) {
                callback();
            }
        }

        const revealText = () => {
            if (charIndex <= fullText.length) {
                bubbleText.setText(fullText.substr(0, charIndex));
                charIndex++;
                this.time.delayedCall(revealSpeed, revealText, [], this);
            } else {
                createButtons();
            }
        };

        const createButtons = () => {
            let btn1 = this.add.text(width / 2 - (splneno ? 100 : 0), height / 2 + 60, btn1Label, BLUE_BUTTON_STYLE)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(12);
            bubbleContainer.add(btn1);

            let btn2 = null;
            if (splneno) {
                btn2 = this.add.text(width / 2 + 100, height / 2 + 60, btn2Label, BLUE_BUTTON_STYLE)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(12);
                bubbleContainer.add(btn2);
            }

            btn1.on('pointerdown', () => handleClick(1));
            if (btn2) btn2.on('pointerdown', () => handleClick(2));
        };

        revealText();
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
        localStorage.removeItem('cilSplnen'); // vždy smaž, ať je čisto

        this.add.text(this.scale.width / 2, this.scale.height / 2, message,
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
