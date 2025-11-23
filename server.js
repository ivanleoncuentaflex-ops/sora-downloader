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
        // Método 1: Intentar extracción directa
        console.log('🔍 Intentando extracción directa...');
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://chatgpt.com/',
                'Origin': 'https://chatgpt.com'
            },
            timeout: 20000,
            maxRedirects: 5
        });

        const html = response.data;
        console.log('📄 HTML recibido, buscando video...');
        
        // Múltiples patrones para encontrar el video
        const patterns = [
            // OpenAI videos
            /https:\/\/videos\.openai\.com\/[^\s"'<>]+/gi,
            // URLs directas de video
            /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi,
            // En JSON
            /"videoUrl":\s*"([^"]+)"/gi,
            /"url":\s*"([^"]+\.mp4[^"]*)"/gi,
            /"src":\s*"([^"]+\.mp4[^"]*)"/gi,
            // En atributos HTML
            /src=["']([^"']+\.mp4[^"']*)["']/gi,
            /href=["']([^"']+\.mp4[^"']*)["']/gi,
            // Sora específico
            /https?:\/\/[^\s"'<>]*sora[^\s"'<>]*\.(mp4|webm)[^\s"'<>]*/gi
        ];

        let videoUrl = null;
        
        for (const pattern of patterns) {
            const matches = [...html.matchAll(pattern)];
            for (const match of matches) {
                const url = match[1] || match[0];
                if (url && url.includes('http') && !url.includes('thumbnail') && !url.includes('preview')) {
                    videoUrl = url;
                    console.log('✅ Video encontrado:', videoUrl.substring(0, 80) + '...');
                    break;
                }
            }
            if (videoUrl) break;
        }
        
        if (!videoUrl) {
            throw new Error('VIDEO_NOT_FOUND');
        }
        
        // Descargar el video
        console.log('⬇️ Descargando video...');
        const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://sora.chatgpt.com/',
                'Origin': 'https://sora.chatgpt.com',
                'Accept': '*/*'
            },
            timeout: 180000,
            maxRedirects: 10
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Stream el video
        videoResponse.data.pipe(res);
        
        videoResponse.data.on('end', () => {
            console.log('✅ Descarga completada');
        });
        
        videoResponse.data.on('error', (err) => {
            console.error('❌ Error en stream:', err.message);
        });
        
    } catch (error) {
        console.error('❌ Error completo:', error.message);
        
        let errorMessage = 'No se pudo descargar el video.';
        let details = '';
        
        if (error.message === 'VIDEO_NOT_FOUND') {
            errorMessage = '⚠️ No se pudo encontrar el video en la página.';
            details = 'Esto puede ocurrir porque:\n\n1. El video es privado o requiere login\n2. El enlace no es válido\n3. Sora cambió su estructura\n\n💡 Solución: Asegúrate de que el video sea público y el enlace sea correcto.';
        } else if (error.response?.status === 403 || error.response?.status === 401) {
            errorMessage = '🔒 El video es privado o requiere autenticación.';
            details = 'Este video no es público. Solo puedes descargar videos públicos de Sora.';
        } else if (error.response?.status === 404) {
            errorMessage = '❌ Video no encontrado.';
            details = 'Verifica que el enlace sea correcto y el video aún exista.';
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            errorMessage = '⏱️ Tiempo de espera agotado.';
            details = 'El servidor tardó demasiado en responder. Intenta de nuevo.';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage,
            details: details
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '3.0',
        message: 'Servidor funcionando'
    });
});

// Info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Sora Video Downloader',
        version: '3.0',
        status: 'online',
        features: ['Descarga directa', 'Sin Puppeteer', 'Optimizado para Render']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`✨ Versión 3.0 - Optimizado`);
    console.log(`📝 Método: Extracción directa mejorada`);
});
