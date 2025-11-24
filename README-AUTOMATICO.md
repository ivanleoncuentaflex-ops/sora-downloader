# 🎥 Descargador Automático de Videos Sora

## ✨ Características

- **100% AUTOMÁTICO**: Solo pega el link y descarga
- **Sin autenticación manual**: El servidor usa Puppeteer para simular un navegador real
- **Sin límites**: Descarga todos los videos que quieras
- **Gratis**: Sin costos ni registros

## 🚀 Cómo Funciona

1. El usuario pega el enlace de Sora
2. El servidor inicia un navegador automatizado (Puppeteer)
3. El navegador accede a la página como un usuario real
4. Extrae la URL del video automáticamente
5. Descarga el video y lo envía al usuario

## 📦 Instalación

```bash
npm install
npm start
```

El servidor se iniciará en `http://localhost:10000`

## 🌐 Desplegar en Render.com

1. Sube el código a GitHub
2. Conecta tu repositorio en Render.com
3. Render detectará automáticamente que es Node.js
4. El servidor se desplegará con Puppeteer incluido

### Configuración en Render:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

Render instalará automáticamente Chromium para Puppeteer.

## 🔧 Archivos Principales

- `server-automatico.js` - Servidor con Puppeteer
- `index.html` - Interfaz simple
- `package.json` - Dependencias (incluye puppeteer)

## ⚡ Ventajas vs Métodos Anteriores

### Método Anterior (Proxies):
- ❌ Bloqueado por Cloudflare
- ❌ Requiere autenticación del usuario
- ❌ No funciona con videos privados

### Método Actual (Puppeteer):
- ✅ Bypasea Cloudflare automáticamente
- ✅ Simula un navegador real
- ✅ Extrae videos sin autenticación del usuario
- ✅ Funciona con la mayoría de videos públicos

## 📝 Notas

- El proceso puede tomar 20-40 segundos (tiempo de iniciar navegador + extraer video)
- Algunos videos muy privados pueden requerir autenticación específica
- En producción, Render.com proporciona Chromium automáticamente

## 🎯 Uso

1. Abre `http://localhost:10000` (o tu URL de Render)
2. Pega el enlace de Sora: `https://sora.chatgpt.com/p/...`
3. Click en "Descargar Video"
4. Espera 20-40 segundos
5. ¡El video se descargará automáticamente!

## 🔒 Limitaciones

- Videos que requieren autenticación específica de ChatGPT pueden no funcionar
- El proceso es más lento que métodos directos (pero más confiable)
- Consume más recursos del servidor (navegador completo)

## 💡 Solución Alternativa

Si un video no se puede descargar automáticamente, la página muestra instrucciones para descarga manual:
1. Abrir el video en Sora
2. Click derecho → "Guardar video como..."
