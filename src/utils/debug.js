/**
 * Debug utility pro kontrolu výpisů v produkci
 * Nastavte window.DEBUG_MODE = false pro produkci
 */

// Globální nastavení debug režimu
window.DEBUG_MODE = window.DEBUG_MODE !== undefined ? window.DEBUG_MODE : false;

/**
 * Debug console.log - zobrazuje jen když je DEBUG_MODE = true
 * @param {...any} args - argumenty pro console.log
 */
export function debugLog(...args) {
    if (window.DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

/**
 * Debug console.warn - zobrazuje jen když je DEBUG_MODE = true
 * @param {...any} args - argumenty pro console.warn
 */
export function debugWarn(...args) {
    if (window.DEBUG_MODE) {
        console.warn('[DEBUG WARN]', ...args);
    }
}

/**
 * Debug console.error - zobrazuje vždy (chyby jsou důležité i v produkci)
 * @param {...any} args - argumenty pro console.error
 */
export function debugError(...args) {
    console.error('[ERROR]', ...args);
}

/**
 * Info log - zobrazuje vždy důležité informace
 * @param {...any} args - argumenty pro console.log
 */
export function infoLog(...args) {
    console.log('[INFO]', ...args);
}
