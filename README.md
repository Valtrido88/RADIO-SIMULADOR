# 📻 RADIO-SIMULADOR
Simulador Interactivo de Radio MEDEVAC para Entrenamiento en Comunicaciones

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare)](./CLOUDFLARE-DEPLOYMENT.md)
[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy%20to-GitHub%20Pages-181717?style=flat&logo=github)](https://github.com/Valtrido88/RADIO-SIMULADOR/settings/pages)

## 🎯 ¿Qué es?

Un **simulador web educativo** realista pero simple para entrenar a equipos en comunicaciones por radio MEDEVAC. Sin instalación requerida, funciona en cualquier navegador moderno.

## 🚀 Acceso Rápido

### 👉 **[Abre el Simulador Aquí](./web/index.html)** ← Haz clic para empezar

O descarga el repositorio y abre `/web/index.html` en tu navegador.

### 🌐 Deployment Online
- **Cloudflare Pages** (recomendado): [Guía completa](./CLOUDFLARE-DEPLOYMENT.md) | [Quick Start](./QUICK-START-CLOUDFLARE.md)
- **GitHub Pages**: Configuración automática incluida
- **Dominio personalizado**: Soporta `www.medevacsimulator.es` u otros (ver guía)

## ✨ Características

- 🎛️ **Interfaz Realista**: Transceptor UHF/VHF tipo profesional
- 📊 **Indicadores Reales**: LEDs, medidor de señal, squelch
- 💬 **Protocolo MEDEVAC**: Guías y ejemplos de comunicación
- 🔊 **Efectos de Audio**: Beeps de transmisión simulados
- 📱 **Responsive**: Funciona en desktop, tablet y móvil
- 👥 **Entrenamiento en Equipo**: Publica online para que todos accedan
- 📜 **Historial**: Registro de todas las comunicaciones
- 🎓 **Tutorial Integrado**: Aprende mientras usas

## 🎮 Cómo Usar

### 1. **Enciende la Radio**
Marca el checkbox "Encendido"

### 2. **Selecciona Banda**
Elige UHF, VHF o Militar

### 3. **Ajusta Frecuencia**
- Usa botones ± o escribe directamente
- O presiona un preset (Emergencia, Tráfico, etc.)

### 4. **Transmite**
- Escribe tu mensaje
- Presiona el botón PTT (rojo grande)
- Observa la respuesta simulada

### 5. **Practica Protocolos**
Lee las guías incluidas y entrena comunicaciones reales

## 📁 Estructura

```
RADIO-SIMULADOR/
├── web/
│   ├── index.html      ← Abre esto en navegador
│   ├── style.css       ← Estilos
│   ├── app.js          ← Lógica
│   └── README.md       ← Guía detallada
└── README.md           ← Este archivo
```

## 🌐 Publicar para Entrenamiento en Equipo

### Opción 1: Cloudflare Pages (⭐ Recomendado - Más Rápido)
**[📖 Guía completa de deployment en Cloudflare](./CLOUDFLARE-DEPLOYMENT.md)**

Tu equipo accede desde: `https://radio-simulador-medevac.pages.dev`

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Create project → Connect GitHub
3. Selecciona: `Valtrido88/RADIO-SIMULADOR`
4. Build output: `web`
5. ¡Listo! + **Gratis + CDN Global + SSL automático**

### Opción 2: GitHub Pages
Tu equipo accede desde: `https://Valtrido88.github.io/RADIO-SIMULADOR/web/`

1. Sube cambios a GitHub
2. Ve a Settings → Pages
3. Selecciona `main branch → /web folder`
4. ¡Listo!

### Opción 3: Vercel / Netlify / Replit
Ver guía completa en `/web/README.md`

## 💻 Ejecutar Localmente

```bash
# Python 3
cd web
python3 -m http.server 8000
# Accede a http://localhost:8000

# O simplemente abre index.html en tu navegador
```

## 📚 Protocolos Incluidos

- ✅ Identificación y saludo
- ✅ Transmisión concisa (máx 15 seg)
- ✅ Cierre con "Cambio" o "Corto"
- ✅ Bandas de frecuencia (UHF, VHF, Militar)
- ✅ Emergencia internacional (121.5 MHz)

## 🎓 Para Entrenar a tu Equipo

1. **Abre el simulador** en tu navegador
2. **Comparte el URL** con tus compañeros
3. **Cada uno practica:**
   - Cambio de bandas y frecuencias
   - Protocolos de comunicación
   - Manejo de controles
   - Respuestas a emergencias

## 🛠️ Características Técnicas

- **Stack:** HTML5 + CSS3 + Vanilla JavaScript
- **Dependencias:** Ninguna (0 librerías externas)
- **Tamaño:** ~50 KB total
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas versiones)
- **Responsive:** Funciona en cualquier resolución

## 📝 Notas

- ⚠️ **No es un simulador médico real**, solo para familiarización
- ✅ Perfectamente seguro para entrenar sin riesgos
- 🌐 Sin conexión? Descarga el archivo y ábrelo localmente
- 🔄 Sin datos guardados en servidores (todo en tu navegador)

## 📖 Ayuda Detallada

Abre el simulador y haz clic en **"❓ Ayuda y Tutorial"** para:
- Instrucciones paso a paso
- Protocolos reales
- Significado de indicadores
- Ejercicios de entrenamiento

---

**Versión:** 1.0  
**Autor:** Proyecto RADIO-SIMULADOR  
**Licencia:** MIT (libre de usar)  

¡Que disfrutes entrenando! 🚁📻
