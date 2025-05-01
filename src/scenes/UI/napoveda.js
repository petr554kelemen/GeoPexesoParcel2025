import Phaser from 'phaser';
const { Blur } = Phaser.Renderer.WebGL.Pipelines.FX;

class Napoveda {
    constructor(scene, cilovaZona) {
        this.scene = scene;
        this.cilovaZona = cilovaZona;
        this.napovedaText = null;
        this.blurEffect = null;
        this.zobrazenaNapoveda = false;
    }

    init() {
        const napovedaString = `Tlačte do zelené zóny`;
        this.napovedaText = this.scene.add.text(this.cilovaZona.x, this.cilovaZona.y + this.cilovaZona.height / 2 + 20, napovedaString, {
            font: '16px Arial',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        this.napovedaText.setVisible(false);
    }

    updateBlur(bedna) {
        if (this.blurEffect && this.zobrazenaNapoveda) {
            const vzdalenostStredy = Phaser.Math.Distance.Between(
                bedna.body.center.x, bedna.body.center.y,
                this.cilovaZona.x, this.cilovaZona.y
            );

            const maxVzdalenostProZaostreni = 300;
            const minRozmazani = 0;
            const maxRozmazani = 10;

            let silaRozmazani = Phaser.Math.Linear(maxRozmazani, minRozmazani, Phaser.Math.Clamp(vzdalenostStredy / maxVzdalenostProZaostreni, 0, 1));

            this.tweens.add({
                targets: this.blurEffect,
                strength: silaRozmazani,
                duration: 200,
                ease: 'Linear',
                yoyo: false,
                repeat: 0
            });
        }
    }

    skryt() {
        if (this.zobrazenaNapoveda && this.blurEffect) {
            this.tweens.add({
                targets: this.blurEffect,
                strength: 10,
                duration: 200,
                ease: 'Linear',
                yoyo: false,
                repeat: -1
            });
            this.zobrazenaNapoveda = false;
            this.blurEffect = null; // Resetujeme efekt při skrytí
        } else if (this.zobrazenaNapoveda) {
            this.zobrazenaNapoveda = false;
        }
    }

    zobrazit() {
        if (!this.zobrazenaNapoveda && this.napovedaText && !this.blurEffect) {
            try {
                this.blurEffect = this.napovedaText.preFX.addBlur();
                this.tweens.add({
                    targets: this.blurEffect,
                    strength: .75,
                    duration: 0,
                    yoyo: false,
                    repeat: -1
                });
            } catch (error) {
                console.error("Chyba při inicializaci filtru rozmazání v Napoveda.zobrazit():", error);
                this.blurEffect = null;
            }
            this.napovedaText.setVisible(true);
            this.zobrazenaNapoveda = true;
        }
        this.updateBlur(bedna);
    }
}

class Game extends Phaser.Scene {
    create() {
        // ... tvůj stávající kód ...
        this.napoveda = new Napoveda(this, this.cilovaZonaVnitrniObjekt);
        this.napoveda.init();
    }

    update(time, delta) {
        // ... tvůj stávající kód ...
        if (this.napoveda && this.bedna && this.cilovaZonaVnitrniObjekt) {
            const bednaBounds = this.bedna.getBounds();
            const cilovaZonaBounds = this.cilovaZonaVnitrniObjekt.getBounds();

            if (Phaser.Geom.Rectangle.Overlaps(cilovaZonaBounds, bednaBounds) && this.bedna.body.speed < 5) {
                console.log('Hra dokončena - bedna zastavila v cíli!');
                // Zde můžeme spustit další herní akce po dokončení
            } else if (Phaser.Geom.Rectangle.Overlaps(cilovaZonaBounds, bednaBounds)) {
                this.napoveda.skryt(); // Skryjeme nápovědu, když je bedna v cíli a pohybuje se
            } else {
                this.napoveda.zobrazit(this.bedna); // Zobrazíme nápovědu, když bedna není v cíli
            }
        }
    }
}

export default Napoveda;