/**
 * Přidá fullscreen tlačítko do Phaser scény (pouze na Androidu)
 * a overlay s výzvou k otočení zařízení do landscape na všech mobilních zařízeních.
 * Tlačítko umožňuje přepínání mezi fullscreen a windowed režimem a zůstává viditelné v obou stavech.
 * @param {Phaser.Scene} scene - instance Phaser scény
 * @param {string} textureKey - klíč obrázku tlačítka (musí být načtený v preload)
 * @param {number} [x] - X pozice (výchozí: pravý horní roh s odsazením 20px)
 * @param {number} [y] - Y pozice (výchozí: 20px od horního okraje)
 * @param {number} [scale] - měřítko tlačítka (výchozí: 2.0 pro mobil)
 */
export function addFullscreenAndLandscape(scene, textureKey, x, y, scale) {
    // Detekce mobilního zařízení
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Výchozí škála podle zařízení - větší pro mobilní dotyková zařízení
    if (scale === undefined) {
        scale = isMobile ? 2.0 : 1.2; // 48-60px pro mobil, ~29px pro desktop
    }
    
    // Fullscreen tlačítko pouze na Androidu
    if (/Android/i.test(navigator.userAgent)) {
        // Pozice s ohledem na velikost ikony (větší ikona = více místa od okraje)
        const iconSize = 24 * scale; // předpokládaná velikost původní ikony 24px
        const margin = Math.max(30, iconSize / 2 + 15); // větší margin pro větší tlačítko
        
        const posX = x !== undefined ? x : scene.scale.width - margin;
        const posY = y !== undefined ? y : margin;

        const btn = scene.add.image(posX, posY, textureKey)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(1000)
            .setScale(scale);

        // Funkce pro přepínání fullscreen režimu
        const toggleFullscreen = () => {
            if (scene.scale.isFullscreen) {
                scene.scale.stopFullscreen();
            } else {
                scene.scale.startFullscreen();
            }
        };

        // Funkce pro aktualizaci vzhledu tlačítka podle stavu
        const updateButtonAppearance = () => {
            if (scene.scale.isFullscreen) {
                // Ve fullscreen - tlačítko je trochu průhlednější (indikuje možnost vypnutí)
                btn.setAlpha(0.7);
                btn.setTint(0xffcccc); // Lehce červený nádech
            } else {
                // Mimo fullscreen - normální vzhled
                btn.setAlpha(1);
                btn.clearTint();
            }
        };

        btn.on('pointerup', toggleFullscreen);

        // Aktualizace vzhledu při změně fullscreen stavu
        scene.scale.on('enterfullscreen', updateButtonAppearance);
        scene.scale.on('leavefullscreen', updateButtonAppearance);
        
        // Počáteční nastavení vzhledu
        updateButtonAppearance();
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