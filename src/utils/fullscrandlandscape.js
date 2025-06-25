/**
 * Přidá fullscreen tlačítko do Phaser scény (pouze na Androidu)
 * a overlay s výzvou k otočení zařízení do landscape na všech mobilních zařízeních.
 * @param {Phaser.Scene} scene - instance Phaser scény
 * @param {string} textureKey - klíč obrázku tlačítka (musí být načtený v preload)
 * @param {number} [x] - X pozice (výchozí: pravý horní roh s odsazením 20px)
 * @param {number} [y] - Y pozice (výchozí: 20px od horního okraje)
 * @param {number} [scale] - měřítko tlačítka (výchozí: 0.7)
 */
export function addFullscreenAndLandscape(scene, textureKey, x, y, scale = 0.7) {
    // Detekce mobilního zařízení
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Fullscreen tlačítko pouze na Androidu
    if (/Android/i.test(navigator.userAgent)) {
        const posX = x !== undefined ? x : scene.scale.width - 40;
        const posY = y !== undefined ? y : 40;

        const btn = scene.add.image(posX, posY, textureKey)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(1000)
            .setScale(scale);

        btn.on('pointerup', () => {
            if (!scene.scale.isFullscreen) {
                scene.scale.startFullscreen();
            }
        });

        scene.scale.on('enterfullscreen', () => btn.setVisible(false));
        scene.scale.on('leavefullscreen', () => btn.setVisible(true));
    }

    // Landscape overlay pro všechna mobilní zařízení
    if (isMobile) {
        let overlayBg, overlayText;
        
        function showOverlay() {
            if (!overlayBg) {
                overlayBg = scene.add.rectangle(
                    scene.scale.width / 2, scene.scale.height / 2,
                    scene.scale.width, scene.scale.height,
                    0x000000, 0.85
                ).setOrigin(0.5).setDepth(2000);
                overlayText = scene.add.text(
                    scene.scale.width / 2, scene.scale.height / 2,
                    'Prosím otočte zařízení na šířku (landscape).',
                    { font: 'bold 26px Arial', color: '#fff', align: 'center', wordWrap: { width: scene.scale.width - 60 } }
                ).setOrigin(0.5).setDepth(2001);
            } else {
                overlayBg.setVisible(true);
                overlayText.setVisible(true);
            }
            scene.scene.pause();
        }
        
        function hideOverlay() {
            if (overlayBg) overlayBg.setVisible(false);
            if (overlayText) overlayText.setVisible(false);
            scene.scene.resume();
        }
        
        function checkOrientation() {
            if (window.innerHeight > window.innerWidth) {
                showOverlay();
            } else {
                hideOverlay();
            }
        }
        
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        scene.events.once('destroy', () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        });
        
        // První kontrola po načtení scény
        setTimeout(checkOrientation, 200);
    }
}