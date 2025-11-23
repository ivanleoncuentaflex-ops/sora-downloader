# 🚀 PUBLICA TU PÁGINA EN 5 MINUTOS

## OPCIÓN 1: RENDER (LA MÁS FÁCIL) ⭐

### Paso 1: Sube a GitHub
```bash
git init
git add .
git commit -m "Descargador de Sora"
```

Ahora ve a https://github.com/new y crea un repositorio llamado "sora-downloader"

Luego ejecuta (reemplaza TU-USUARIO con tu usuario de GitHub):
```bash
git remote add origin https://github.com/TU-USUARIO/sora-downloader.git
git branch -M main
git push -u origin main
```

### Paso 2: Despliega en Render
1. Ve a https://render.com y regístrate
2. Haz clic en "New +" → "Web Service"
3. Conecta tu GitHub
4. Selecciona el repositorio "sora-downloader"
5. Configuración:
   - **Name:** sora-downloader
   - **Environment:** Node
   - **Build Command:** npm install
   - **Start Command:** npm start
   - **Plan:** Free
6. Haz clic en "Create Web Service"

### Paso 3: ¡Listo!
En 5-10 minutos tu página estará en:
`https://sora-downloader.onrender.com`

---

## OPCIÓN 2: RAILWAY (MÁS RÁPIDA) 🚄

### Paso 1: Sube a GitHub (igual que arriba)

### Paso 2: Despliega en Railway
1. Ve a https://railway.app
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Espera 3 minutos
6. "Settings" → "Generate Domain"

### ¡Listo! Tu URL estará lista

---

## OPCIÓN 3: VERCEL (ULTRA RÁPIDA) ⚡

```bash
# Instalar Vercel
npm install -g vercel

# Desplegar
vercel

# Seguir las instrucciones en pantalla
```

Tu página estará en: `https://tu-proyecto.vercel.app`

---

## 📱 DESPUÉS DE PUBLICAR

Comparte tu URL:
```
🎬 Descarga Videos de Sora GRATIS
👉 [TU-URL-AQUI]

✅ Sin registro
✅ Sin límites  
✅ 100% gratis
✅ Máxima calidad
```

---

## ⚠️ IMPORTANTE

Si Puppeteer no funciona en Render, agrega estas variables de entorno:

1. En tu servicio de Render
2. Environment → Add Environment Variable
3. Agrega:
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` = `true`
   - `PUPPETEER_EXECUTABLE_PATH` = `/usr/bin/chromium-browser`

---

## 🎯 RESUMEN

1. **Sube a GitHub** (5 min)
2. **Conecta con Render** (2 min)
3. **Espera el deploy** (5-10 min)
4. **¡Comparte tu URL!** (∞)

**Total: 15 minutos para tener tu página en línea**

---

## 💡 TIPS

- El plan gratis de Render duerme después de 15 min sin uso
- Se despierta automáticamente cuando alguien entra
- Puedes tener múltiples proyectos gratis
- SSL (HTTPS) incluido automáticamente

---

## 🆘 ¿PROBLEMAS?

1. Revisa los logs en Render
2. Verifica que todas las dependencias estén en package.json
3. Asegúrate de que el puerto sea 10000 (ya configurado)
