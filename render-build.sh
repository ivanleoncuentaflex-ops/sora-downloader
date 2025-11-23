#!/usr/bin/env bash
# Instalar dependencias de Node
npm install

# Instalar Chromium y dependencias
apt-get update
apt-get install -y chromium chromium-sandbox

echo "Build completado con Chromium instalado"
