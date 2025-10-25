# 📻 Simulador de Radio MEDEVAC - Guía de Uso y Deployment

## 🚀 Inicio Rápido

### Opción 1: Ejecutar Localmente
El simulador es 100% HTML/CSS/JavaScript, sin dependencias. Simplemente abre el archivo:

```bash
# Abre en tu navegador
open index.html
# O en Linux
xdg-open index.html
# O inicia un servidor local
python3 -m http.server 8000
# Luego accede a: http://localhost:8000
```

### Opción 2: Servir con Servidor Local (Recomendado)

#### Python 3
```bash
cd /ruta/a/web
python3 -m http.server 8000
# Accede a http://localhost:8000
```

#### Node.js (con http-server)
```bash
npm install -g http-server
cd /ruta/a/web
http-server
# Accede a http://localhost:8080
```

#### Node.js (con Express)
```bash
npm init -y
npm install express
# Crea server.js con el contenido de abajo
node server.js
```

**server.js:**
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

app.listen(3000, () => {
    console.log('📻 Simulador MEDEVAC en http://localhost:3000');
});
```

---

## 🌐 Publicar en Internet (Para Entrenamiento en Equipo)

### Opción A: Cloudflare Pages (⭐⭐ Súper Recomendado)

**[📖 Guía completa de deployment en Cloudflare](../CLOUDFLARE-DEPLOYMENT.md)**

**¿Por qué Cloudflare Pages?**
- ✅ CDN global ultra rápido
- ✅ SSL automático (HTTPS)
- ✅ Dominios personalizados gratis
- ✅ Builds automáticos desde GitHub
- ✅ Hosting ilimitado

**Pasos rápidos:**

1. **Ve a Cloudflare Pages:**
   - Abre [dash.cloudflare.com](https://dash.cloudflare.com)
   - Crea cuenta gratis (solo email, sin tarjeta)
   
2. **Conecta GitHub:**
   - Click en **"Pages"** → **"Create a project"**
   - Selecciona **"Connect to Git"**
   - Conecta el repo: `Valtrido88/RADIO-SIMULADOR`

3. **Configura el build:**
   ```
   Project name: radio-simulador-medevac
   Production branch: main
   Build command: (vacío)
   Build output directory: web
   ```

4. **Deploy:**
   - Click en **"Save and Deploy"**
   - Espera 1-2 minutos
   - ¡Listo! Tu simulador estará en:
     ```
     https://radio-simulador-medevac.pages.dev
     ```

5. **Dominio personalizado (opcional):**
   - Si quieres `www.medevacsimulator.es` o similar
   - Ve a **Custom domains** en tu proyecto
   - Agrega tu dominio
   - Cloudflare lo configura automáticamente

**Ver [guía completa con screenshots](../CLOUDFLARE-DEPLOYMENT.md)**

---

### Opción B: GitHub Pages (Gratis ⭐ Clásico)

1. **Sube a GitHub:**
   ```bash
   cd /ruta/a/RADIO-SIMULADOR
   git add .
   git commit -m "Agregar simulador web"
   git push origin main
   ```

2. **Activa GitHub Pages en tu repo:**
   - Ve a **Settings → Pages**
   - Selecciona **Source: main branch → /web folder** (o `/root`)
   - Guarda
   - En 2-3 minutos estará disponible en:
     ```
     https://Valtrido88.github.io/RADIO-SIMULADOR/web/
     ```

3. **Comparte el link con tus compañeros:**
   ```
   https://Valtrido88.github.io/RADIO-SIMULADOR/web/
   ```

### Opción C: Vercel (Gratis)

1. **Conecta tu repo a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Haz login con GitHub
   - Importa el repo `RADIO-SIMULADOR`
   - Vercel auto-detectará y deployará
   - Tu sitio estará en: `https://tu-proyecto.vercel.app`

2. **Configuración (vercel.json en raíz):**
   ```json
   {
     "buildCommand": "",
     "outputDirectory": "web"
   }
   ```

### Opción D: Netlify (Gratis)

1. **Conecta tu repo:**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta con GitHub
   - Selecciona `RADIO-SIMULADOR`
   - Build command: vacío
   - Publish directory: `web`
   - Deploy

2. **Tu sitio estará disponible en:**
   ```
   https://tu-sitio-random.netlify.app
   ```

### Opción E: Replit (Gratis, Fácil)

1. **Ve a [replit.com](https://replit.com)**
2. **Crea nuevo REPL → "Import from GitHub"**
3. **Pega la URL:** `https://github.com/Valtrido88/RADIO-SIMULADOR`
4. **Ejecuta el servidor:**
   ```bash
   cd web
   python3 -m http.server 8000
   ```
5. **Comparte el link publico que genera Replit**

---

## 📋 Características del Simulador

### 🎛️ Controles Principales
- **Encendido/Apagado:** Toggle para activar la radio
- **Selector de Banda:** UHF, VHF, Militar
- **Frecuencia Ajustable:** Botones ±, input directo o presets
- **Canales Preestablecidos:** Emergencia (121.5), Tráfico, Unicom, Médico
- **Volumen:** Control deslizante 0-100
- **Squelch:** Silencio automático 0-10

### 📊 Indicadores
- **LED de Potencia:** Verde cuando está encendido
- **LED TX:** Rojo cuando transmite
- **LED RX:** Naranja cuando recibe
- **LED Squelch:** Verde cuando está activo
- **Medidor de Señal:** Barra animada 0-100%

### 💬 Comunicación
- **Texto a Transmitir:** Escribe tu mensaje en el área
- **Botón PTT:** Presiona para transmitir (botón rojo grande)
- **Historial:** Todas las comunicaciones se registran con timestamp
- **Respuestas Simuladas:** La "base" responde automáticamente

### 📖 Protocolos Incluidos
- Instrucciones de comunicación MEDEVAC
- Guías de frecuencias por banda
- Explicación de indicadores
- Ejemplos de transmisión correcta

---

## 👥 Entrenamiento para Equipo

### Para Entrenar a Compañeros:
1. **Publica el simulador en una de las opciones arriba**
2. **Comparte el URL público** (ej: GitHub Pages)
3. **Cada compañero accede desde su navegador:**
   - No requiere instalación
   - No requiere cuenta
   - Funciona en phone, tablet, escritorio
4. **Entrena:**
   - Cambiar bandas y frecuencias
   - Practicar protocolos
   - Ver historial de comunicaciones
   - Familiarizarse con interfaz

### Sugerencias de Ejercicio:
```
Ejercicio 1: Cambio de Frecuencias
- Enciende radio
- Cambia a UHF, VHF, Militar
- Ajusta frecuencias con los botones
- Usa presets

Ejercicio 2: Protocolo de Transmisión
- Escribe: "Base, aquí Heli Uno con paciente crítico"
- Transmite (PTT)
- Observa respuesta simulada

Ejercicio 3: Manejo de Squelch
- Ajusta squelch de 0 a 10
- Nota cómo cambia el indicador

Ejercicio 4: Emergencia
- Presiona preset "Emergencia" (121.5 MHz)
- Transmite una situación de emergencia
- Aprende el protocolo
```

---

## 🛠️ Archivos del Proyecto

```
web/
├── index.html       # Interfaz HTML (estructura)
├── style.css        # Estilos (diseño realista)
├── app.js           # Lógica (interacción + simulación)
└── README.md        # Esta documentación
```

**Tamaño Total:** ~50 KB (muy ligero, carga al instante)

---

## 🔧 Troubleshooting

### "No se carga"
- Verifica que todos los archivos estén en la carpeta `web/`
- Intenta recargar (Ctrl+F5 o Cmd+Shift+R)
- Abre consola del navegador (F12) para ver errores

### "No funciona el audio"
- El sonido de beep es opcional, el simulador funciona sin él
- Algunos navegadores requieren interacción antes de reproducir audio
- Intenta hacer clic primero en la página

### "Los presets no sintonizaban"
- Asegúrate de que la radio esté encendida
- Verifica que el preset esté dentro del rango de la banda actual

### "¿Cómo lo hago móvil-friendly?"
- Ya es responsive (funciona en phone)
- El botón PTT se puede usar con toque
- Interfaz adapta a pantalla pequeña

---

## 📞 Soporte

Para problemas o mejoras:
1. Abre un **Issue** en GitHub
2. Incluye: navegador, sistema operativo, capturas
3. Describe qué esperabas vs qué pasó

---

## 📝 Versión

**Simulador de Radio MEDEVAC v1.0**
- HTML5 + CSS3 + Vanilla JavaScript
- Sin dependencias externas
- Compatible: Chrome, Firefox, Safari, Edge (últimas versiones)
- Responsive: Desktop, Tablet, Mobile

---

## 🎓 Notas Educativas

Este simulador está diseñado para:
- ✅ Aprender protocolos de radio
- ✅ Practicar comunicación MEDEVAC
- ✅ Familiarizarse con interfaz de radio
- ✅ Entrenamiento en equipo remoto

**No es un simulador médico ni de emergencias reales. Es solo para familiarización con comunicaciones.**

---

¡Que disfrutes entrenando! 🚁📻
