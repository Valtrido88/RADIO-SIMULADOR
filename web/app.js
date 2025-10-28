// Configuración de Eleven Labs
const ELEVENLABS_CONFIG = {
    apiKey: 'sk_2e47ecd2bf8f6ccba94d41a68b72824d6571cde55b2296d5',
    voiceIds: {
        male: 'pNInz6obpgDQGcFmaJgB', // Voice ID para voz masculina (Adam)
        female: 'EXAVITQu4vr4xnSDxMaL' // Voice ID para voz femenina (Bella)
    }
};

// Estado de la Radio
const radioState = {
    power: false,
    band: 'uhf',
    frequency: 121.500,
    volume: 60,
    squelch: 3,
    transmitting: false,
    history: [],
    signalStrength: 0,
    voiceGender: 'male', // 'male' o 'female'
    useElevenLabs: false, // Se activa automáticamente si hay API key
    isListening: false
};

// Referencias a elementos del DOM
const elements = {
    powerToggle: document.getElementById('powerToggle'),
    powerLed: document.getElementById('powerLed'),
    powerStatus: document.getElementById('powerStatus'),
    bandSelect: document.getElementById('bandSelect'),
    frequencyDisplay: document.getElementById('frequencyDisplay'),
    frequencyInput: document.getElementById('frequencyInput'),
    freqUp: document.getElementById('freqUp'),
    freqDown: document.getElementById('freqDown'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    squelchSlider: document.getElementById('squelchSlider'),
    squelchValue: document.getElementById('squelchValue'),
    voiceSelect: document.getElementById('voiceSelect'),
    elevenLabsKey: document.getElementById('elevenLabsKey'),
    saveApiKey: document.getElementById('saveApiKey'),
    apiKeyStatus: document.getElementById('apiKeyStatus'),
    signalMeter: document.getElementById('signalMeter'),
    rxLed: document.getElementById('rxLed'),
    txLed: document.getElementById('txLed'),
    squelchLed: document.getElementById('squelchLed'),
    presetButtons: document.querySelectorAll('.preset-btn'),
    messageInput: document.getElementById('messageInput'),
    pttButton: document.getElementById('pttButton'),
    transmissionInfo: document.getElementById('transmissionInfo'),
    historyContainer: document.getElementById('historyContainer'),
    clearHistory: document.getElementById('clearHistory')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateDisplay();
    loadSavedApiKey();
    
    // Verificar si hay API key de Eleven Labs configurada
    if (ELEVENLABS_CONFIG.apiKey && ELEVENLABS_CONFIG.apiKey.length > 0) {
        radioState.useElevenLabs = true;
        console.log('✅ Eleven Labs activado');
    } else {
        console.log('ℹ️ Usando síntesis de voz del navegador');
    }
});

// Cargar API key guardada
function loadSavedApiKey() {
    const savedKey = localStorage.getItem('elevenLabsApiKey');
    if (savedKey) {
        ELEVENLABS_CONFIG.apiKey = savedKey;
        elements.elevenLabsKey.value = savedKey;
        elements.apiKeyStatus.textContent = '✓ Guardada';
        elements.apiKeyStatus.style.color = '#4CAF50';
        radioState.useElevenLabs = true;
    }
}

// Guardar API key
function saveApiKey() {
    const apiKey = elements.elevenLabsKey.value.trim();
    
    if (!apiKey) {
        elements.apiKeyStatus.textContent = '⚠ Ingresa una API key';
        elements.apiKeyStatus.style.color = '#ff9800';
        return;
    }
    
    // Guardar en localStorage y en la configuración
    localStorage.setItem('elevenLabsApiKey', apiKey);
    ELEVENLABS_CONFIG.apiKey = apiKey;
    radioState.useElevenLabs = true;
    
    elements.apiKeyStatus.textContent = '✓ API Key guardada';
    elements.apiKeyStatus.style.color = '#4CAF50';
    
    addToHistory('SISTEMA', 'Eleven Labs activado. Las voces ahora serán ultra realistas.', 'system');
}
// Configurar listeners
function setupEventListeners() {
    elements.powerToggle.addEventListener('change', handlePowerToggle);
    elements.bandSelect.addEventListener('change', handleBandChange);
    elements.freqUp.addEventListener('click', () => changeFrequency(0.025));
    elements.freqDown.addEventListener('click', () => changeFrequency(-0.025));
    elements.frequencyInput.addEventListener('change', handleFrequencyInput);
    elements.frequencyInput.addEventListener('input', handleFrequencyInput);
    elements.volumeSlider.addEventListener('input', handleVolumeChange);
    elements.squelchSlider.addEventListener('input', handleSquelchChange);
    elements.voiceSelect.addEventListener('change', handleVoiceChange);
    elements.saveApiKey.addEventListener('click', saveApiKey);
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', handlePresetClick);
    });
    elements.pttButton.addEventListener('mousedown', startTransmission);
    elements.pttButton.addEventListener('mouseup', stopTransmission);
    elements.pttButton.addEventListener('mouseleave', stopTransmission);
    elements.pttButton.addEventListener('touchstart', startTransmission);
    elements.pttButton.addEventListener('touchend', stopTransmission);
    elements.clearHistory.addEventListener('click', clearHistory);
    
    // Cargar voces cuando estén disponibles
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Voces cargadas
        };
    }
}

// Manejo de encendido/apagado
function handlePowerToggle(e) {
    radioState.power = e.target.checked;
    updateDisplay();
    
    if (radioState.power) {
        addToHistory('SISTEMA', 'Radio encendida. Bienvenido al Simulador MEDEVAC.', 'system');
        simulateSignal();
    } else {
        addToHistory('SISTEMA', 'Radio apagada.', 'system');
        clearInterval(signalInterval);
    }
}

// Manejo de banda
function handleBandChange(e) {
    radioState.band = e.target.value;
    
    // Ajustar frecuencia según banda
    const bandRanges = {
        uhf: { min: 300, max: 400, default: 350.500 },
        vhf: { min: 118, max: 137, default: 121.500 },
        mil: { min: 225, max: 400, default: 250.000 }
    };
    
    const range = bandRanges[radioState.band];
    radioState.frequency = range.default;
    elements.frequencyInput.min = range.min;
    elements.frequencyInput.max = range.max;
    updateDisplay();
    addToHistory('SISTEMA', `Banda cambiada a ${e.target.options[e.target.selectedIndex].text}`, 'system');
}

// Cambiar frecuencia
function changeFrequency(delta) {
    if (!radioState.power) {
        alert('⚠️ Enciende la radio primero');
        return;
    }
    
    const bandRanges = {
        uhf: { min: 300, max: 400 },
        vhf: { min: 118, max: 137 },
        mil: { min: 225, max: 400 }
    };
    
    const range = bandRanges[radioState.band];
    radioState.frequency = Math.max(range.min, Math.min(range.max, radioState.frequency + delta));
    updateDisplay();
}

// Manejo de input de frecuencia
function handleFrequencyInput(e) {
    let freq = parseFloat(e.target.value);
    
    const bandRanges = {
        uhf: { min: 300, max: 400 },
        vhf: { min: 118, max: 137 },
        mil: { min: 225, max: 400 }
    };
    
    const range = bandRanges[radioState.band];
    if (freq < range.min || freq > range.max) {
        alert(`⚠️ Frecuencia fuera del rango (${range.min}-${range.max} MHz)`);
        e.target.value = radioState.frequency.toFixed(3);
        return;
    }
    
    radioState.frequency = freq;
// Cambio de Squelch
function handleSquelchChange(e) {
    radioState.squelch = parseInt(e.target.value);
    elements.squelchValue.textContent = radioState.squelch;
    updateSquelchLed();
}

// Cambio de voz del operador
function handleVoiceChange(e) {
    radioState.voiceGender = e.target.value;
    addToHistory('SISTEMA', `Voz del operador cambiada a ${e.target.value === 'male' ? 'masculina' : 'femenina'}`, 'system');
}   radioState.volume = parseInt(e.target.value);
    elements.volumeValue.textContent = radioState.volume;
}

// Cambio de Squelch
function handleSquelchChange(e) {
    radioState.squelch = parseInt(e.target.value);
    elements.squelchValue.textContent = radioState.squelch;
    updateSquelchLed();
}

// Manejar presets
function handlePresetClick(e) {
    if (!radioState.power) {
        alert('⚠️ Enciende la radio primero');
        return;
    }
    
    const freq = parseFloat(e.target.dataset.freq);
    radioState.frequency = freq;
    
    // Determinar banda según frecuencia
    if (freq >= 118 && freq <= 137) {
        radioState.band = 'vhf';
        elements.bandSelect.value = 'vhf';
    } else if (freq >= 225 && freq <= 400) {
        if (freq < 300) {
            radioState.band = 'mil';
            elements.bandSelect.value = 'mil';
        } else {
            radioState.band = 'uhf';
            elements.bandSelect.value = 'uhf';
        }
    }
    
    // Actualizar todos los presets
    elements.presetButtons.forEach(btn => {
        btn.classList.remove('active');
        if (Math.abs(parseFloat(btn.dataset.freq) - freq) < 0.001) {
            btn.classList.add('active');
        }
    });
    
    updateDisplay();
    const presetName = e.target.textContent;
    addToHistory('SISTEMA', `Sintonizado a ${presetName} (${freq.toFixed(3)} MHz)`, 'system');
}

// Iniciar transmisión
function startTransmission() {
    if (!radioState.power) {
        alert('⚠️ Enciende la radio primero');
        return;
    }
    
    const message = elements.messageInput.value.trim();
    if (!message) {
        alert('⚠️ Escribe un mensaje antes de transmitir');
        return;
    }
    
    radioState.transmitting = true;
    elements.pttButton.classList.add('transmitting');
    elements.txLed.classList.add('transmitting');
    elements.transmissionInfo.textContent = '🔴 TRANSMITIENDO...';
    elements.transmissionInfo.classList.add('transmitting');
    
    // Sonido simulado (beep de transmisión)
    playTransmissionBeep();
}

// Detener transmisión
function stopTransmission() {
    if (!radioState.transmitting) return;
    
    radioState.transmitting = false;
    elements.pttButton.classList.remove('transmitting');
    elements.txLed.classList.remove('transmitting');
    
    const message = elements.messageInput.value.trim();
    if (message) {
        addToHistory('TÚ (TX)', message, 'tx');
        elements.transmissionInfo.textContent = '✅ Transmisión completada';
        elements.transmissionInfo.classList.remove('transmitting');
        elements.transmissionInfo.classList.add('success');
        
        // Simular respuesta después de 1.5 segundos
        setTimeout(() => simulateResponse(message), 1500);
        
        // Limpiar entrada
        elements.messageInput.value = '';
    }
}

// Simular respuesta de la base (CONTEXTUAL)
function simulateResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    let response = '';
    
    // RADIO CHECK / PRUEBA DE SONIDO
    if (msg.includes('radio check') || msg.includes('prueba de radio') || 
        msg.includes('prueba de sonido') || msg.includes('comm check') ||
        msg.includes('cómo me copi') || msg.includes('como me copi')) {
        const radioCheckResponses = [
            'Te copiamos Lima Charlie. Fuerte y claro. Cambio.',
            'Radio check satisfactorio. Te copiamos 5 por 5. Cambio.',
            'Helicóptero, te recibimos fuerte y claro. Lima Charlie. Cambio.',
            'Afirmativo. Señal excelente, 5 por 5. Cambio.',
            'Te copiamos perfectamente. Radio check confirmado. Cambio.'
        ];
        response = radioCheckResponses[Math.floor(Math.random() * radioCheckResponses.length)];
    }
    
    // EMERGENCIA / PACIENTE CRÍTICO
    else if (msg.includes('emergencia') || msg.includes('crítico') || 
             msg.includes('critico') || msg.includes('urgente') ||
             msg.includes('mayday')) {
        const emergencyResponses = [
            'Roger emergencia. Hospital notificado. Trauma preparado para recepción. Cambio.',
            'Recibido paciente crítico. Heliport despejado. Equipo médico en espera. Cambio.',
            'Copia emergencia. Prioridad máxima. Servicios de urgencia alertados. Cambio.',
            'Afirmativo. Sala de trauma lista. ETA confirmado. Adelante.',
            'Roger mayday. Despeje prioritario autorizado. Hospital en alerta. Cambio.'
        ];
        response = emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];
    }
    
    // SOLICITUD DE ATERRIZAJE
    else if (msg.includes('aterrizaje') || msg.includes('aterrizar') || 
             msg.includes('heliport') || msg.includes('helipuerto') ||
             msg.includes('despeje')) {
        const landingResponses = [
            'Autorizado para aterrizaje. Heliport despejado. Viento del norte 5 nudos. Cambio.',
            'Afirmativo. Zona de aterrizaje libre. Condiciones óptimas. Adelante.',
            'Roger. Despeje confirmado. Sin tráfico en área. Autorizado aproximación. Cambio.',
            'Heliport despejado. Viento calma. Aterrizaje autorizado. Cambio.',
            'Afirmativo. Aproximación directa autorizada. Personal en tierra alerta. Cambio.'
        ];
        response = landingResponses[Math.floor(Math.random() * landingResponses.length)];
    }
    
    // REPORTE DE POSICIÓN
    else if (msg.includes('posición') || msg.includes('posicion') || 
             msg.includes('ubicación') || msg.includes('ubicacion') ||
             msg.includes('eta') || msg.includes('millas')) {
        const positionResponses = [
            'Roger tu posición. Continúa en ruta. Avisa 2 millas antes de arribo. Cambio.',
            'Copia tu ubicación. Tráfico despejado. Mantén frecuencia activa. Cambio.',
            'Recibido. ETA confirmado. Heliport será despejado a tu arribo. Cambio.',
            'Roger posición. Clima favorable. Esperamos contacto visual. Cambio.',
            'Afirmativo. Te tenemos en seguimiento. Continúa aproximación. Cambio.'
        ];
        response = positionResponses[Math.floor(Math.random() * positionResponses.length)];
    }
    
    // CONFIRMACIÓN / ROGER
    else if (msg.includes('roger') || msg.includes('recibido') || 
             msg.includes('entendido') || msg.includes('afirmativo')) {
        const confirmResponses = [
            'Roger. Cambio y fuera.',
            'Recibido. Corto.',
            'Afirmativo. Mantén frecuencia activa. Cambio.',
            'Copia. Cambio.',
            'Entendido. Corto.'
        ];
        response = confirmResponses[Math.floor(Math.random() * confirmResponses.length)];
    }
    
    // SOLICITUD DE AMBULANCIA / APOYO TERRESTRE
    else if (msg.includes('ambulancia') || msg.includes('paramédico') || 
             msg.includes('paramedico') || msg.includes('apoyo terrestre')) {
        const supportResponses = [
            'Afirmativo. Ambulancia en ruta al heliport. ETA 3 minutos. Cambio.',
            'Roger. Equipo de paramédicos en posición. Listos para transferencia. Cambio.',
            'Recibido. Servicios médicos de emergencia despachados. Cambio.',
            'Afirmativo. Apoyo terrestre confirmado. Ambulancia en espera. Cambio.'
        ];
        response = supportResponses[Math.floor(Math.random() * supportResponses.length)];
    }
    
    // CONDICIONES METEOROLÓGICAS
    else if (msg.includes('clima') || msg.includes('tiempo') || 
             msg.includes('viento') || msg.includes('visibilidad')) {
        const weatherResponses = [
            'Condiciones actuales: viento del norte 5 nudos, visibilidad 10 millas. Cambio.',
            'Clima favorable. Viento calma. Cielo despejado. Cambio.',
            'Reporte meteorológico: viento variable 3 nudos, temperatura 20 grados. Cambio.',
            'Condiciones óptimas para operación. Sin restricciones. Cambio.'
        ];
        response = weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
    }
    
    // RESPUESTAS GENERALES (fallback)
    else {
        const generalResponses = [
            'Base a tu llamada. Recibido alto y claro. Cambio.',
            'Helicóptero, aquí base de operaciones. Copia tu mensaje. Adelante.',
            'Roger. Te copiamos. Adelante con tu mensaje. Cambio.',
            'Recibido. Adelante con tu transmisión. Cambio.',
            'Afirmativo. Te escuchamos fuerte y claro. Adelante. Cambio.',
            'Copia. Esperamos tu tráfico. Cambio.'
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    addToHistory('BASE (RX)', response, 'rx');
    
    // Simular recepción (parpadeo del LED RX)
    elements.rxLed.classList.add('warning');
    
    // Reproducir respuesta con voz sintética distorsionada
    speakRadioMessage(randomResponse);
    
    setTimeout(() => elements.rxLed.classList.remove('warning'), 2000);
}

// Sintetizar voz con efecto de radio
async function speakRadioMessage(text) {
    // Si Eleven Labs está configurado, usarlo
    if (radioState.useElevenLabs) {
        await speakWithElevenLabs(text);
    } else {
        // Fallback a síntesis de voz del navegador
        speakWithBrowserTTS(text);
    }
}

// Síntesis con Eleven Labs
async function speakWithElevenLabs(text) {
    try {
        const voiceId = ELEVENLABS_CONFIG.voiceIds[radioState.voiceGender];
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_CONFIG.apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Error en Eleven Labs API');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Aplicar volumen
        audio.volume = radioState.volume / 100;
        
        // Reproducir estática antes
        playRadioStatic(0.3);
        
        // Esperar un poco y reproducir el audio
        setTimeout(() => {
            audio.play();
            
            // Reproducir estática al final
            audio.addEventListener('ended', () => {
                playRadioStatic(0.2);
                URL.revokeObjectURL(audioUrl);
            });
        }, 300);
        
    } catch (error) {
        console.error('Error con Eleven Labs:', error);
        addToHistory('SISTEMA', 'Error al generar voz. Usando síntesis del navegador.', 'system');
        speakWithBrowserTTS(text);
    }
}

// Síntesis con TTS del navegador (fallback)
function speakWithBrowserTTS(text) {
    if (!('speechSynthesis' in window)) {
        console.log('Síntesis de voz no disponible');
        return;
    }
    
    // Cancelar cualquier mensaje previo
    window.speechSynthesis.cancel();
    
    // Crear utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Seleccionar voz según género configurado
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (radioState.voiceGender === 'male') {
        // Buscar voz masculina en español
        selectedVoice = voices.find(voice => 
            voice.lang.startsWith('es') && 
            (voice.name.includes('Male') || voice.name.includes('Diego') || voice.name.includes('Jorge'))
        ) || voices.find(voice => voice.lang.startsWith('es'));
    } else {
        // Buscar voz femenina en español
        selectedVoice = voices.find(voice => 
            voice.lang.startsWith('es') && 
            (voice.name.includes('Female') || voice.name.includes('Monica') || voice.name.includes('Paulina'))
        ) || voices.find(voice => voice.lang.startsWith('es'));
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // Configurar parámetros para sonar como radio
    utterance.rate = 0.95; // Ligeramente más lento
    utterance.pitch = radioState.voiceGender === 'male' ? 0.8 : 1.1; // Más grave para hombre, más agudo para mujer
    utterance.volume = radioState.volume / 100;
    
    // Agregar estática/ruido antes y después
    utterance.onstart = () => {
        playRadioStatic(0.3); // Estática corta al inicio
    };
    
    utterance.onend = () => {
        playRadioStatic(0.2); // Estática corta al final
    };
    
    // Hablar
    window.speechSynthesis.speak(utterance);
}

// Reproducir estática de radio
function playRadioStatic(duration = 0.3) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generar ruido blanco
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1; // Ruido suave
        }
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Aplicar filtro paso-banda para simular radio
        const bandpassFilter = audioContext.createBiquadFilter();
        bandpassFilter.type = 'bandpass';
        bandpassFilter.frequency.value = 2000; // Frecuencia central
        bandpassFilter.Q.value = 1.0;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = radioState.volume / 200; // Volumen más bajo para estática
        
        source.connect(bandpassFilter);
        bandpassFilter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
        source.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Error al reproducir estática:', e);
    }
}

// Efecto de beep de transmisión
function playTransmissionBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000; // 1 kHz
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio no disponible');
    }
}

// Actualizar pantalla
function updateDisplay() {
    // Actualizar LED de potencia
    if (radioState.power) {
        elements.powerLed.classList.add('active');
        elements.powerStatus.textContent = 'Encendido';
    } else {
        elements.powerLed.classList.remove('active');
        elements.powerStatus.textContent = 'Apagado';
    }
    
    // Actualizar frecuencia
    elements.frequencyDisplay.textContent = radioState.frequency.toFixed(3);
    elements.frequencyInput.value = radioState.frequency.toFixed(3);
    
    // Limpiar preset active si frecuencia no coincide
    elements.presetButtons.forEach(btn => {
        const presetFreq = parseFloat(btn.dataset.freq);
        if (Math.abs(presetFreq - radioState.frequency) < 0.001) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar LEDs
    updateSquelchLed();
    
    // Deshabilitar controles si radio está apagada
    if (!radioState.power) {
        elements.frequencyInput.disabled = true;
        elements.freqUp.disabled = true;
        elements.freqDown.disabled = true;
        elements.bandSelect.disabled = true;
        elements.pttButton.disabled = true;
        elements.messageInput.disabled = true;
    } else {
        elements.frequencyInput.disabled = false;
        elements.freqUp.disabled = false;
        elements.freqDown.disabled = false;
        elements.bandSelect.disabled = false;
        elements.pttButton.disabled = false;
        elements.messageInput.disabled = false;
    }
}

// Actualizar LED de Squelch
function updateSquelchLed() {
    if (radioState.squelch > 0) {
        elements.squelchLed.classList.add('active');
    } else {
        elements.squelchLed.classList.remove('active');
    }
}

// Simulación de señal
let signalInterval;
function simulateSignal() {
    let direction = 1;
    let signalStrength = 0;
    
    signalInterval = setInterval(() => {
        signalStrength += direction * Math.random() * 15;
        
        if (signalStrength >= 100) {
            signalStrength = 100;
            direction = -1;
        } else if (signalStrength <= 0) {
            signalStrength = 0;
            direction = 1;
        }
        
        radioState.signalStrength = signalStrength;
        elements.signalMeter.style.width = signalStrength + '%';
    }, 200);
}

// Agregar al historial
function addToHistory(source, message, type) {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    const item = {
        source,
        message,
        type,
        timestamp
    };
    
    radioState.history.push(item);
    
    // Limitar historial a 50 items
    if (radioState.history.length > 50) {
        radioState.history.shift();
    }
    
    renderHistory();
}

// Renderizar historial
function renderHistory() {
    const placeholder = elements.historyContainer.querySelector('.history-placeholder');
    if (placeholder) placeholder.remove();
    
    elements.historyContainer.innerHTML = radioState.history.map(item => `
        <div class="history-item ${item.type}">
            <span class="history-timestamp">${item.timestamp} - ${item.source}</span>
            <div class="history-text">${escapeHtml(item.message)}</div>
        </div>
    `).join('');
    
    // Auto-scroll al final
    elements.historyContainer.scrollTop = elements.historyContainer.scrollHeight;
}

// Limpiar historial
function clearHistory() {
    if (confirm('¿Deseas limpiar el historial de comunicaciones?')) {
        radioState.history = [];
        elements.historyContainer.innerHTML = '<div class="history-placeholder">El historial aparecerá aquí...</div>';
    }
}

// Escapar HTML para seguridad
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Feedback visual cuando se escriba en el message input
elements.messageInput.addEventListener('focus', () => {
    if (radioState.power) {
        elements.transmissionInfo.textContent = '✏️ Redactando mensaje...';
        elements.transmissionInfo.classList.remove('transmitting', 'success');
    }
});

elements.messageInput.addEventListener('blur', () => {
    elements.transmissionInfo.textContent = '';
});

// Agregar sample de comunicación al inicio
window.addEventListener('load', () => {
    setTimeout(() => {
        if (radioState.power) {
            addToHistory('SISTEMA', 'Simulador listo. Selecciona una banda y ajusta la frecuencia para entrenar.', 'system');
        }
    }, 500);
});
