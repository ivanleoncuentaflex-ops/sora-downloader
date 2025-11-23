const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Crear carpeta de descargas
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Verificar si yt-dlp está instalado
async function checkYtDlp() {
    try {
        await execAsync('yt-dlp --version');
        return true;
    } catch {
        try {
            await execAsync('python -m yt_dlp --version');
            return 'python';
        } catch {
            return false;
        }
    }
}

// Método 1: Intentar con yt-dlp (más robusto)
async function downloadWithYtDlp(url, outputPath, authToken = null) {
    const ytdlpCheck = await checkYtDlp();
    
    if (!ytdlpCheck) {
        throw new Error('yt-dlp no está instalado');
    }

    let command;
    
    // Si hay token, crear archivo de cookies temporal
    if (authToken) {
        const cookiesFile = path.join(downloadsDir, `cookies-${Date.now()}.txt`);
        const cookieContent = `# Netscape HTTP Cookie File
.chatgpt.com	TRUE	/	TRUE	0	__Secure-next-auth.session-token	${authToken}`;
        fs.writeFileSync(cookiesFile, cookieContent);
        
        command = ytdlpCheck === 'python' 
            ? `python -m yt_dlp --cookies "${cookiesFile}" -o "${outputPath}" "${url}"`
            : `yt-dlp --cookies "${cookiesFile}" -o "${outputPath}" "${url}"`;
        
        // Limpiar archivo de cookies después
        setTimeout(() => {
            if (fs.existsSync(cookiesFile)) fs.unlinkSync(cookiesFile);
        }, 5000);
    } else {
        // Intentar con cookies del navegador Chrome del servidor
        command = ytdlpCheck === 'python' 
            ? `python -m yt_dlp --cookies-from-browser chrome -o "${outputPath}" "${url}"`
            : `yt-dlp --cookies-from-browser chrome -o "${outputPath}" "${url}"`;
    }

    console.log('🔽 Ejecutando yt-dlp...');
    
    try {
        const { stdout, stderr } = await execAsync(command, { timeout: 120000 });
        console.log('✅ yt-dlp output:', stdout);
        return true;
    } catch (error) {
        console.error('❌ yt-dlp error:', error.message);
        throw error;
    }
}

// Método 2: Extracción directa del video (fallback)
async function downloadDirect(url) {
    console.log('🔍 Intentando extracción directa...');
    
    try {
        // Intentar obtener la página
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = response.data;
        
        // Buscar URLs de video
        const patterns = [
            /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi,
            /"videoUrl":\s*"([^"]+)"/i,
            /"url":\s*"([^"]+\.mp4[^"]*)"/i,
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                const videoUrl = match[1] || match[0];
                console.log('✅ Video encontrado:', videoUrl);
                return videoUrl;
            }
        }

        throw new Error('No se pudo encontrar el video');
    } catch (error) {
        throw new Error(`Extracción directa falló: ${error.message}`);
    }
}

// Endpoint principal de descarga
app.post('/api/download', async (req, res) => {
    const { url, authToken } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false,
            error: 'URL es requerida' 
        });
    }

    const timestamp = Date.now();
    const outputFile = `sora-video-${timestamp}.mp4`;
    const outputPath = path.join(downloadsDir, outputFile);

    console.log('📥 Solicitud de descarga:', url);

    try {
        // Intentar con yt-dlp usando token si se proporciona
        await downloadWithYtDlp(url, outputPath, authToken);
        
        // Verificar que el archivo existe
        if (fs.existsSync(outputPath)) {
            console.log('✅ Descarga exitosa');
            
            // Enviar el archivo
            res.download(outputPath, outputFile, (err) => {
                if (err) {
                    console.error('Error al enviar:', err);
                }
                // Limpiar archivo después de 10 segundos
                setTimeout(() => {
                    if (fs.existsSync(outputPath)) {
                        fs.unlinkSync(outputPath);
                        console.log('🗑️ Archivo temporal eliminado');
                    }
                }, 10000);
            });
            return;
        }

        throw new Error('El archivo no se generó correctamente');

    } catch (error) {
        console.error('❌ Error completo:', error);
        
        return res.status(500).json({ 
            success: false,
            error: 'No se pudo descargar el video. Por favor:\n\n1. Haz clic en "🔐 Opciones de Autenticación"\n2. Sigue las instrucciones para obtener tu token de ChatGPT\n3. Pégalo en el campo de token\n4. Intenta descargar de nuevo\n\nEsto solo toma 1 minuto y te permitirá descargar cualquier video.',
            details: error.message
        });
    }
});

// Endpoint para verificar el estado del servidor
app.get('/api/status', async (req, res) => {
    const ytdlpInstalled = await checkYtDlp();
    
    res.json({
        status: 'online',
        ytdlp: ytdlpInstalled ? 'instalado' : 'no instalado',
        message: ytdlpInstalled 
            ? '✅ Servidor listo para descargar videos'
            : '⚠️ Instala yt-dlp para mejor compatibilidad: pip install yt-dlp'
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    
    const ytdlpStatus = await checkYtDlp();
    if (ytdlpStatus) {
        console.log('✅ yt-dlp detectado - Funcionalidad completa disponible');
    } else {
        console.log('⚠️ yt-dlp NO detectado - Funcionalidad limitada');
        console.log('📦 Instala con: pip install yt-dlp');
        console.log('🔗 O descarga desde: https://github.com/yt-dlp/yt-dlp/releases');
    }
});
