FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Koyeb assegna la porta tramite variabile d'ambiente PORT
ENV PORT=8000

EXPOSE 8000

CMD ["node", "index.js"]
