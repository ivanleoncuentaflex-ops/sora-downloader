# Descargador de Videos Sora

Una aplicación web para descargar videos de Sora de forma gratuita.

## 🚀 Características

- Interfaz simple y moderna
- Diseño responsive
- Fácil de usar

## 📋 Requisitos

Para que esta aplicación funcione completamente, necesitas:

1. **Frontend** (Ya incluido):
   - HTML, CSS, JavaScript

2. **Backend** (Necesario implementar):
   - Node.js con Express, o
   - Python con Flask/FastAPI, o
   - Cualquier otro backend de tu preferencia

3. **API/Método de descarga**:
   - Acceso a la API de Sora o método para extraer videos

## 🛠️ Instalación

1. Clona o descarga este proyecto
2. Abre `index.html` en tu navegador para ver la interfaz

## ⚙️ Implementación del Backend

Para hacer funcional la descarga, necesitas crear un backend. Ejemplo con Node.js:

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.')); // Sirve los archivos HTML/CSS/JS

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    
    // Aquí implementas la lógica para:
    // 1. Validar el URL de Sora
    // 2. Extraer el video
    // 3. Enviar el archivo al cliente
    
    // Ejemplo básico:
    // const videoData = await downloadFromSora(url);
    // res.download(videoData);
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
```

## 📝 Notas Importantes

- Esta es una versión demo del frontend
- Necesitas implementar el backend para descargas reales
- Asegúrate de respetar los términos de servicio de Sora
- Considera aspectos legales y de derechos de autor

## 🌐 Uso

1. Abre la aplicación en tu navegador
2. Pega el enlace del video de Sora
3. Haz clic en "Descargar Video"
4. El video se descargará automáticamente

## 📄 Licencia

Uso libre para proyectos personales.
