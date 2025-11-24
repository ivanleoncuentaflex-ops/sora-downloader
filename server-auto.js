const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('.'));

// Headers para permitir iframe de Sora
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-src 'self' https://sora.chatgpt.com https://*.openai.com");
    next();
});

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-auto.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '14.0-auto-cloudflare',
        method: 'iframe-auto-verification'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v14.0 - AUTO CLOUDFLARE');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('🔐 Verificación automática al entrar');
    console.log('✨ Iframe de Sora para pasar Cloudflare');
    console.log('⚡ Listo en 5-10 segundos');
    console.log('═══════════════════════════════════════');
});
