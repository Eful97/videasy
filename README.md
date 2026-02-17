# 🎬 Stremio Videasy ITA

Addon Stremio con **stream diretti nel player nativo** tramite Videasy.  
Film e Serie TV in italiano.

---

## ⚡ Setup (5 minuti)

### 1. Installa Node.js
Scarica da [nodejs.org](https://nodejs.org) la versione **LTS**.

### 2. Ottieni la chiave API TMDB (gratuita)

> Videasy usa **TMDB ID**, non IMDB ID. Serve una chiave TMDB per la conversione.

1. Crea account su [themoviedb.org](https://www.themoviedb.org/signup)
2. Vai su **Profilo → Impostazioni → API**
3. Crea una chiave API (tipo: **Developer**, app personale)
4. Copia la **API Key (v3)**

### 3. Incolla la chiave in `tmdb.js`

Apri `tmdb.js` e sostituisci questa riga:

```js
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'LA_TUA_CHIAVE_API_TMDB';
```

Con la tua chiave:

```js
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'abc123def456...';
```

### 4. Installa le dipendenze e avvia

```bash
npm install
npm start
```

### 5. Installa in Stremio

1. Apri **Stremio**
2. **Addon → Installa addon da URL**
3. Inserisci: `http://127.0.0.1:7000/manifest.json`
4. Conferma

✅ Cerca un film o serie — vedrai lo stream **Videasy ITA** nel player nativo!

---

## 🔧 Come funziona

```
Utente clicca su un film in Stremio
         ↓
Stremio invia: GET /stream/movie/tt0299534.json
         ↓
L'addon converte IMDB → TMDB tramite API TMDB (gratuita)
  tt0299534  →  299534
         ↓
Costruisce l'URL Videasy:
  https://player.videasy.net/movie/299534
         ↓
Stremio riceve l'URL e lo riproduce nel player nativo
```

---

## 🌐 Deploy online (Vercel, gratis)

```bash
npm install -g vercel
vercel
```

Quando richiesto, imposta la variabile d'ambiente:
```
TMDB_API_KEY = la_tua_chiave
```

---

## ❓ Problemi comuni

| Problema | Soluzione |
|---|---|
| `Stream non trovato` | Controlla che la chiave TMDB sia corretta |
| `Port 7000 already in use` | Cambia `PORT` in `index.js` |
| Player apre il browser invece di Stremio | Aggiorna Stremio all'ultima versione |
