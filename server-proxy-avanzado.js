const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('.'));

// Cache de sesión de navegador
let browserInstance = null;
let browserPage = null;

// Configuración de Puppeteer optimizada
const getBrowserConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-web-security',
            '--disable-features=BlockInsecurePrivateNetworkRequests'
        ],
        executablePath: isProduction ? (process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser') : undefined
    };
};

// Inicializar navegador al arrancar
async function initBrowser() {
    try {
        console.log('🚀 Iniciando navegador persistente...');
        browserInstance = await puppeteer.launch(getBrowserConfig());
        browserPage = await browserInstance.newPage();
        
        // Configurar como navegador real
        await browserPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await browserPage.setViewport({ width: 1920, height: 1080 });
        
        // Ocultar que es un bot - MUY IMPORTANTE para pasar Cloudflare
        await browserPage.evaluateOnNewDocument(() => {
            // Ocultar webdriver
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            
            // Simular plugins
            Object.defineProperty(navigator, 'plugins', { 
                get: () => [1, 2, 3, 4, 5] 
            });
            
            // Idiomas
            Object.defineProperty(navigator, 'languages', { 
                get: () => ['en-US', 'en', 'es'] 
            });
            
            // Chrome específico
            window.chrome = {
                runtime: {}
            };
            
            // Permisos
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });
        
        // Pre-cargar Sora para establecer sesión y pasar Cloudflare
        console.log('🔐 Pre-cargando Sora y pasando Cloudflare...');
        
        await browserPage.goto('https://sora.chatgpt.com', {
            waitUntil: 'domcontentloaded',
            timeout: 90000
        });
        
        // Esperar a que Cloudflare termine (detectar cuando desaparece el challenge)
        console.log('⏳ Esperando a que Cloudflare termine...');
        
        try {
            // Esperar hasta que NO haya elementos de Cloudflare challenge
            await browserPage.waitForFunction(() => {
                const body = document.body.innerHTML;
                // Si no contiene textos típicos de Cloudflare, asumimos que pasó
                return !body.includes('Checking your browser') && 
                       !body.includes('Just a moment') &&
                       !body.includes('cf-challenge') &&
                       !body.includes('cf_chl') &&
                       document.readyState === 'complete';
            }, { timeout: 30000 });
            
            console.log('✅ Cloudflare challenge completado');
        } catch (error) {
            console.log('⚠️ Timeout esperando Cloudflare, continuando...');
        }
        
        // Esperar extra para asegurar que todo cargó
        await browserPage.waitForTimeout(5000);
        
        // Verificar que la página cargó correctamente
        const pageContent = await browserPage.content();
        if (pageContent.length > 10000) {
            console.log('✅ Navegador listo y Cloudflare pasado');
        } else {
            console.log('⚠️ Página puede no haber cargado completamente');
        }
    } catch (error) {
        console.error('❌ Error iniciando navegador:', error.message);
    }
}

// Mantener el navegador vivo
setInterval(async () => {
    if (browserPage) {
        try {
            await browserPage.evaluate(() => Date.now());
        } catch (error) {
            console.log('🔄 Reiniciando navegador...');
            await initBrowser();
        }
    }
}, 60000); // Cada minuto

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-savesora-style.html'));
});

// Endpoint para previsualización
app.post('/api/preview', async (req, res) => {
    const { url, cookies } = req.body;
    
    if (!url || !url.includes('sora.chatgpt.com')) {
        return res.status(400).json({ 
            success: false,
            error: 'URL inválida' 
        });
    }
    
    console.log('👁️ Solicitud de previsualización:', url);
    
    try {
        if (!browserPage) {
            await initBrowser();
        }
        
        // Si el usuario proporcionó cookies, usarlas
        if (cookies) {
            console.log('🍪 Usando cookies del usuario');
            await browserPage.setCookie({
                name: '__Secure-next-auth.session-token',
                value: cookies,
                domain: '.chatgpt.com',
                path: '/',
                secure: true,
                httpOnly: true
            });
        }
        
        await browserPage.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        
        await browserPage.waitForTimeout(3000);
        
        const videoUrl = await browserPage.evaluate(() => {
            const html = document.documentElement.innerHTML;
            const patterns = [
                /https:\/\/videos\.openai\.com\/[^"'\s]+\.mp4/gi,
                /https:\/\/[^"'\s]+\.blob\.core\.windows\.net\/[^"'\s]+\.mp4/gi
            ];
            
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[0]) {
                    return match[0].replace(/\\"/g, '').replace(/\\/g, '');
                }
            }
            
            const videos = document.querySelectorAll('video');
            for (const video of videos) {
                if (video.src && video.src.includes('.mp4')) {
                    return video.src;
                }
            }
            
            return null;
        });
        
        if (!videoUrl) {
            throw new Error('No se encontró el video');
        }
        
        console.log('✅ Video encontrado para previsualización');
        
        res.json({
            success: true,
            videoUrl: videoUrl
        });
        
    } catch (error) {
        console.error('❌ Error en previsualización:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    
    if (!url || !url.includes('sora.chatgpt.com')) {
        return res.status(400).json({ 
            success: false,
            error: 'URL inválida. Debe ser de sora.chatgpt.com' 
        });
    }
    
    console.log('📥 Nueva solicitud:', url);
    
    try {
        // Asegurar que el navegador esté listo
        if (!browserPage) {
            await initBrowser();
        }
        
        console.log('🔍 Navegando al video...');
        
        // Navegar al video
        await browserPage.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
        
        // Esperar a que Cloudflare termine si aparece
        console.log('🔐 Verificando Cloudflare...');
        try {
            await browserPage.waitForFunction(() => {
                const body = document.body.innerHTML;
                return !body.includes('Checking your browser') && 
                       !body.includes('Just a moment') &&
                       !body.includes('cf-challenge') &&
                       document.readyState === 'complete';
            }, { timeout: 15000 });
            console.log('✅ Cloudflare OK');
        } catch (error) {
            console.log('⚠️ Continuando sin esperar Cloudflare');
        }
        
        // Esperar a que cargue el contenido
        await browserPage.waitForTimeout(5000);
        
        console.log('🎥 Extrayendo URL del video...');
        
        // Extraer URL del video
        const videoUrl = await browserPage.evaluate(() => {
            const html = document.documentElement.innerHTML;
            
            // Patrones para encontrar el video
            const patterns = [
                /https:\/\/videos\.openai\.com\/[^"'\s]+\.mp4/gi,
                /https:\/\/[^"'\s]+\.blob\.core\.windows\.net\/[^"'\s]+\.mp4/gi
            ];
            
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[0]) {
                    return match[0].replace(/\\"/g, '').replace(/\\/g, '');
                }
            }
            
            // Buscar en elementos video
            const videos = document.querySelectorAll('video');
            for (const video of videos) {
                if (video.src && video.src.includes('.mp4')) {
                    return video.src;
                }
            }
            
            return null;
        });
        
        if (!videoUrl) {
            throw new Error('No se encontró el video. El enlace puede ser incorrecto o el video no está disponible públicamente.');
        }
        
        console.log('✅ Video encontrado:', videoUrl.substring(0, 100) + '...');
        console.log('⬇️ Descargando video...');
        
        // Obtener cookies del navegador para la descarga
        const cookies = await browserPage.cookies();
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        
        // Descargar el video con las cookies del navegador
        const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://sora.chatgpt.com/',
                'Origin': 'https://sora.chatgpt.com',
                'Cookie': cookieString
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
        
        videoResponse.data.on('error', (err) => {
            console.error('❌ Error en stream:', err.message);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (res.headersSent) return;
        
        let errorMessage = 'No se pudo descargar el video.';
        let statusCode = 500;
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Intenta de nuevo.';
            statusCode = 408;
        } else if (error.message.includes('encontró')) {
            errorMessage = error.message;
            statusCode = 404;
        } else if (error.message.includes('Navigation')) {
            errorMessage = 'No se pudo acceder a la página. Verifica el enlace.';
            statusCode = 400;
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
        version: '16.0-proxy-avanzado',
        method: 'puppeteer-persistent-session',
        browserReady: !!browserPage
    });
});

// Iniciar navegador al arrancar el servidor
initBrowser();

// Limpiar al cerrar
process.on('SIGINT', async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
    process.exit();
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v16.0 - PROXY AVANZADO');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('🤖 Navegador persistente con sesión');
    console.log('🔐 Cookies compartidas para descarga');
    console.log('✨ Solo pegar link y descargar');
    console.log('═══════════════════════════════════════');
});
