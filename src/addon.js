// src/addon.js
// Handler principale dell'addon: risponde alle richieste di stream di Stremio

const { extractStreams, extractStreamsFallback, buildVideasyUrl } = require("./videasy");

// ============================================================
//  STREAM HANDLER
//  Riceve type (movie/series) e id (imdbId o imdbId:season:episode)
//  e restituisce un array di stream
// ============================================================
async function getStreams(type, id) {
  console.log(`\n[Addon] Richiesta stream: type=${type}, id=${id}`);

  let imdbId, season, episode;

  try {
    if (type === "movie") {
      // Per i film, id è semplicemente l'IMDB ID (es: tt1234567)
      imdbId = id;
    } else if (type === "series") {
      // Per le serie, id è nel formato: tt1234567:stagione:episodio
      const parts = id.split(":");
      if (parts.length !== 3) {
        console.error(`[Addon] Formato ID serie non valido: ${id}`);
        return [];
      }
      [imdbId, season, episode] = parts;
      season = parseInt(season);
      episode = parseInt(episode);
    } else {
      console.log(`[Addon] Tipo non supportato: ${type}`);
      return [];
    }

    // Tenta prima con Playwright (estrazione completa con browser)
    let streams = [];
    
    try {
      streams = await extractStreams(type, imdbId, season, episode);
    } catch (playwrightError) {
      console.warn(`[Addon] Playwright fallito, uso fallback: ${playwrightError.message}`);
      // Se Playwright non funziona, usa il metodo fallback (parsing HTML)
      streams = await extractStreamsFallback(type, imdbId, season, episode);
    }

    // Se nessun stream trovato, ritorna l'embed URL come stream "non web-ready"
    // Questo è utile come ultima risorsa
    if (streams.length === 0) {
      console.log("[Addon] Nessun stream diretto trovato, uso link embed");
      const embedUrl = buildVideasyUrl(type, imdbId, season, episode);
      streams = [
        {
          externalUrl: embedUrl,
          name: "Videasy",
          description: "🇮🇹 Apri su Videasy",
        },
      ];
    }

    return streams;
  } catch (err) {
    console.error(`[Addon] Errore generale: ${err.message}`);
    return [];
  }
}

module.exports = { getStreams };
