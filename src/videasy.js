// src/videasy.js
// Estrattore di stream da Videasy
// Videasy usa un embed player con stream HLS. Per ottenere gli stream diretti,
// dobbiamo caricare la pagina embed e intercettare le richieste di rete verso m3u8.

const axios = require("axios");
const { chromium } = require("playwright");

// ============================================================
//  URL BUILDER
//  Costruisce l'URL dell'embed di Videasy dato un IMDB ID
// ============================================================
function buildVideasyUrl(type, imdbId, season = null, episode = null) {
  const base = "https://player.videasy.net";
  if (type === "movie") {
    return `${base}/movie/${imdbId}`;
  } else if (type === "series") {
    return `${base}/tv/${imdbId}/${season}/${episode}`;
  }
  throw new Error(`Tipo non supportato: ${type}`);
}

// ============================================================
//  EXTRACTOR
//  Apre l'embed con Playwright e intercetta l'URL m3u8
// ============================================================
async function extractStreams(type, imdbId, season = null, episode = null) {
  const embedUrl = buildVideasyUrl(type, imdbId, season, episode);
  console.log(`[Videasy] Estrazione stream da: ${embedUrl}`);

  let browser = null;
  const streams = [];

  try {
    // Avvia browser headless (Chromium)
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Intercetta le richieste di rete per trovare URL m3u8
    const capturedUrls = [];

    page.on("request", (request) => {
      const url = request.url();
      // Cattura richieste verso file m3u8 (stream HLS)
      if (url.includes(".m3u8") || url.includes("playlist")) {
        console.log(`[Videasy] Trovato URL m3u8: ${url}`);
        capturedUrls.push({
          url,
          headers: request.headers(),
        });
      }
    });

    // Naviga alla pagina embed
    await page.goto(embedUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Aspetta un po' per dare tempo al player di inizializzarsi
    await page.waitForTimeout(5000);

    // Prova a fare click sul play button se presente
    try {
      await page.click('button[class*="play"], .play-btn, [data-play]', {
        timeout: 3000,
      });
      await page.waitForTimeout(3000);
    } catch (e) {
      // Nessun play button trovato, continuiamo
    }

    // Aspetta altro po' per intercettare le richieste
    await page.waitForTimeout(3000);

    // Costruisci l'array di stream da restituire a Stremio
    for (const captured of capturedUrls) {
      if (captured.url.includes(".m3u8")) {
        streams.push({
          url: captured.url,
          name: "Videasy",
          description: "🇮🇹 Italiano • HLS",
          // Fornisci gli header necessari per il proxy
          behaviorHints: {
            notWebReady: false,
            proxyHeaders: {
              request: {
                Referer: "https://player.videasy.net/",
                Origin: "https://player.videasy.net",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            },
          },
        });
      }
    }

    await context.close();
  } catch (err) {
    console.error(`[Videasy] Errore durante estrazione: ${err.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(`[Videasy] Trovati ${streams.length} stream`);
  return streams;
}

// ============================================================
//  FALLBACK: Estrazione tramite fetch + parsing HTML
//  Se Playwright non disponibile, tentiamo parsing della pagina
// ============================================================
async function extractStreamsFallback(
  type,
  imdbId,
  season = null,
  episode = null
) {
  const embedUrl = buildVideasyUrl(type, imdbId, season, episode);
  console.log(`[Videasy Fallback] Estrazione da: ${embedUrl}`);

  try {
    const response = await axios.get(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.videasy.net/",
        Origin: "https://www.videasy.net",
      },
      timeout: 15000,
    });

    const html = response.data;

    // Cerca URL m3u8 nell'HTML della pagina
    const m3u8Regex = /https?:\/\/[^\s"']+\.m3u8[^\s"']*/gi;
    const matches = html.match(m3u8Regex) || [];

    // Cerca anche URL in formato JSON all'interno degli script
    const jsonM3u8Regex = /"(https?:\/\/[^"]+\.m3u8[^"]*)"/gi;
    let match;
    while ((match = jsonM3u8Regex.exec(html)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }

    const streams = matches.map((url) => ({
      url,
      name: "Videasy",
      description: "🇮🇹 Italiano • HLS",
      behaviorHints: {
        notWebReady: false,
        proxyHeaders: {
          request: {
            Referer: "https://player.videasy.net/",
            Origin: "https://player.videasy.net",
          },
        },
      },
    }));

    console.log(`[Videasy Fallback] Trovati ${streams.length} stream`);
    return streams;
  } catch (err) {
    console.error(`[Videasy Fallback] Errore: ${err.message}`);
    return [];
  }
}

module.exports = {
  extractStreams,
  extractStreamsFallback,
  buildVideasyUrl,
};
