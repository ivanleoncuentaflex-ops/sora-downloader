document.getElementById('downloadBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const btn = document.getElementById('downloadBtn');
    
    btn.disabled = true;
    btn.textContent = 'Buscando video...';
    
    try {
        // Obtener la pestaña activa
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes('sora.chatgpt.com')) {
            throw new Error('Debes estar en una página de Sora');
        }
        
        // Inyectar script para buscar el video
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractVideoUrl
        });
        
        const videoUrl = results[0].result;
        
        if (!videoUrl) {
            throw new Error('No se encontró el video en esta página');
        }
        
        // Descargar el video
        statusDiv.textContent = 'Descargando...';
        statusDiv.className = 'info';
        statusDiv.style.display = 'block';
        
        await chrome.downloads.download({
            url: videoUrl,
            filename: `sora-video-${Date.now()}.mp4`
        });
        
        statusDiv.textContent = '✅ ¡Descarga iniciada!';
        statusDiv.className = 'success';
        
    } catch (error) {
        statusDiv.textContent = '❌ ' + error.message;
        statusDiv.className = 'error';
        statusDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Descargar Video';
    }
});

function extractVideoUrl() {
    // Buscar elementos de video
    const videos = document.querySelectorAll('video');
    
    for (const video of videos) {
        if (video.src) return video.src;
        if (video.currentSrc) return video.currentSrc;
        
        const sources = video.querySelectorAll('source');
        for (const source of sources) {
            if (source.src) return source.src;
        }
    }
    
    // Buscar en el HTML
    const html = document.body.innerHTML;
    const mp4Match = html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/i);
    if (mp4Match) return mp4Match[0];
    
    return null;
}
