# 🎥 Sora Video Downloader - Extensión de Chrome

## ✅ LA ÚNICA SOLUCIÓN QUE FUNCIONA

Los videos de Sora **requieren autenticación de ChatGPT**. No se pueden descargar desde un servidor externo.

Esta extensión funciona porque:
- Se ejecuta en tu navegador mientras estás autenticado
- Usa tus credenciales de ChatGPT
- Descarga directamente desde Sora

## 📦 Instalación

### Paso 1: Descargar la extensión
Los archivos están en la carpeta `extension-simple/`

### Paso 2: Instalar en Chrome

1. Abre Chrome
2. Ve a `chrome://extensions/`
3. Activa "Modo de desarrollador" (arriba a la derecha)
4. Click en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `extension-simple`
6. ¡Listo!

## 🚀 Uso

1. Ve a https://sora.chatgpt.com
2. Inicia sesión con tu cuenta de ChatGPT
3. Abre cualquier video
4. Verás un botón flotante "⬇️ Descargar Video" en la esquina inferior derecha
5. Click en el botón
6. ¡El video se descarga!

## ✨ Características

- ✅ Funciona con videos públicos y privados
- ✅ Descarga directa (sin servidor intermedio)
- ✅ Botón flotante en cada video
- ✅ Rápido (5-10 segundos)
- ✅ 100% gratis
- ✅ Sin límites

## 🔧 Archivos

- `manifest.json` - Configuración de la extensión
- `content.js` - Script que se ejecuta en Sora
- `popup.html` - Popup de la extensión
- `icon16.png`, `icon48.png`, `icon128.png` - Iconos (crear)

## 📝 Crear Iconos

Necesitas crear 3 iconos PNG:
- `icon16.png` - 16x16 px
- `icon48.png` - 48x48 px
- `icon128.png` - 128x128 px

Puedes usar cualquier imagen de un ícono de video o descarga.

## ⚠️ Importante

- Debes estar autenticado en Sora para que funcione
- Solo funciona en páginas de sora.chatgpt.com
- La extensión no envía datos a ningún servidor
- Todo se procesa localmente en tu navegador

## 🎯 Por Qué Esta Es La Única Solución

### ❌ Lo que NO funciona:
- Servidor con Puppeteer → No tiene credenciales de ChatGPT
- Proxies → Bloqueados por Cloudflare
- Descarga directa → Requiere autenticación

### ✅ Lo que SÍ funciona:
- Extensión de Chrome → Usa tus credenciales
- Ejecuta en tu navegador → Ya estás autenticado
- Descarga directa → Sin intermediarios

## 📊 Comparación

| Método | Funciona | Velocidad | Privados |
|--------|----------|-----------|----------|
| Servidor | ❌ | - | ❌ |
| Proxies | ❌ | - | ❌ |
| **Extensión** | ✅ | ⚡ Rápido | ✅ |

## 🔗 Alternativa: Bookmarklet

Si no quieres instalar una extensión, también puedes usar el bookmarklet en `bookmarklet.html`
