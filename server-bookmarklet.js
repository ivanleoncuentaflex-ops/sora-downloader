const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('.'));

// Servir la página del bookmarklet
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'bookmarklet-final.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '15.0-bookmarklet',
        method: 'client-side-bookmarklet'
    });
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Sora Downloader v15.0 - BOOKMARKLET');
    console.log(`📡 Puerto: ${PORT}`);
    console.log('📌 Método: Bookmarklet (cliente)');
    console.log('✨ La única solución que funciona');
    console.log('🎯 Los usuarios arrastran el bookmarklet');
    console.log('═══════════════════════════════════════');
});
