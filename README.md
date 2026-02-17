# 🎬 Stremio Videasy ITA

Addon Stremio che estrae stream italiani da **Videasy** per Film e Serie TV.

## 📦 Installazione

### 1. Prerequisiti

- [Node.js](https://nodejs.org/) versione 18+
- npm o yarn

### 2. Clona e installa

```bash
git clone https://github.com/TUO_USERNAME/stremio-videasy.git
cd stremio-videasy
npm install
```

### 3. Installa Playwright (per il browser headless)

```bash
npx playwright install chromium
```

### 4. Avvia il server

```bash
npm start
```

Il server parte su `http://localhost:7860`

### 5. Installa in Stremio

Apri Stremio e vai su **Impostazioni → Addon → Aggiungi Addon**, poi incolla:

```
http://localhost:7860/manifest.json
```

Oppure clicca direttamente su:

```
stremio://localhost:7860/manifest.json
```

---

## 🌐 Deploy Online (opzionale)

Per rendere l'addon accessibile anche su Stremio Web o da altri dispositivi, puoi deployarlo su:

### Render.com (gratuito)

1. Crea account su [render.com](https://render.com)
2. Nuovo servizio **Web Service** → connetti il tuo repository GitHub
3. Imposta:
   - **Build Command**: `npm install && npx playwright install chromium --with-deps`
   - **Start Command**: `npm start`
4. Copia l'URL e usalo come manifest in Stremio

### Railway.app

1. Vai su [railway.app](https://railway.app)
2. Deploy from GitHub
3. Aggiungi variabile: `PORT=7860`
4. In `Procfile` (già incluso): `web: npm start`

---

## 🛠️ Struttura Progetto

```
stremio-videasy/
├── src/
│   ├── index.js      # Server Express + route HTTP
│   ├── addon.js      # Handler richieste Stremio
│   ├── videasy.js    # Scraper Videasy (Playwright + fallback)
│   └── manifest.js   # Manifest addon
├── package.json
└── README.md
```

## ⚙️ Come Funziona

```
Stremio → GET /stream/movie/tt1234567.json
            ↓
        addon.js: parsifica type e id
            ↓
        videasy.js: apre Playwright → player.videasy.net/movie/tt1234567
            ↓
        Intercetta richieste di rete → trova URL .m3u8
            ↓
        Restituisce array di stream a Stremio
```

### Strategia di Estrazione

1. **Playwright** (principale): apre un browser Chromium headless, carica l'embed di Videasy, e intercetta le richieste di rete verso file `.m3u8`
2. **Fallback HTTP**: se Playwright non è disponibile, fa una semplice richiesta GET e cerca pattern URL m3u8 nell'HTML
3. **Link diretto**: se nessuno stream viene trovato, restituisce il link embed come `externalUrl`

---

## 🧪 Test

Puoi testare l'addon con curl:

```bash
# Film (The Dark Knight)
curl http://localhost:7860/stream/movie/tt0468569.json

# Serie (Breaking Bad S1E1)
curl http://localhost:7860/stream/series/tt0903747:1:1.json

# Health check
curl http://localhost:7860/health
```

---

## ⚠️ Note Legali

Questo addon è creato a scopo educativo. Assicurati di rispettare i termini di servizio di Videasy e le leggi sul copyright applicabili nel tuo paese.

## 📄 Licenza

MIT
