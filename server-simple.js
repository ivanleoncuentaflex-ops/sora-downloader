const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
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

// Función para extraer video con Puppeteer (sin autenticación)
async function extractVideoWithPuppeteer(url) {
    let browser;
    try {
        console.log('🔍 Extrayendo video de:', url);
        
        const puppeteerOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ]
        };
        
        // En producción, buscar Chrome en múltiples ubicaciones
        if (process.env.NODE_ENV === 'production') {
            const possiblePaths = [
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
                '/usr/bin/google-chrome',
                process.env.PUPPETEER_EXECUTABLE_PATH
            ];
            
            for (const path of possiblePaths) {
                if (path) {
                    puppeteerOptions.executablePath = path;
                    break;
                }
            }
        }
        
        browser = await puppeteer.launch(puppeteerOptions);
        
        const page = await browser.newPage();
        
        // Configurar user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Interceptar requests de video
        const videoUrls = [];
        page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            
            if (contentType.includes('video') || 
                url.includes('.mp4') || 
                url.includes('.webm') ||
                url.includes('video') ||
                url.includes('blob:')) {
                console.log('📹 Video detectado:', url);
                videoUrls.push(url);
            }
        });
        
        // Navegar a la página
        console.log('🌐 Cargando página...');
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        // Esperar que cargue
        await page.waitForTimeout(8000);
        
        // Hacer scroll
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(3000);
        
        // Buscar videos en el DOM
        const videoData = await page.evaluate(() => {
            const videos = [];
            const videoElements = document.querySelectorAll('video');
            
            videoElements.forEach(video => {
                if (video.src && !video.src.startsWith('blob:')) videos.push(video.src);
                if (video.currentSrc && !video.currentSrc.startsWith('blob:')) videos.push(video.currentSrc);
                
                const sources = video.querySelectorAll('source');
                sources.forEach(source => {
                    if (source.src && !source.src.startsWith('blob:')) videos.push(source.src);
                });
            });
            
            // Buscar en scripts y JSON
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                const text = script.textContent;
                const mp4Matches = text.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/gi);
                if (mp4Matches) videos.push(...mp4Matches);
                
                const videoUrlMatches = text.match(/"videoUrl":\s*"([^"]+)"/gi);
                if (videoUrlMatches) {
                    videoUrlMatches.forEach(match => {
                        const url = match.match(/"([^"]+)"/)[1];
                        videos.push(url);
                    });
                }
            });
            
            return videos;
        });
        
        console.log('📊 Videos en DOM:', videoData.length);
        console.log('📊 Videos interceptados:', videoUrls.length);
        
        const allVideos = [...new Set([...videoData, ...videoUrls])];
        
        if (allVideos.length > 0) {
            // Filtrar y seleccionar el mejor video
            const validVideos = allVideos.filter(v => 
                v && 
                !v.startsWith('blob:') && 
                !v.startsWith('data:') &&
                (v.includes('.mp4') || v.includes('video'))
            );
            
            if (validVideos.length > 0) {
                console.log('✅ Video encontrado:', validVideos[0]);
                return validVideos[0];
            }
        }
        
        throw new Error('No se encontró el video. El video puede ser privado o requerir autenticación.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
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
        const videoUrl = await extractVideoWithPuppeteer(url);
        
        // Descargar el video
        console.log('⬇️ Descargando video...');
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://sora.chatgpt.com/'
            },
            timeout: 120000
        });
        
        // Configurar headers
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        
        // Enviar el stream
        response.data.pipe(res);
        
        console.log('✅ Descarga iniciada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        res.status(500).json({ 
            success: false,
            error: 'No se pudo descargar el video. Asegúrate de que el enlace sea correcto y el video sea público.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('✨ Listo para descargar videos de Sora');
});
