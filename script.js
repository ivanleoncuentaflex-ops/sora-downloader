document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('status');
    const videoPreview = document.getElementById('videoPreview');
    const previewContent = document.getElementById('previewContent');
    const serverStatus = document.getElementById('serverStatus');

    // Verificar estado del servidor
    checkServerStatus();

    downloadBtn.addEventListener('click', handleDownload);
    
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    async function handleDownload() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showStatus('Por favor, ingresa un enlace válido', 'error');
            return;
        }

        if (!isValidUrl(url)) {
            showStatus('El enlace no parece ser válido', 'error');
            return;
        }

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Procesando...';
        showStatus('Procesando tu solicitud...', 'info');
        
        try {
            // Aquí iría la lógica para descargar el video
            // Nota: Necesitarás un backend o API para manejar la descarga real
            await processDownload(url);
            
        } catch (error) {
            showStatus('Error al procesar el video: ' + error.message, 'error');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.textContent = 'Descargar Video';
        }
    }

    async function processDownload(url) {
        try {
            // Llamar al backend para descargar el video
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la descarga');
            }
            
            // Convertir la respuesta a blob
            const blob = await response.blob();
            
            // Crear URL temporal para descargar
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `sora-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            showStatus('¡Video descargado exitosamente! 🎉', 'success');
            
        } catch (error) {
            throw error;
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.classList.remove('hidden');
    }

    async function checkServerStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (serverStatus) {
                serverStatus.textContent = data.message;
                serverStatus.style.display = 'block';
                
                if (data.ytdlp === 'instalado') {
                    serverStatus.className = 'status success';
                } else {
                    serverStatus.className = 'status info';
                }
                
                // Ocultar después de 5 segundos
                setTimeout(() => {
                    serverStatus.style.display = 'none';
                }, 5000);
            }
        } catch (error) {
            console.log('No se pudo verificar el estado del servidor');
        }
    }
});
