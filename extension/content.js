// Agregar botón de descarga en la página de Sora
function addDownloadButton() {
    // Evitar duplicados
    if (document.getElementById('sora-download-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'sora-download-btn';
    button.textContent = '⬇️ Descargar Video';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: transform 0.2s;
    `;
    
    button.onmouseover = () => button.style.transform = 'scale(1.05)';
    button.onmouseout = () => button.style.transform = 'scale(1)';
    
    button.onclick = async () => {
        button.textContent = '⏳ Buscando...';
        button.disabled = true;
        
        try {
            const videoUrl = extractVideoUrl();
            
            if (!videoUrl) {
                alert('No se encontró el video. Espera a que cargue completamente.');
                return;
            }
            
            // Crear link temporal para descargar
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `sora-video-${Date.now()}.mp4`;
            a.click();
            
            button.textContent = '✅ ¡Descargado!';
            setTimeout(() => {
                button.textContent = '⬇️ Descargar Video';
            }, 2000);
            
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            button.disabled = false;
        }
    };
    
    document.body.appendChild(button);
}

function extractVideoUrl() {
    const videos = document.querySelectorAll('video');
    
    for (const video of videos) {
        if (video.src) return video.src;
        if (video.currentSrc) return video.currentSrc;
        
        const sources = video.querySelectorAll('source');
        for (const source of sources) {
            if (source.src) return source.src;
        }
    }
    
    return null;
}

// Esperar a que la página cargue
setTimeout(addDownloadButton, 2000);

// Observar cambios en el DOM por si la página es SPA
const observer = new MutationObserver(() => {
    if (!document.getElementById('sora-download-btn')) {
        addDownloadButton();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
