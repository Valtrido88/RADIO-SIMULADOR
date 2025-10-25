// Estado de la Radio
const radioState = {
    power: false,
    band: 'uhf',
    frequency: 121.500,
    volume: 60,
    squelch: 3,
    transmitting: false,
    history: [],
    signalStrength: 0
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
});

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
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', handlePresetClick);
    });
    elements.pttButton.addEventListener('mousedown', startTransmission);
    elements.pttButton.addEventListener('mouseup', stopTransmission);
    elements.pttButton.addEventListener('mouseleave', stopTransmission);
    elements.pttButton.addEventListener('touchstart', startTransmission);
    elements.pttButton.addEventListener('touchend', stopTransmission);
    elements.clearHistory.addEventListener('click', clearHistory);
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
    updateDisplay();
}

// Cambio de volumen
function handleVolumeChange(e) {
    radioState.volume = parseInt(e.target.value);
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
        setTimeout(simulateResponse, 1500);
        
        // Limpiar entrada
        elements.messageInput.value = '';
    }
}

// Simular respuesta de la base
function simulateResponse() {
    const responses = [
        'Base a tu llamada, recibido alto y claro. Cambio.',
        'Helicóptero, aquí base de operaciones. Copia tu mensaje. Adelante.',
        'Recibido. Autorizado para desembarque en heliport. Cambio.',
        'Copia transmisión. Servicios de ambulancia notificados. Cambio.',
        'Roger, esperamos tu arribo en 10 minutos. Cambio.',
        '¿Repitieras tu últimas transmisión? No copia completa. Cambio.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addToHistory('BASE (RX)', randomResponse, 'rx');
    
    // Simular recepción (parpadeo del LED RX)
    elements.rxLed.classList.add('warning');
    setTimeout(() => elements.rxLed.classList.remove('warning'), 500);
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
