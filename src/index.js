// src/index.js
// Server HTTP Express che espone le route dell'addon Stremio

const express = require("express");
const cors = require("cors");
const manifest = require("./manifest");
const { getStreams } = require("./addon");

const app = express();
const PORT = process.env.PORT || 7860;

// ============================================================
//  CORS - necessario per Stremio Web
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
//  LOGGING MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// ============================================================
//  ROUTE: Root - pagina di benvenuto con link installazione
// ============================================================
app.get("/", (req, res) => {
  const addonUrl = `${req.protocol}://${req.get("host")}`;
  res.send(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stremio Videasy ITA</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 600px;
          margin: 60px auto;
          padding: 20px;
          background: #0f1923;
          color: #e0e0e0;
          text-align: center;
        }
        h1 { color: #7c4dff; font-size: 2em; }
        p { color: #aaa; line-height: 1.6; }
        .badge {
          display: inline-block;
          background: #1a2634;
          border: 1px solid #7c4dff;
          border-radius: 8px;
          padding: 10px 20px;
          font-family: monospace;
          font-size: 0.9em;
          color: #7c4dff;
          margin: 10px 0;
          word-break: break-all;
        }
        a.btn {
          display: inline-block;
          background: #7c4dff;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 20px;
          font-size: 1em;
        }
        a.btn:hover { background: #6a3de0; }
        .info {
          background: #1a2634;
          border-radius: 8px;
          padding: 15px;
          margin-top: 30px;
          text-align: left;
          font-size: 0.9em;
        }
        .info h3 { color: #7c4dff; margin-top: 0; }
      </style>
    </head>
    <body>
      <h1>🎬 Videasy ITA</h1>
      <p>Addon Stremio per Film e Serie TV in Italiano tramite Videasy</p>
      
      <p>URL Manifest:</p>
      <div class="badge">${addonUrl}/manifest.json</div>
      
      <br>
      <a class="btn" href="stremio://${req.get("host")}/manifest.json">
        ➕ Installa in Stremio
      </a>

      <div class="info">
        <h3>📋 Info</h3>
        <ul>
          <li>✅ Film e Serie TV</li>
          <li>🇮🇹 Contenuti in Italiano</li>
          <li>🔗 Stream da Videasy</li>
          <li>🆓 Gratuito e open source</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// ============================================================
//  ROUTE: Manifest - descrive l'addon a Stremio
// ============================================================
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

// ============================================================
//  ROUTE: Stream - endpoint principale richiesto da Stremio
//  GET /stream/:type/:id.json
//  Esempi:
//    /stream/movie/tt1234567.json
//    /stream/series/tt1234567:1:1.json
// ============================================================
app.get("/stream/:type/:id.json", async (req, res) => {
  const { type, id } = req.params;

  try {
    const streams = await getStreams(type, id);
    res.json({ streams });
  } catch (err) {
    console.error(`[HTTP] Errore stream: ${err.message}`);
    res.json({ streams: [] });
  }
});

// ============================================================
//  ROUTE: Catalog - non implementato (solo stream)
// ============================================================
app.get("/catalog/:type/:id.json", (req, res) => {
  res.json({ metas: [] });
});

// ============================================================
//  ROUTE: Health check
// ============================================================
app.get("/health", (req, res) => {
  res.json({ status: "ok", addon: manifest.name, version: manifest.version });
});

// ============================================================
//  AVVIO SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║       🎬 Stremio Videasy ITA Addon        ║
╚═══════════════════════════════════════════╝

✅ Server avviato su: http://localhost:${PORT}
📋 Manifest: http://localhost:${PORT}/manifest.json
🔗 Installa in Stremio:
   stremio://localhost:${PORT}/manifest.json
  `);
});

module.exports = app;
