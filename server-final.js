const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('.'));

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-final.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '13.0-client-side',
        method: 'browser-authentication'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v13.0 - CLIENT SIDE');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('🔐 Método: Autenticación del navegador');
    console.log('✨ Descarga directa desde el cliente');
    console.log('⚡ Sin servidor intermedio');
    console.log('═══════════════════════════════════════');
});
