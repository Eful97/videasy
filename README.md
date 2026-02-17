# 🎬 Stremio Videasy ITA

Addon Stremio con **stream diretti nel player nativo** tramite Videasy.  
Film e Serie TV in italiano — hostato su **Koyeb** (gratis).

---

## 🚀 Deploy su Koyeb (guida completa)

### Prerequisiti
- Account [GitHub](https://github.com) (gratuito)
- Account [Koyeb](https://app.koyeb.com) (gratuito, non serve carta di credito)
- Chiave API TMDB gratuita (vedi Step 1)

---

### Step 1 — Ottieni la chiave API TMDB (gratis)

1. Crea account su [themoviedb.org](https://www.themoviedb.org/signup)
2. Vai su **Profilo → Impostazioni → API**
3. Crea chiave API (tipo: **Developer**, uso: personale)
4. Copia la **API Key (v3 auth)** — ti servirà dopo

---

### Step 2 — Metti il codice su GitHub

1. Vai su [github.com/new](https://github.com/new)
2. Crea un repository chiamato `stremio-videasy-ita`
3. Seleziona **Privato** (consigliato)
4. Apri il terminale nella cartella del progetto:

```bash
git init
git add .
git commit -m "primo commit"
git remote add origin https://github.com/TUO_USERNAME/stremio-videasy-ita.git
git push -u origin main
```

---

### Step 3 — Deploya su Koyeb

1. Vai su [app.koyeb.com](https://app.koyeb.com) e accedi
2. Clicca **Create Service**
3. Scegli **GitHub** come sorgente
4. Seleziona il repository `stremio-videasy-ita`
5. Koyeb rileva automaticamente il Dockerfile

**Aggiungi le variabili d'ambiente:**

| Nome | Valore |
|---|---|
| `TMDB_API_KEY` | la tua chiave API TMDB |

6. Clicca **Deploy** e aspetta ~2 minuti

---

### Step 4 — Aggiungi l'URL pubblico

Dopo il deploy, Koyeb ti dà un URL tipo:
```
https://stremio-videasy-ita-tuonome.koyeb.app
```

Vai su **Service → Settings → Environment variables** e aggiungi:

| Nome | Valore |
|---|---|
| `PUBLIC_URL` | `https://stremio-videasy-ita-tuonome.koyeb.app` |

Salva — Koyeb rideploya automaticamente.

---

### Step 5 — Installa in Stremio

```
https://stremio-videasy-ita-tuonome.koyeb.app/manifest.json
```

1. Apri **Stremio → Addon → Installa addon da URL**
2. Incolla il tuo URL
3. Conferma ✅

---

## 🔧 Sviluppo locale

```bash
npm install
TMDB_API_KEY=la_tua_chiave npm start
# installa su: http://127.0.0.1:7000/manifest.json
```

---

## ❓ Problemi comuni

| Problema | Soluzione |
|---|---|
| Build fallisce su Koyeb | Controlla i log nella dashboard Koyeb |
| Stream non trovato | Controlla che `TMDB_API_KEY` sia corretta |
| Player apre il browser | Aggiorna Stremio all'ultima versione |
