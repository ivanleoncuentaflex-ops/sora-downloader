const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configuración de Puppeteer
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
                '--disable-blink-features=AutomationControlled'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
        };
    }
    
    return {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
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
        console.log('🚀 Iniciando navegador para pasar Cloudflare...');
        browser = await puppeteer.launch(getBrowserConfig());
        
        const page = await browser.newPage();
        
        // Configurar como navegador real para pasar Cloudflare
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Ocultar que es un bot
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });
        
        console.log('🔐 Pasando verificación de Cloudflare...');
        
        // Navegar y esperar a que pase Cloudflare
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        
        // Esperar a que cargue completamente (Cloudflare puede tardar unos segundos)
        await page.waitForTimeout(5000);
        
        console.log('✅ Cloudflare pasado, extrayendo video...');
        
        // Extraer el HTML después de pasar Cloudflare
        const html = await page.content();
        
        // Extraer URL del video
        const videoUrl = await page.evaluate(() => {
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
            
            // Buscar en el HTML con regex más agresivo
            const mp4Match = html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi);
            if (mp4Match && mp4Match[0]) {
                return mp4Match[0].replace(/\\"/g, '').replace(/\\/g, '');
            }
            
            return null;
        });
        
        await browser.close();
        
        if (!videoUrl) {
            throw new Error('No se encontró el video. Verifica que el enlace sea correcto.');
        }
        
        console.log('🎥 Video encontrado:', videoUrl.substring(0, 100) + '...');
        console.log('⬇️ Descargando video...');
        
        // Descargar el video
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
            console.log('✅ Descarga completada exitosamente');
        });
        
        videoResponse.data.on('error', (err) => {
            console.error('❌ Error en stream:', err.message);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (browser) {
            await browser.close();
        }
        
        if (res.headersSent) return;
        
        let errorMessage = 'No se pudo descargar el video.';
        let statusCode = 500;
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Cloudflare puede estar bloqueando. Intenta de nuevo.';
            statusCode = 408;
        } else if (error.message.includes('encontró')) {
            errorMessage = error.message;
            statusCode = 404;
        } else if (error.message.includes('Navigation')) {
            errorMessage = 'No se pudo acceder a la página. Verifica el enlace.';
            statusCode = 400;
        } else {
            errorMessage = 'Error al procesar el video. Intenta de nuevo en unos segundos.';
        }
        
        res.status(statusCode).json({ 
            success: false,
            error: errorMessage
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '12.0-cloudflare',
        method: 'puppeteer-cloudflare-bypass'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v12.0 - CLOUDFLARE BYPASS');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('🔐 Método: Puppeteer + Cloudflare Bypass');
    console.log('✨ Pasa verificación automáticamente');
    console.log('⚡ Más rápido y confiable');
    console.log('═══════════════════════════════════════');
});
