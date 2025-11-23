# 🚀 Guía para Publicar tu Página de Descarga de Sora

## Opción 1: Render.com (RECOMENDADA - 100% GRATIS)

### Pasos:

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate gratis con tu email o GitHub

2. **Subir tu código a GitHub**
   - Ve a https://github.com
   - Crea un nuevo repositorio (público o privado)
   - Sube todos los archivos de tu proyecto

3. **Conectar Render con GitHub**
   - En Render, haz clic en "New +"
   - Selecciona "Web Service"
   - Conecta tu cuenta de GitHub
   - Selecciona tu repositorio

4. **Configurar el servicio**
   - Name: `sora-downloader` (o el nombre que quieras)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

5. **Desplegar**
   - Haz clic en "Create Web Service"
   - Espera 5-10 minutos
   - ¡Tu página estará en línea!

6. **Tu URL será algo como:**
   - `https://sora-downloader.onrender.com`

---

## Opción 2: Railway.app (GRATIS)

### Pasos:

1. **Crear cuenta**
   - Ve a https://railway.app
   - Regístrate con GitHub

2. **Nuevo proyecto**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

3. **Configuración automática**
   - Railway detecta Node.js automáticamente
   - No necesitas configurar nada más

4. **Obtener URL**
   - Ve a Settings → Generate Domain
   - Tu página estará disponible en esa URL

---

## Opción 3: Vercel (MÁS RÁPIDO)

### Pasos:

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Desplegar**
   ```bash
   vercel
   ```

3. **Seguir las instrucciones**
   - Login con GitHub
   - Confirmar configuración
   - ¡Listo!

---

## ⚠️ IMPORTANTE: Configuración de Puppeteer en Producción

Cuando despliegues, necesitas agregar estas variables de entorno:

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Y en Render, agrega este buildpack:
```
https://github.com/jontewks/puppeteer-heroku-buildpack
```

---

## 📝 Resumen Rápido

### Para Render (Más fácil):
1. Sube código a GitHub
2. Conecta GitHub con Render
3. Deploy automático
4. URL: `https://tu-app.onrender.com`

### Ventajas de Render:
- ✅ 100% Gratis
- ✅ SSL automático (HTTPS)
- ✅ Deploy automático cuando actualizas GitHub
- ✅ Fácil de configurar
- ✅ No requiere tarjeta de crédito

---

## 🎯 Después de Publicar

Tu página estará disponible 24/7 en internet y cualquier persona podrá:
1. Abrir tu URL
2. Pegar un link de Sora
3. Descargar el video gratis

---

## 💡 Tips

- Comparte tu URL en redes sociales
- Puedes comprar un dominio personalizado (opcional)
- Monitorea el uso en el dashboard de Render
- El plan gratis de Render duerme después de 15 min sin uso, pero se despierta automáticamente

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Asegúrate de que Puppeteer esté configurado
3. Verifica que todas las dependencias estén en package.json
