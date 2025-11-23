const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL requerida' });
    }

    const outputFile = `sora-video-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'downloads', outputFile);

    // Crear carpeta downloads si no existe
    if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
        fs.mkdirSync(path.join(__dirname, 'downloads'));
    }

    console.log('🔽 Descargando:', url);

    // Usar yt-dlp para descargar
    const command = `yt-dlp -o "${outputPath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error:', error);
            return res.status(500).json({ 
                error: 'Error al descargar. Asegúrate de tener yt-dlp instalado.' 
            });
        }

        console.log('✅ Descarga completa');

        // Enviar el archivo
        res.download(outputPath, outputFile, (err) => {
            if (err) {
                console.error('Error al enviar archivo:', err);
            }
            // Eliminar el archivo después de enviarlo
            setTimeout(() => {
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            }, 5000);
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor simple corriendo en http://localhost:${PORT}`);
    console.log('📦 Requiere yt-dlp instalado: https://github.com/yt-dlp/yt-dlp');
});
