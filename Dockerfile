FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze Node
RUN npm install --production

# Installa browser Playwright
RUN npx playwright install chromium

# Copia codice sorgente
COPY src/ ./src/

# Porta
EXPOSE 7860

ENV PORT=7860
ENV NODE_ENV=production

# Avvia l'addon
CMD ["node", "src/index.js"]
