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
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const html = response.data;
        
        // Buscar URLs de video
        const videoMatch = html.match(/https?:\/\/videos\.openai\.com[^\s"'<>]+/i) ||
                          html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/i);
        
        if (!videoMatch) {
            throw new Error('No se encontró el video');
        }
        
        const videoUrl = videoMatch[0];
        console.log('✅ Video encontrado');
        
        const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 120000
        });
        
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        
        videoResponse.data.pipe(res);
        console.log('✅ Descarga iniciada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'No se pudo descargar el video. Verifica que el enlace sea correcto.'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
