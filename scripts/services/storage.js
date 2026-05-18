// storage.js - Gestione localStorage per serie TV

const STORAGE_KEYS = {
    HISTORY: "tv_history",
    FAVORITES: "tv_favorites",
    WATCHED: "tv_watched",
    TO_WATCH: "tv_to_watch",
};

//const test = [{"id":17861,"name":"Dark","language":"German","genres":["Drama","Science-Fiction","Supernatural"],"status":"Ended","premiered":"2017-12-01","rating":8.2,"image":"https://static.tvmaze.com/uploads/images/medium_portrait/504/1262352.jpg","network":"Netflix","summary":"<p>A family saga with a supernatural twist, <b>Dark</b> is set in a German town in present day where the disappearance of two young children exposes the double lives and fractured relationships among four families.</p>","timestamp":1777911877354}];

/**
 * Legge un array serializzato da localStorage restituendo un array vuoto in caso di errore o dati mancanti.
 * @param {string} storageKey
 * @returns {Array}
 */
function readStoredArray(storageKey) {
    try {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];                  // (DEBUG)Se non c'è nulla, restituisce un array vuoto
    } catch (error) {
        console.error(`Errore nel recupero di ${storageKey}:`, error);
        return [];
    }
}

/**
 * Scrive un array su localStorage (serializzato).
 * @param {string} storageKey
 * @param {Array} items
 */
function writeStoredArray(storageKey, items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
}

/**
 * Ordina una lista di oggetti per campo `timestamp` discendente.
 * @param {Array<{timestamp:number}>} items
 * @returns {Array}
 */
function sortByTimestampDesc(items) {
    return items.slice().sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * Aggiunge uno show se non esiste già (usa `id`) e imposta un timestamp.
 * @param {string} storageKey
 * @param {Object} show
 * @returns {boolean} True se aggiunto, false se già presente
 */
function saveUniqueById(storageKey, show) {
    const list = readStoredArray(storageKey);

    if (list.some((entry) => entry.id === show.id)) {
        return false;
    }

    list.push({
        ...show,
        timestamp: Date.now(),
    });

    writeStoredArray(storageKey, list);
    return true;
}

/**
 * Aggiunge uno show alla cronologia di navigazione locale.
 * Mantiene massimo 80 elementi e evita duplicati consecutivi.
 * @param {Object} show
 */
export function addToHistory(show) {
    if (!show || !show.id) {
        return;
    }

    let history = readStoredArray(STORAGE_KEYS.HISTORY);

    if (history.length > 0 && history[history.length - 1].id === show.id) {
        return;
    }

    history.push({
        ...show,
        timestamp: Date.now(),
    });

    if (history.length > 80) {
        history = history.slice(-80);
    }

    writeStoredArray(STORAGE_KEYS.HISTORY, history);
}

/**
 * Restituisce la cronologia ordinata per data decrescente.
 * @returns {Array}
 */
export function getHistory() {
    return sortByTimestampDesc(readStoredArray(STORAGE_KEYS.HISTORY));
}

/**
 * Rimuove un elemento della cronologia identificato dal suo `timestamp`.
 * @param {number} timestamp
 */
export function removeHistoryEntry(timestamp) {
    const history = readStoredArray(STORAGE_KEYS.HISTORY).filter((entry) => entry.timestamp !== timestamp);
    writeStoredArray(STORAGE_KEYS.HISTORY, history);
}

/**
 * Pulisce tutta la cronologia.
 */
export function clearHistory() {
    writeStoredArray(STORAGE_KEYS.HISTORY, []);
}

/**
 * Aggiunge uno show ai preferiti (se non già presente).
 * @param {Object} show
 * @returns {boolean}
 */
export function addFavorite(show) {
    return saveUniqueById(STORAGE_KEYS.FAVORITES, show);
}

/**
 * Restituisce i preferiti ordinati per data.
 * @returns {Array}
 */
export function getFavorites() {
    return sortByTimestampDesc(readStoredArray(STORAGE_KEYS.FAVORITES));
}

/**
 * Rimuove un preferito per id.
 * @param {number} id
 */
export function removeFavorite(id) {
    const items = readStoredArray(STORAGE_KEYS.FAVORITES).filter((entry) => entry.id !== id);
    writeStoredArray(STORAGE_KEYS.FAVORITES, items);
}

/**
 * Pulisce i preferiti.
 */
export function clearFavorites() {
    writeStoredArray(STORAGE_KEYS.FAVORITES, []);
}

/**
 * Verifica se un id è presente nei preferiti.
 * @param {number} id
 * @returns {boolean}
 */
export function isFavorite(id) {
    return readStoredArray(STORAGE_KEYS.FAVORITES).some((entry) => entry.id === id);
}

/**
 * Aggiunge uno show alla lista dei visti.
 * @param {Object} show
 * @returns {boolean}
 */
export function addWatched(show) {
    return saveUniqueById(STORAGE_KEYS.WATCHED, show);
}

/**
 * Restituisce la lista dei visti ordinata.
 * @returns {Array}
 */
export function getWatched() {
    return sortByTimestampDesc(readStoredArray(STORAGE_KEYS.WATCHED));
}

/**
 * Rimuove un elemento dalla lista dei visti.
 * @param {number} id
 */
export function removeWatched(id) {
    const items = readStoredArray(STORAGE_KEYS.WATCHED).filter((entry) => entry.id !== id);
    writeStoredArray(STORAGE_KEYS.WATCHED, items);
}

/**
 * Pulisce la lista dei visti.
 */
export function clearWatched() {
    writeStoredArray(STORAGE_KEYS.WATCHED, []);
}

/**
 * Controlla se un id è presente nella lista dei visti.
 * @param {number} id
 * @returns {boolean}
 */
export function isWatched(id) {
    return readStoredArray(STORAGE_KEYS.WATCHED).some((entry) => entry.id === id);
}

/**
 * Aggiunge uno show alla lista "Da vedere".
 * @param {Object} show
 * @returns {boolean}
 */
export function addToWatch(show) {
    return saveUniqueById(STORAGE_KEYS.TO_WATCH, show);
}

/**
 * Restituisce la lista "Da vedere" ordinata.
 * @returns {Array}
 */
export function getToWatch() {
    return sortByTimestampDesc(readStoredArray(STORAGE_KEYS.TO_WATCH));
}

/**
 * Rimuove un elemento dalla lista "Da vedere".
 * @param {number} id
 */
export function removeToWatch(id) {
    const items = readStoredArray(STORAGE_KEYS.TO_WATCH).filter((entry) => entry.id !== id);
    writeStoredArray(STORAGE_KEYS.TO_WATCH, items);
}

/**
 * Pulisce la lista "Da vedere".
 */
export function clearToWatch() {
    writeStoredArray(STORAGE_KEYS.TO_WATCH, []);
}

/**
 * Controlla se un id è presente nella lista "Da vedere".
 * @param {number} id
 * @returns {boolean}
 */
export function isInToWatch(id) {
    return readStoredArray(STORAGE_KEYS.TO_WATCH).some((entry) => entry.id === id);
}
