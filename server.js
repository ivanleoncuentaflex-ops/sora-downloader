const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Función para extraer video sin Puppeteer (más simple)
async function extractVideoSimple(url) {
    try {
        console.log('🔍 Extrayendo video de:', url);
        
        // Hacer request directo a la página
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        });

        const html = response.data;
        console.log('📄 HTML recibido, longitud:', html.length);
        
        // Buscar URLs de video con múltiples patrones
        const patterns = [
            // Patrón 1: URLs directas de video
            /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi,
            /https?:\/\/[^\s"'<>]+\.webm[^\s"'<>]*/gi,
            
            // Patrón 2: URLs en JSON
            /"videoUrl":\s*"([^"]+)"/gi,
            /"url":\s*"([^"]+\.mp4[^"]*)"/gi,
            /"src":\s*"([^"]+\.mp4[^"]*)"/gi,
            
            // Patrón 3: URLs de OpenAI/Sora
            /https?:\/\/videos\.openai\.com[^\s"'<>]+/gi,
            /https?:\/\/[^\s"'<>]*sora[^\s"'<>]*\.mp4[^\s"'<>]*/gi,
            
            // Patrón 4: URLs en atributos
            /src=["']([^"']+\.mp4[^"']*)["']/gi,
            /href=["']([^"']+\.mp4[^"']*)["']/gi
        ];

        const foundUrls = new Set();
        
        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                const url = match[1] || match[0];
                if (url && url.includes('http')) {
                    foundUrls.add(url);
                    console.log('📹 Video encontrado:', url.substring(0, 100) + '...');
                }
            }
        }

        const videoUrls = Array.from(foundUrls);
        
        if (videoUrls.length > 0) {
            // Filtrar y seleccionar el mejor video
            const validVideos = videoUrls.filter(url => 
                !url.includes('thumbnail') &&
                !url.includes('preview') &&
                (url.includes('.mp4') || url.includes('video') || url.includes('openai'))
            );
            
            if (validVideos.length > 0) {
                console.log('✅ Video seleccionado:', validVideos[0].substring(0, 100) + '...');
                return validVideos[0];
            }
        }
        
        throw new Error('No se encontró el video. El enlace puede ser privado o requerir autenticación.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Endpoint de descarga
app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false,
            error: 'URL es requerida' 
        });
    }
    
    console.log('📥 Solicitud:', url);
    
    try {
        // Extraer URL del video
        const videoUrl = await extractVideoSimple(url);
        
        // Descargar el video
        console.log('⬇️ Descargando video...');
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://sora.chatgpt.com/',
                'Origin': 'https://sora.chatgpt.com'
            },
            timeout: 120000,
            maxRedirects: 5
        });
        
        // Configurar headers
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Enviar el stream
        response.data.pipe(res);
        
        console.log('✅ Descarga iniciada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        let errorMessage = 'No se pudo descargar el video.';
        
        if (error.message.includes('403') || error.message.includes('401')) {
            errorMessage = 'El video es privado o requiere autenticación. Asegúrate de que el enlace sea de un video público.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Video no encontrado. Verifica que el enlace sea correcto.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. El video puede ser muy grande o el servidor está lento.';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('✨ Listo para descargar videos de Sora (sin Puppeteer)');
    console.log('📝 Método: Extracción directa de HTML');
});
