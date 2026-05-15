// show-card.js - Componenti visuali per schede serie TV

import { sanitizeHTML, stripHtml } from "../core/errors.js";
import { formatGenres, getStatusBadge } from "../services/show-codes.js";

/**
 * Produce una versione testuale ridotta della summary di una serie.
 * Rimuove HTML e limita la lunghezza a 280 caratteri aggiungendo "..." se necessario.
 * @param {Object} show - Oggetto show ricevuto dall'API
 * @returns {string} Testo plain della descrizione o una stringa di fallback
 */
function getSafeSummary(show) {
    const plain = stripHtml(show.summary || "").trim();
    if (!plain) {
        return "Nessuna descrizione disponibile.";
    }
    return plain.length > 280 ? `${plain.slice(0, 280)}...` : plain;
}

/**
 * Crea un elemento DOM `article` che rappresenta la scheda di una serie.
 * Utilizza `sanitizeHTML` per inserire contenuti sicuri.
 * @param {Object} show - Oggetto show dall'API (campi: name, image, rating, genres, summary, ecc.)
 * @param {string} [titleOverride] - Titolo opzionale da visualizzare al posto del nome
 * @param {Object} [options] - Opzioni di rendering (es. { compact: true })
 * @returns {HTMLElement} L'elemento `article.series-card` pronto per essere inserito nel DOM
 */
export function createShowCard(show, titleOverride = "", options = {}) {
    const card = document.createElement("article");
    card.className = "series-card";

    if (options.compact) {
        card.classList.add("compact");
    }

    const title = titleOverride || show.name || "Titolo sconosciuto";
    const poster = show.image?.medium || show.image?.original || "";
    const rating = show.rating?.average ?? "N/D";
    const genres = formatGenres(show.genres);
    const status = getStatusBadge(show.status);

    // TODO 1: Manca da vedere l'header e i meta della serie.
    // Per farlo mettiamo un div con classe "series-title-block" che contiene:
    // - h2 per il titolo
    // - p per lo status (con classe "series-status").
    // Poi nella sezione "series-meta" aggiungiamo:
    // - div con classe "temp-main" che mostra il rating (⭐ 8.5)
    // - div con classe "temp-desc" che mostra i generi formattati (es. "Drama, Thriller")
    // - p con classe "show-summary" che mostra la summary ridotta (usa getSafeSummary).
    // Per tutti usare sanitizeHTML per inserire i dati dinamici in modo sicuro.
    card.innerHTML = `
        <div class="series-card-header">
        <div classe "series-title-block">
        <h2>${sanitizeHTML(title)} </h2>
        <p class="series-status">${sanitizeHTML(status)}</p>
        </div>

        <div class="series-current show-current">
            <div class="show-poster-wrap">
                ${poster ? `<img class="show-poster" src="${sanitizeHTML(poster)}" alt="Poster ${sanitizeHTML(show.name)}">` : "<div class='show-poster-placeholder'>No image</div>"}
            </div>
            <div class="series-meta show-meta">
            <div class="series-meta">
            <div class="temp-main">
                ⭐ ${sanitizeHTML(rating)}
            </div>
            <div class="temp-desc">
                ${sanitizeHTML(genres)}
            </div>
            <p class="show-summary">
                ${getSafeSummary(show.summary)}
            </p>
            </div>
        </div>

        <div class="series-current show-current">
        <div class="show-poster-wrap">
            ${poster ? `<img class="show-poster" src="${sanitizeHTML(poster)}" alt="Poster ${sanitizeHTML(title)}">` : ''}
        </div>
        <div class="series-meta show-meta">
            </div>
    </div>

        <div class="series-details-grid">
            <div class="detail-item">
                <span class="detail-label">Lingua</span>
                <span class="detail-value">${sanitizeHTML(show.language || "N/D")}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Prima uscita</span>
                <span class="detail-value">${sanitizeHTML(show.premiered || "N/D")}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Network</span>
                <span class="detail-value">${sanitizeHTML(show.network?.name || show.webChannel?.name || "N/D")}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tipo</span>
                <span class="detail-value">${sanitizeHTML(show.type || "N/D")}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Costruisce il pannello dettagliato (summary + info) per una serie.
 * Si aspetta che `show._embedded` possa contenere `episodes` e `cast`.
 * @param {Object} show - Oggetto show dall'API, preferibilmente con _embedded
 * @param {Object} [options] - Opzioni di rendering (es. { compact: true, title: '...' })
 * @returns {HTMLElement} Contenitore `div.series-details` con le informazioni
 */
export function createShowDetails(show, options = {}) {
    const container = document.createElement("div");
    container.className = "series-details";

    if (options.compact) {
        container.classList.add("compact");
    }

    const title = document.createElement("h3");
    title.textContent = options.title || "Dettagli Serie";
    container.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "info-grid";

    const episodes = show._embedded?.episodes || [];
    const cast = show._embedded?.cast || [];

    const items = [
        `Episodi: ${episodes.length || "N/D"}`,
        `Cast: ${cast.length || "N/D"}`,
        `Runtime: ${show.runtime || "N/D"} min`,
        `Stato: ${show.status || "N/D"}`,
    ];

    items.forEach((text) => {
        const box = document.createElement("div");
        box.className = "info-item";
        box.innerHTML = `<div class="info-value">${sanitizeHTML(text)}</div>`;
        grid.appendChild(box);
    });

    if (cast.length > 0) {
        cast.slice(0, 3).forEach((entry) => {
            const box = document.createElement("div");
            box.className = "info-item";
            box.innerHTML = `
                <div class="info-label">Cast</div>
                <div class="info-value">${sanitizeHTML(entry.person?.name || "N/D")}</div>
                <div class="info-meta">${sanitizeHTML(entry.character?.name || "N/D")}</div>
            `;
            grid.appendChild(box);
        });
    }

    container.appendChild(grid);
    return container;
}