import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.myPath = null;
    }

    preload() {
        this.load.json('myPathsData', 'assets/simple-path.json');
    }

    create() {
        const hardcodedPoints = [{ x: 100, y: 300 }, { x: 500, y: 300 }];

        try {
            const curve = new Phaser.Curves.Path();
            curve.lineTo(hardcodedPoints[0].x, hardcodedPoints[0].y);
            curve.lineTo(hardcodedPoints[1].x, hardcodedPoints[1].y);
            console.log('Křivka vytvořena:', curve);
        } catch (error) {
            console.error('Chyba při vytváření křivky:', error);
        }

        // Vytvoříme textový objekt pro zobrazení souřadnic
        const coordinatesText = this.add.text(10, 10, 'Souřadnice: 0, 0', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setDepth(1000); // Nastavíme depth, aby byl text vždy nahoře

        // Nastavíme posluchač události pohybu myši pro celou scénu
        this.input.on('pointermove', (pointer) => {
            // Aktualizujeme text s aktuálními souřadnicemi myši
            coordinatesText.setText(`Souřadnice: ${Math.floor(pointer.worldX)}, ${Math.floor(pointer.worldY)}`);
        });

        this.add.rectangle(600, 400, 20, 20, 0xff0000); // Červený čtverec o velikosti 20x20
    }

    update() {
        // Žádný kód pro update zatím
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game]
};

//const game = new Phaser.Game(config);