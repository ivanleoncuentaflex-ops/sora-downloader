# 🌐 CÓMO PUBLICAR TU PÁGINA PARA QUE TODOS LA USEN

## 📋 Pasos Simples (15 minutos)

### 1️⃣ SUBIR A GITHUB

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Mi descargador de Sora"

# Crear repositorio en GitHub
# Ve a https://github.com/new
# Crea un repositorio llamado "sora-downloader"

# Conectar y subir
git remote add origin https://github.com/TU-USUARIO/sora-downloader.git
git branch -M main
git push -u origin main
```

### 2️⃣ PUBLICAR EN RENDER (GRATIS)

1. **Ve a:** https://render.com
2. **Regístrate** con tu email o GitHub
3. **Haz clic en:** "New +" → "Web Service"
4. **Conecta tu GitHub** y selecciona el repositorio
5. **Configuración:**
   - Name: `sora-downloader`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`
6. **Haz clic en:** "Create Web Service"
7. **Espera 5-10 minutos** mientras se despliega

### 3️⃣ ¡LISTO!

Tu página estará en: `https://sora-downloader.onrender.com`

---

## 🎉 ALTERNATIVA MÁS RÁPIDA: RAILWAY

1. **Ve a:** https://railway.app
2. **Login con GitHub**
3. **New Project** → "Deploy from GitHub repo"
4. **Selecciona tu repositorio**
5. **Espera 3-5 minutos**
6. **Settings** → "Generate Domain"
7. ¡Tu página está lista!

---

## 💰 COSTOS

- **Render Free:** 750 horas/mes GRATIS
- **Railway:** $5 de crédito gratis al mes
- **Vercel:** Ilimitado GRATIS (pero Puppeteer puede tener problemas)

---

## 🔧 SI HAY PROBLEMAS CON PUPPETEER

En Render, agrega estas variables de entorno:

1. Ve a tu servicio en Render
2. Environment → Add Environment Variable
3. Agrega:
   ```
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

---

## 📱 COMPARTIR TU PÁGINA

Una vez publicada, comparte tu URL:
- En redes sociales
- Con amigos
- En foros
- En grupos de WhatsApp/Telegram

**Ejemplo de mensaje:**
```
🎬 Descarga videos de Sora GRATIS
👉 https://tu-pagina.onrender.com

✅ Sin registro
✅ Sin límites
✅ 100% gratis
```

---

## 🎯 DOMINIO PERSONALIZADO (OPCIONAL)

Si quieres un dominio como `descargar-sora.com`:

1. Compra un dominio en Namecheap o GoDaddy ($10-15/año)
2. En Render: Settings → Custom Domain
3. Agrega tu dominio
4. Configura los DNS según las instrucciones
5. ¡Listo!

---

## ✅ CHECKLIST FINAL

- [ ] Código subido a GitHub
- [ ] Cuenta creada en Render
- [ ] Servicio desplegado
- [ ] URL funcionando
- [ ] Probado con un video de Sora
- [ ] Compartido con amigos

---

## 🆘 ¿NECESITAS AYUDA?

Si algo no funciona:
1. Revisa los logs en Render (Logs tab)
2. Verifica que package.json tenga todas las dependencias
3. Asegúrate de que el puerto sea correcto (10000 para Render)
