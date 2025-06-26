/**
 * Safe Zones Utility - Pomáhá s bezpečným umístěním UI prvků
 * Zabraňuje umístění důležitých prvků tam, kde je může schovat status bar, notch, atd.
 */

/**
 * Vypočítá bezpečné zóny pro umístění UI prvků
 * @param {Phaser.Scene} scene - Phaser scéna
 * @param {Object} options - možnosti konfigurace
 * @returns {Object} - objekt s bezpečnými pozicemi a rozměry
 */
export function getSafeZones(scene, options = {}) {
    const { width, height } = scene.scale;
    
    // Výchozí marginy pro různá zařízení
    const defaults = {
        mobile: {
            top: 60,      // Status bar + notch
            bottom: 90,   // Navigation bar + home indicator
            left: 20,
            right: 20
        },
        desktop: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20
        }
    };
    
    // Detekce zařízení
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const margins = isMobile ? defaults.mobile : defaults.desktop;
    
    // Možnost přepsání marginů
    const finalMargins = { ...margins, ...options };
    
    return {
        // Bezpečná oblast pro obsah
        content: {
            x: finalMargins.left,
            y: finalMargins.top,
            width: width - finalMargins.left - finalMargins.right,
            height: height - finalMargins.top - finalMargins.bottom,
            centerX: width / 2,
            centerY: height / 2
        },
        
        // Pozice pro UI prvky
        ui: {
            // Horní řada (logo, score, atd.)
            topLeft: { x: finalMargins.left, y: finalMargins.top },
            topCenter: { x: width / 2, y: finalMargins.top },
            topRight: { x: width - finalMargins.right, y: finalMargins.top },
            
            // Spodní řada (tlačítka, navigace)
            bottomLeft: { x: finalMargins.left, y: height - finalMargins.bottom },
            bottomCenter: { x: width / 2, y: height - finalMargins.bottom },
            bottomRight: { x: width - finalMargins.right, y: height - finalMargins.bottom },
            
            // Střed obrazovky
            center: { x: width / 2, y: height / 2 }
        },
        
        // Debug informace
        debug: {
            deviceType: isMobile ? 'mobile' : 'desktop',
            margins: finalMargins,
            viewport: { width, height }
        }
    };
}

/**
 * Vytvoří vizuální debug overlay pro safe zones
 * @param {Phaser.Scene} scene - Phaser scéna
 * @param {Object} safeZones - výsledek z getSafeZones()
 * @param {Object} options - možnosti zobrazení
 */
export function showSafeZonesDebug(scene, safeZones, options = {}) {
    const { 
        showMargins = true, 
        showGrid = true, 
        alpha = 0.3,
        color = 0xff0000
    } = options;
    
    const debugGroup = scene.add.group();
    
    if (showMargins) {
        // Zobrazení nebezpečných zón (červeně)
        const { content } = safeZones;
        const { width, height } = scene.scale;
        
        // Horní margin
        debugGroup.add(scene.add.rectangle(width/2, content.y/2, width, content.y, color, alpha));
        
        // Spodní margin
        const bottomY = content.y + content.height + (height - content.y - content.height)/2;
        debugGroup.add(scene.add.rectangle(width/2, bottomY, width, height - content.y - content.height, color, alpha));
        
        // Levý margin
        debugGroup.add(scene.add.rectangle(content.x/2, height/2, content.x, height, color, alpha));
        
        // Pravý margin
        const rightX = content.x + content.width + (width - content.x - content.width)/2;
        debugGroup.add(scene.add.rectangle(rightX, height/2, width - content.x - content.width, height, color, alpha));
    }
    
    if (showGrid) {
        // Zobrazení bezpečné zóny (zeleně)
        const { content } = safeZones;
        debugGroup.add(scene.add.rectangle(content.centerX, content.centerY, content.width, content.height)
            .setStrokeStyle(2, 0x00ff00, 0.8)
            .setFillStyle(0x00ff00, 0.1));
            
        // Značky pro UI pozice
        Object.entries(safeZones.ui).forEach(([key, pos]) => {
            const marker = scene.add.circle(pos.x, pos.y, 8, 0x00ff00, 0.8);
            const label = scene.add.text(pos.x + 15, pos.y - 5, key, {
                fontSize: '12px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            debugGroup.add(marker);
            debugGroup.add(label);
        });
    }
    
    // Debug info text
    const debugInfo = `Device: ${safeZones.debug.deviceType}\nViewport: ${safeZones.debug.viewport.width}x${safeZones.debug.viewport.height}\nMargins: T:${safeZones.debug.margins.top} B:${safeZones.debug.margins.bottom} L:${safeZones.debug.margins.left} R:${safeZones.debug.margins.right}`;
    
    debugGroup.add(scene.add.text(10, 10, debugInfo, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setDepth(1000));
    
    return debugGroup;
}

/**
 * Bezpečné umístění UI prvku
 * @param {Phaser.GameObjects.GameObject} element - herní objekt
 * @param {string} position - pozice ('topLeft', 'bottomCenter', atd.)
 * @param {Object} safeZones - výsledek z getSafeZones()
 * @param {Object} offset - dodatečný offset {x, y}
 */
export function positionSafely(element, position, safeZones, offset = {x: 0, y: 0}) {
    const pos = safeZones.ui[position];
    if (!pos) {
        console.warn(`Unknown safe position: ${position}`);
        return element;
    }
    
    element.setPosition(pos.x + offset.x, pos.y + offset.y);
    return element;
}

/**
 * Kontrola, zda je pozice v bezpečné zóně
 * @param {number} x - X souřadnice
 * @param {number} y - Y souřadnice  
 * @param {Object} safeZones - výsledek z getSafeZones()
 * @returns {boolean} - true pokud je pozice bezpečná
 */
export function isPositionSafe(x, y, safeZones) {
    const { content } = safeZones;
    return x >= content.x && 
           x <= content.x + content.width && 
           y >= content.y && 
           y <= content.y + content.height;
}
