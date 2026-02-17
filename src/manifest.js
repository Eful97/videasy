// src/manifest.js
// Manifest dell'addon Stremio - descrive le capacità dell'addon

const manifest = {
  id: "community.videasy-ita",
  version: "1.0.0",
  name: "Videasy ITA",
  description: "Stream italiani da Videasy. Film e Serie TV in italiano.",
  logo: "https://www.videasy.net/favicon.ico",
  background: "https://i.imgur.com/t8wVwcg.jpg",

  // Tipo di risorse che l'addon fornisce
  resources: ["stream"],

  // Tipi di contenuto supportati
  types: ["movie", "series"],

  // Catalogs vuoti (usiamo solo gli stream, non forniamo catalogo)
  catalogs: [],

  // ID prefix supportati (cinemeta usa imdb IDs con prefisso "tt")
  idPrefixes: ["tt"],
};

module.exports = manifest;
