# 🚀 Desplegar Descargador Automático en Render

## ✅ Pasos para Desplegar

### 1. Preparar el Código

El código ya está listo con:
- ✅ `server-automatico.js` - Servidor con Puppeteer
- ✅ `package.json` - Configurado con puppeteer
- ✅ `render.yaml` - Configuración para Render
- ✅ `index.html` - Interfaz automática

### 2. Subir a GitHub

```bash
git add .
git commit -m "Versión automática con Puppeteer"
git push origin main
```

### 3. Desplegar en Render.com

1. Ve a [render.com](https://render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente `render.yaml`
5. Click en "Create Web Service"

### 4. Configuración Automática

Render configurará automáticamente:
- ✅ Node.js environment
- ✅ Instalación de Chromium para Puppeteer
- ✅ Puerto 10000
- ✅ Variables de entorno

### 5. Esperar el Deploy

- El primer deploy toma 5-10 minutos
- Render instalará Chromium automáticamente
- Una vez completado, tu URL estará lista

### 6. Probar

1. Abre tu URL de Render: `https://tu-app.onrender.com`
2. Pega un enlace de Sora
3. Click en "Descargar Video"
4. Espera 20-40 segundos
5. ¡El video se descargará!

## 🔧 Configuración de Render

### Variables de Entorno (ya configuradas en render.yaml):

```yaml
NODE_ENV: production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: false
PUPPETEER_EXECUTABLE_PATH: /usr/bin/chromium-browser
```

### Recursos Recomendados:

- **Plan**: Free (suficiente para empezar)
- **RAM**: 512 MB mínimo
- **CPU**: Compartido está bien

## ⚡ Ventajas de Esta Solución

1. **100% Automático**: El usuario solo pega el link
2. **Sin configuración**: No requiere tokens ni autenticación
3. **Bypasea Cloudflare**: Puppeteer simula un navegador real
4. **Fácil de mantener**: Un solo archivo de servidor

## 🐛 Solución de Problemas

### Error: "Chromium not found"
- Render instala Chromium automáticamente
- Verifica que `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` sea `false`

### Error: "Timeout"
- El video puede ser muy grande
- Aumenta el timeout en el código si es necesario

### Error: "No se encontró el video"
- El enlace puede ser incorrecto
- Algunos videos muy privados no son accesibles

## 📊 Rendimiento

- **Tiempo de descarga**: 20-40 segundos
- **Uso de RAM**: ~200-300 MB por request
- **Concurrencia**: 2-3 requests simultáneos en plan Free

## 🎯 Próximos Pasos

Una vez desplegado:
1. Comparte tu URL con usuarios
2. Monitorea el uso en Render dashboard
3. Considera upgrade si tienes mucho tráfico

## 💡 Tips

- El plan Free de Render duerme después de 15 min de inactividad
- El primer request después de dormir toma ~30 segundos extra
- Considera plan Starter ($7/mes) para mantenerlo siempre activo

## 🔗 URLs Útiles

- Dashboard de Render: https://dashboard.render.com
- Logs en tiempo real: En tu servicio → "Logs"
- Métricas: En tu servicio → "Metrics"
