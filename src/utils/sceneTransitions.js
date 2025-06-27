/**
 * Scene Transitions Utility - Hezké přechody mezi scénami pomocí camera fade
 * Nahrazuje základní Phaser scene.start() za plynulé fadeOut/fadeIn
 */

/**
 * Smooth přechod mezi scénami s camera fade efektem
 * @param {Phaser.Scene} currentScene - současná scéna
 * @param {string} targetScene - klíč cílové scény
 * @param {Object} options - možnosti přechodu
 */
export function fadeToScene(currentScene, targetScene, options = {}) {
    const {
        fadeOutDuration = 300,    // Délka fade out (ms)
        fadeInDuration = 300,     // Délka fade in (ms)
        color = 0x000000,         // Barva fade (černá)
        sceneData = {}           // Data pro předání do nové scény
    } = options;
    
    // Zabránění vícenásobnému spuštění během přechodu
    if (currentScene.isTransitioning) {
        return;
    }
    currentScene.isTransitioning = true;
    
    // Fade out současné scény
    currentScene.cameras.main.fadeOut(fadeOutDuration, 
        (color >> 16) & 255,  // červená
        (color >> 8) & 255,   // zelená
        color & 255           // modrá
    );
    
    // Po dokončení fade out spusť novou scénu
    currentScene.cameras.main.once('camerafadeoutcomplete', () => {
        // Spuštění nové scény
        currentScene.scene.start(targetScene, sceneData);
    });
}

/**
 * Fade in efekt pro začátek scény
 * @param {Phaser.Scene} scene - scéna pro fade in
 * @param {Object} options - možnosti efektu
 */
export function fadeInScene(scene, options = {}) {
    const {
        duration = 300,      // Délka fade in (ms)
        color = 0x000000     // Barva fade (černá)
    } = options;
    
    // Nastavení kamery na fade a spuštění fade in
    scene.cameras.main.fadeIn(duration,
        (color >> 16) & 255,  // červená
        (color >> 8) & 255,   // zelená
        color & 255           // modrá
    );
}

/**
 * Crossfade přechod - rychlejší varianta
 * @param {Phaser.Scene} currentScene - současná scéna
 * @param {string} targetScene - klíč cílové scény
 * @param {Object} options - možnosti přechodu
 */
export function crossfadeToScene(currentScene, targetScene, options = {}) {
    const {
        duration = 200,       // Rychlejší přechod
        color = 0x000000,
        sceneData = {}
    } = options;
    
    if (currentScene.isTransitioning) return;
    currentScene.isTransitioning = true;
    
    // Současně fade out i spuštění nové scény pro plynulejší přechod
    currentScene.cameras.main.fadeOut(duration,
        (color >> 16) & 255,
        (color >> 8) & 255,
        color & 255
    );
    
    // Spustit novou scénu s mírným zpožděním pro překrytí
    currentScene.time.delayedCall(duration * 0.6, () => {
        currentScene.scene.start(targetScene, sceneData);
    });
}

/**
 * Inicializace fade in pro novou scénu (zavolej v create())
 * @param {Phaser.Scene} scene - nová scéna
 * @param {Object} options - možnosti
 */
export function initSceneWithFade(scene, options = {}) {
    // Spuštění fade in efektu při vytvoření scény
    fadeInScene(scene, options);
    
    // Reset transition flag (pokud existuje)
    scene.time.delayedCall(options.duration || 300, () => {
        scene.isTransitioning = false;
    });
}
