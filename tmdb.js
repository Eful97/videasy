// ================================================================
//  TMDB.JS — Conversione IMDB ID → TMDB ID
// ================================================================
//  Videasy usa TMDB ID (es: 299534), ma Stremio passa IMDB ID
//  (es: tt0372784). Questo modulo fa la conversione tramite
//  l'API gratuita di TMDB.
//
//  Come ottenere la chiave API TMDB (gratis):
//  1. Vai su https://www.themoviedb.org/signup e crea un account
//  2. Vai su Impostazioni → API → Crea chiave API (tipo: Developer)
//  3. Copia la chiave e incollala in TMDB_API_KEY qui sotto
// ================================================================

const axios = require('axios');

// ⬇️ METTI QUI LA TUA CHIAVE API TMDB (GRATUITA)
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'LA_TUA_CHIAVE_API_TMDB';

// Cache in memoria per evitare chiamate duplicate (si svuota al riavvio)
const cache = new Map();

/**
 * Converte un IMDB ID in TMDB ID.
 * @param {string} imdbId  - Es: "tt0372784"
 * @param {string} type    - "movie" o "series"
 * @returns {string|null}  - TMDB ID numerico (es: "299534") o null se non trovato
 */
async function imdbToTmdb(imdbId, type) {
  const cacheKey = `${imdbId}-${type}`;

  // Controlla cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    // L'endpoint /find di TMDB cerca per ID esterni (IMDB, TVDB, ecc.)
    const url = `https://api.themoviedb.org/3/find/${imdbId}`;
    const response = await axios.get(url, {
      params: {
        api_key: TMDB_API_KEY,
        external_source: 'imdb_id',
      },
      timeout: 8000,
    });

    const data = response.data;
    let tmdbId = null;

    if (type === 'movie' && data.movie_results && data.movie_results.length > 0) {
      tmdbId = String(data.movie_results[0].id);
    } else if (type === 'series' && data.tv_results && data.tv_results.length > 0) {
      tmdbId = String(data.tv_results[0].id);
    }

    if (tmdbId) {
      cache.set(cacheKey, tmdbId);
      console.log(`[TMDB] ✅ ${imdbId} (${type}) → TMDB ID: ${tmdbId}`);
    } else {
      console.warn(`[TMDB] ⚠️  Nessun risultato per ${imdbId} (${type})`);
    }

    return tmdbId;
  } catch (err) {
    console.error(`[TMDB] ❌ Errore conversione ${imdbId}: ${err.message}`);
    return null;
  }
}

module.exports = { imdbToTmdb };
