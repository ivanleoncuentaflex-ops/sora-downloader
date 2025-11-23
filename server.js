const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Sirve archivos estáticos (HTML, CSS, JS)

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para obtener información del video
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL es requerida' 
            });
        }

        // Validar que sea una URL de Sora
        if (!isValidSoraUrl(url)) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL de Sora no válida' 
            });
        }

        // Extraer información del video
        const videoInfo = await extractVideoInfo(url);

        res.json({
            success: true,
            data: videoInfo
        });

    } catch (error) {
        console.error('Error al obtener info del video:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Endpoint para descargar el video
app.post('/api/download', async (req, res) => {
    try {
        const { url, cookies } = req.body;

        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL es requerida' 
            });
        }

        if (!isValidSoraUrl(url)) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL de Sora no válida' 
            });
        }

        // Obtener el video
        const videoData = await downloadVideo(url, cookies);

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        
        // Enviar el video
        videoData.pipe(res);

    } catch (error) {
        console.error('Error al descargar video:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Funciones auxiliares
function isValidSoraUrl(url) {
    try {
        const urlObj = new URL(url);
        // Ajusta esto según el dominio real de Sora
        return urlObj.hostname.includes('sora') || 
               urlObj.hostname.includes('openai.com');
    } catch {
        return false;
    }
}

async function extractVideoInfo(url, cookies = null) {
    let browser;
    try {
        console.log('🔍 Extrayendo video de:', url);
        
        // Lanzar navegador headless
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        
        const page = await browser.newPage();
        
        // Si hay cookies, agregarlas
        if (cookies) {
            console.log('🍪 Agregando cookies de sesión...');
            await page.setCookie(...cookies);
        }
        
        // Interceptar requests de video
        const videoUrls = [];
        await page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            
            // Capturar URLs de video
            if (contentType.includes('video') || url.includes('.mp4') || url.includes('.webm') || url.includes('video')) {
                console.log('📹 Video detectado:', url);
                videoUrls.push(url);
            }
        });
        
        // Navegar a la página
        console.log('🌐 Cargando página...');
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 60000 
        });
        
        // Esperar más tiempo para que cargue el video
        console.log('⏳ Esperando que cargue el video...');
        await page.waitForTimeout(5000);
        
        // Intentar hacer scroll para activar lazy loading
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(2000);
        
        // Buscar elementos de video en la página
        const videoData = await page.evaluate(() => {
            const videos = [];
            
            // Buscar tags <video>
            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                if (video.src) videos.push(video.src);
                if (video.currentSrc) videos.push(video.currentSrc);
                const sources = video.querySelectorAll('source');
                sources.forEach(source => {
                    if (source.src) videos.push(source.src);
                });
            });
            
            // Buscar en el DOM por URLs de video
            const bodyText = document.body.innerHTML;
            const patterns = [
                /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi,
                /https?:\/\/[^\s"'<>]+\.webm[^\s"'<>]*/gi,
                /"videoUrl":\s*"([^"]+)"/gi,
                /"url":\s*"([^"]+\.mp4[^"]*)"/gi
            ];
            
            patterns.forEach(pattern => {
                const matches = bodyText.match(pattern);
                if (matches) videos.push(...matches);
            });
            
            return {
                videos: videos,
                title: document.title,
                html: document.body.innerHTML.substring(0, 1000)
            };
        });
        
        console.log('📊 Videos encontrados en DOM:', videoData.videos.length);
        console.log('📊 Videos interceptados:', videoUrls.length);
        console.log('📄 HTML preview:', videoData.html.substring(0, 200));
        
        // Combinar todas las URLs encontradas
        const allVideoUrls = [...new Set([...videoData.videos, ...videoUrls])];
        
        if (allVideoUrls.length > 0) {
            const videoUrl = allVideoUrls[0];
            console.log('✅ Video seleccionado:', videoUrl);
            
            return {
                title: videoData.title || 'Video de Sora',
                videoUrl: videoUrl,
                thumbnail: null
            };
        }
        
        throw new Error('No se encontró ningún video. La página requiere que inicies sesión en ChatGPT primero.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw new Error(`Error al extraer video: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function downloadVideo(url, cookies = null) {
    try {
        // Primero obtener la info del video
        const videoInfo = await extractVideoInfo(url, cookies);
        
        // Descargar el video
        const response = await axios({
            method: 'GET',
            url: videoInfo.videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        return response.data;

    } catch (error) {
        throw new Error(`Error al descargar video: ${error.message}`);
    }
}

function extractTitle(html) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'Video de Sora';
}

function extractThumbnail(html) {
    const thumbMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    return thumbMatch ? thumbMatch[1] : null;
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Archivos estáticos servidos desde: ${__dirname}`);
});
