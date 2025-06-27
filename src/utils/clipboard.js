/**
 * Utility funkce pro kopírování textu do schránky
 */

/**
 * Zkopíruje text do schránky
 * @param {string} text - text ke zkopírování
 * @returns {Promise<boolean>} - true pokud se podařilo zkopírovat
 */
export async function copyToClipboard(text) {
    try {
        // Moderní metoda pro kopírování
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback pro starší prohlížeče
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
    } catch (err) {
        console.error('Chyba při kopírování do schránky:', err);
        return false;
    }
}

/**
 * Vytvoří tlačítko pro kopírování se zpětnou vazbou
 * @param {Phaser.Scene} scene - Phaser scéna
 * @param {number} x - X pozice
 * @param {number} y - Y pozice
 * @param {string} textToCopy - text ke zkopírování
 * @param {string} buttonText - text na tlačítku
 * @param {object} style - styl tlačítka
 * @returns {Phaser.GameObjects.Text} - tlačítko
 */
export function createCopyButton(scene, x, y, textToCopy, buttonText = 'Kopírovat', style = {}) {
    const defaultStyle = {
        fontSize: '24px',
        color: '#fff',
        backgroundColor: '#007acc',
        padding: { x: 16, y: 8 },
        ...style
    };
    
    const button = scene.add.text(x, y, buttonText, defaultStyle)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    
    const originalText = buttonText;
    
    button.on('pointerdown', async () => {
        const success = await copyToClipboard(textToCopy);
        
        if (success) {
            // Úspěšné zkopírování
            button.setText('✓ Zkopírováno!')
                  .setStyle({ backgroundColor: '#28a745' });
            
            // Vrátit původní stav po 2 sekundách
            scene.time.delayedCall(2000, () => {
                button.setText(originalText)
                      .setStyle({ backgroundColor: defaultStyle.backgroundColor });
            });
        } else {
            // Chyba při kopírování
            button.setText('✗ Chyba!')
                  .setStyle({ backgroundColor: '#dc3545' });
            
            // Vrátit původní stav po 2 sekundách
            scene.time.delayedCall(2000, () => {
                button.setText(originalText)
                      .setStyle({ backgroundColor: defaultStyle.backgroundColor });
            });
        }
    });
    
    return button;
}
