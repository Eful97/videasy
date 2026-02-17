// ================================================================
//  STREMIO ADDON — Videasy ITA
//  Stream diretti nel player nativo di Stremio
//
//  PRIMA DI AVVIARE:
//  1. Ottieni una chiave API TMDB gratuita su https://www.themoviedb.org
//  2. Impostala come variabile d'ambiente: TMDB_API_KEY=xxx node index.js
//
//  AVVIO:  node index.js
//  INSTALLA IN STREMIO:  http://127.0.0.1:7000/manifest.json
// ================================================================

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const { imdbToTmdb } = require('./tmdb');

const PORT = process.env.PORT || 7000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://127.0.0.1:${PORT}`;

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
      const tmdbId = await imdbToTmdb(id, 'movie');
      if (!tmdbId) return { streams: [] };

      // "server=harbor" seleziona il server italiano di Videasy
      const videasyUrl = `https://player.videasy.net/movie/${tmdbId}?server=harbor`;

      streams.push({
        name: '🎬 Videasy ITA',
        description: '🇮🇹 Italiano | Server: Harbor',
        // "externalUrl" apre nel browser — usiamo "url" per il player nativo di Stremio
        url: videasyUrl,
        behaviorHints: {
          notWebReady: false,
        },
      });

      console.log(`✅ Stream film: ${videasyUrl}`);
    }

    // ---- SERIE TV ----
    else if (type === 'series') {
      const [imdbId, season, episode] = id.split(':');
      if (!season || !episode) return { streams: [] };

      const tmdbId = await imdbToTmdb(imdbId, 'series');
      if (!tmdbId) return { streams: [] };

      // "server=harbor" seleziona il server italiano di Videasy
      const videasyUrl = `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?server=harbor&nextEpisode=true&episodeSelector=true`;

      streams.push({
        name: '🎬 Videasy ITA',
        description: `🇮🇹 Italiano | Server: Harbor\nS${season}E${episode}`,
        url: videasyUrl,
        behaviorHints: {
          notWebReady: false,
        },
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

const tmdbStatus = process.env.TMDB_API_KEY
  ? "✅ TMDB_API_KEY caricata correttamente"
  : "⚠️  TMDB_API_KEY mancante! Vedi tmdb.js";

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║         🎬  STREMIO VIDEASY ITA  🎬          ║');
console.log('╠══════════════════════════════════════════════╣');
console.log(`║  ✅ Server avviato sulla porta ${PORT}           ║`);
console.log('║                                              ║');
console.log('║  📡 Installa in Stremio con questo URL:      ║');
console.log(`║  ${(PUBLIC_URL + '/manifest.json').padEnd(44)}║`);
console.log('║                                              ║');
console.log(`║  ${tmdbStatus.padEnd(44)}║`);
console.log('╚══════════════════════════════════════════════╝');
console.log('');
