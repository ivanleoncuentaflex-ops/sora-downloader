// Script que se ejecuta en sora.chatgpt.com
console.log('🎥 Sora Video Downloader activado');

// Buscar el video en la página
function findVideoUrl() {
    // Buscar en el HTML
    const html = document.documentElement.innerHTML;
    
    const patterns = [
        /https:\/\/videos\.openai\.com\/[a-zA-Z0-9\-_\/\.%\?&=]+\.mp4/gi,
        /https:\/\/[a-zA-Z0-9\-]+\.blob\.core\.windows\.net\/[^"'\s]+\.mp4/gi
    ];
    
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
        // Buscar en source
        const sources = video.querySelectorAll('source');
        for (const source of sources) {
            if (source.src && source.src.includes('.mp4')) {
                return source.src;
            }
        }
    }
    
    return null;
}

// Agregar botón de descarga
function addDownloadButton() {
    // Verificar si ya existe
    if (document.getElementById('sora-download-btn')) return;
    
    const videoUrl = findVideoUrl();
    if (!videoUrl) {
        console.log('No se encontró video en esta página');
        return;
    }
    
    console.log('✅ Video encontrado:', videoUrl);
    
    // Crear botón flotante
    const button = document.createElement('button');
    button.id = 'sora-download-btn';
    button.innerHTML = '⬇️ Descargar Video';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        padding: 15px 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: transform 0.2s;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'translateY(-2px)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'translateY(0)';
    };
    
    button.onclick = async () => {
        button.innerHTML = '⏳ Descargando...';
        button.disabled = true;
        
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sora-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            button.innerHTML = '✅ Descargado!';
            setTimeout(() => {
                button.innerHTML = '⬇️ Descargar Video';
                button.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            button.innerHTML = '❌ Error';
            setTimeout(() => {
                button.innerHTML = '⬇️ Descargar Video';
                button.disabled = false;
            }, 2000);
        }
    };
    
    document.body.appendChild(button);
}

// Ejecutar cuando la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addDownloadButton, 2000);
    });
} else {
    setTimeout(addDownloadButton, 2000);
}

// Observar cambios en la página (para SPAs)
const observer = new MutationObserver(() => {
    if (!document.getElementById('sora-download-btn')) {
        setTimeout(addDownloadButton, 1000);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
