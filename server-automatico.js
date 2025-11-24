const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configuración de Puppeteer para Render
const getBrowserConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
        return {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-extensions'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
        };
    }
    
    return {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
};

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    
    if (!url || !url.includes('sora.chatgpt.com')) {
        return res.status(400).json({ 
            success: false,
            error: 'URL inválida. Debe ser de sora.chatgpt.com' 
        });
    }
    
    console.log('📥 Nueva solicitud:', url);
    
    let browser;
    
    try {
        console.log('🚀 Iniciando navegador...');
        browser = await puppeteer.launch(getBrowserConfig());
        
        const page = await browser.newPage();
        
        // Configurar como navegador real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Interceptar requests para capturar el video
        let videoUrl = null;
        
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
            const reqUrl = request.url();
            
            // Capturar URL del video
            if (reqUrl.includes('.mp4') || 
                reqUrl.includes('videos.openai.com') ||
                reqUrl.includes('blob.core.windows.net')) {
                
                if (!reqUrl.includes('thumbnail') && !reqUrl.includes('preview')) {
                    console.log('🎥 Video encontrado:', reqUrl.substring(0, 100));
                    videoUrl = reqUrl;
                }
            }
            
            request.continue();
        });
        
        console.log('📄 Navegando a la página...');
        
        // Navegar a la página
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        
        // Esperar a que cargue el contenido
        await page.waitForTimeout(3000);
        
        // Intentar extraer el video del HTML si no se capturó en las requests
        if (!videoUrl) {
            console.log('🔍 Extrayendo del HTML...');
            
            videoUrl = await page.evaluate(() => {
                // Buscar en el HTML
                const patterns = [
                    /https:\/\/videos\.openai\.com\/[^"'\s]+\.mp4/gi,
                    /https:\/\/[^"'\s]+\.blob\.core\.windows\.net\/[^"'\s]+\.mp4/gi
                ];
                
                const html = document.documentElement.innerHTML;
                
                for (const pattern of patterns) {
                    const match = html.match(pattern);
                    if (match && match[0]) {
                        return match[0].replace(/\\"/g, '').replace(/\\/g, '');
                    }
                }
                
                // Buscar en elementos video
                const videoElements = document.querySelectorAll('video');
                for (const video of videoElements) {
                    if (video.src && video.src.includes('.mp4')) {
                        return video.src;
                    }
                }
                
                return null;
            });
        }
        
        await browser.close();
        
        if (!videoUrl) {
            throw new Error('No se encontró el video. El video puede estar protegido o el enlace es incorrecto.');
        }
        
        console.log('✅ Video encontrado:', videoUrl.substring(0, 100));
        console.log('⬇️ Descargando...');
        
        // Descargar el video usando fetch con puppeteer
        const axios = require('axios');
        
        const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://sora.chatgpt.com/',
                'Origin': 'https://sora.chatgpt.com'
            },
            timeout: 300000,
            maxRedirects: 10
        });
        
        const contentType = videoResponse.headers['content-type'] || 'video/mp4';
        const contentLength = videoResponse.headers['content-length'];
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="sora-video-${Date.now()}.mp4"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
            console.log('📦 Tamaño:', (contentLength / 1024 / 1024).toFixed(2), 'MB');
        }
        
        videoResponse.data.pipe(res);
        
        videoResponse.data.on('end', () => {
            console.log('✅ Descarga completada');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (browser) {
            await browser.close();
        }
        
        if (res.headersSent) return;
        
        let errorMessage = 'No se pudo descargar el video.';
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. El servidor puede estar sobrecargado. Intenta de nuevo.';
        } else if (error.message.includes('encontró')) {
            errorMessage = error.message;
        } else {
            errorMessage = 'Error al procesar el video. Verifica que el enlace sea correcto.';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '11.0-auto',
        method: 'puppeteer-automation'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v11.0 - AUTOMÁTICO');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('🤖 Método: Puppeteer (navegador real)');
    console.log('✨ 100% automático - solo pegar link');
    console.log('═══════════════════════════════════════');
});
