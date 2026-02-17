// ================================================================
//  STREMIO ADDON — Videasy ITA
//  Stream diretti nel player nativo di Stremio
//
//  PRIMA DI AVVIARE:
//  1. Ottieni una chiave API TMDB gratuita su https://www.themoviedb.org
//  2. Incollala in tmdb.js oppure esportala come variabile d'ambiente:
//     TMDB_API_KEY=la_tua_chiave node index.js
//
//  AVVIO:  node index.js
//  INSTALLA IN STREMIO:  http://127.0.0.1:7000/manifest.json
// ================================================================

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const { imdbToTmdb } = require('./tmdb');

// ---------------------------------------------------------------
// CONFIGURAZIONE
// ---------------------------------------------------------------
const PORT = process.env.PORT || 7000;

// Lingua italiana (parametro passato a Videasy)
const LANG = 'it';

// ---------------------------------------------------------------
// MANIFEST
// ---------------------------------------------------------------
const manifest = {
  id: 'com.mio.videasy.ita',
  version: '1.0.0',
  name: '🎬 Videasy ITA',
  description: 'Film e Serie TV in italiano tramite Videasy — stream nel player nativo di Stremio',
  logo: 'https://www.videasy.net/favicon.ico',
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  catalogs: [],
  behaviorHints: {
    adult: false,
    configurable: false,
  },
};

// ---------------------------------------------------------------
// ADDON
// ---------------------------------------------------------------
const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`\n📡 Richiesta: type="${type}"  id="${id}"`);

  const streams = [];

  try {
    // ---- FILM ----
    if (type === 'movie') {
      const imdbId = id;

      // Converte IMDB → TMDB (Videasy usa TMDB ID)
      const tmdbId = await imdbToTmdb(imdbId, 'movie');
      if (!tmdbId) {
        console.warn('⚠️  TMDB ID non trovato, impossibile generare lo stream');
        return { streams: [] };
      }

      // URL embed Videasy per film
      // Videasy restituisce stream diretto (M3U8/MP4) nel proprio player
      // che Stremio può riprodurre tramite externalUrl
      const videasyUrl = `https://player.videasy.net/movie/${tmdbId}?color=E50914&nextEpisode=false`;

      streams.push({
        name: '🎬 Videasy',
        description: `🇮🇹 Italiano | HD\nPlayer: Videasy`,
        externalUrl: videasyUrl,
      });

      console.log(`✅ Stream film: ${videasyUrl}`);
    }

    // ---- SERIE TV ----
    else if (type === 'series') {
      // ID formato Stremio: "tt1234567:2:5"
      const [imdbId, season, episode] = id.split(':');

      if (!season || !episode) {
        console.warn('⚠️  ID serie non valido:', id);
        return { streams: [] };
      }

      // Converte IMDB → TMDB
      const tmdbId = await imdbToTmdb(imdbId, 'series');
      if (!tmdbId) {
        console.warn('⚠️  TMDB ID non trovato, impossibile generare lo stream');
        return { streams: [] };
      }

      // URL embed Videasy per serie TV
      // Formato: /tv/{tmdbId}/{stagione}/{episodio}
      const videasyUrl = [
        `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
        `?color=E50914`,
        `&nextEpisode=true`,
        `&autoplayNextEpisode=false`,
        `&episodeSelector=true`,
      ].join('');

      streams.push({
        name: '🎬 Videasy',
        description: `🇮🇹 Italiano | HD\nS${season}E${episode} | Player: Videasy`,
        externalUrl: videasyUrl,
      });

      console.log(`✅ Stream serie: ${videasyUrl}`);
    }

  } catch (err) {
    console.error('❌ Errore handler:', err.message);
  }

  return { streams };
});

// ---------------------------------------------------------------
// AVVIO SERVER
// ---------------------------------------------------------------
serveHTTP(builder.getInterface(), { port: PORT });

// Verifica chiave API TMDB
const { TMDB_API_KEY } = process.env;
const tmdbStatus = TMDB_API_KEY
  ? '✅ Chiave TMDB caricata da variabile d\'ambiente'
  : '⚠️  TMDB_API_KEY non impostata! Modifica tmdb.js';

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║         🎬  STREMIO VIDEASY ITA  🎬          ║');
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  ✅ Server avviato sulla porta ${PORT}           ║`);
console.log('║                                              ║');
console.log('║  📡 Installa in Stremio con questo URL:      ║');
console.log(`║  http://127.0.0.1:${PORT}/manifest.json         ║`);
console.log('║                                              ║');
console.log(`║  ${tmdbStatus.padEnd(44)}║`);
console.log('╚══════════════════════════════════════════════╝');
console.log('');
