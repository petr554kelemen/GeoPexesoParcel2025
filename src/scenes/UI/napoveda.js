//import Phaser from 'phaser';

import Phaser from 'phaser';

class Napoveda {
    constructor(scene, cilovaZona) {
        this.scene = scene;
        this.cilovaZona = cilovaZona;
        // this.napovedaText = null; // Už ho nevytváříme zde
        this.blurEffect = null; // Možná ho budeme chtít uložit
        this.zobrazenaNapoveda = false;
    }

    zobrazit() {
        if (this.scene.napovedaText) {
            this.scene.napovedaText.setVisible(true);
            this.zobrazenaNapoveda = true;
        }
    }

    skryt() {
        if (this.scene.napovedaText) {
            this.scene.napovedaText.setVisible(false);
            this.zobrazenaNapoveda = false;
        }
    }
}

export default Napoveda;