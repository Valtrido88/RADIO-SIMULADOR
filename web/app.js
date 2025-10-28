// Configuración de Eleven Labs
const ELEVENLABS_CONFIG = {
    apiKey: '', // En producción, el backend hará la llamada; esta key es opcional para desarrollo local
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
    useElevenLabs: true, // Por defecto usamos TTS; backend maneja la clave en producción
    isListening: false,
    currentScenario: null,
    emitterRole: 'Helo Uno',
    receiverRole: 'Base',
    // Eleven Labs - Voice ID personalizado (opcional)
    customVoiceId: '',
    // Gemini
    useGemini: true,
    // No exponer claves en producción: dejar vacía por defecto. La UI/localStorage puede establecerla en entornos de desarrollo.
    geminiApiKey: '',
    geminiDifficulty: 'intermedio',
    // Backend
    backendBase: ''
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
    testTTSButton: document.getElementById('testTTSButton'),
    apiKeyStatus: document.getElementById('apiKeyStatus'),
    elevenCustomVoiceId: document.getElementById('elevenCustomVoiceId'),
    saveVoiceId: document.getElementById('saveVoiceId'),
    voiceIdStatus: document.getElementById('voiceIdStatus'),
    signalMeter: document.getElementById('signalMeter'),
    rxLed: document.getElementById('rxLed'),
    txLed: document.getElementById('txLed'),
    squelchLed: document.getElementById('squelchLed'),
    presetButtons: document.querySelectorAll('.preset-btn'),
    messageInput: document.getElementById('messageInput'),
    pttButton: document.getElementById('pttButton'),
    transmissionInfo: document.getElementById('transmissionInfo'),
    historyContainer: document.getElementById('historyContainer'),
    clearHistory: document.getElementById('clearHistory'),
    // Ayuda operacional
    copyNineLineTemplate: document.getElementById('copyNineLineTemplate'),
    // Escenarios
    generateScenario: document.getElementById('generateScenario'),
    copyNineLine: document.getElementById('copyNineLine'),
    loadNineLineToMsg: document.getElementById('loadNineLineToMsg'),
    loadProceduralToMsg: document.getElementById('loadProceduralToMsg'),
    scenarioContainer: document.getElementById('scenarioContainer'),
    emitterRole: document.getElementById('emitterRole'),
    receiverRole: document.getElementById('receiverRole'),
    backendBase: document.getElementById('backendBase'),
    // Gemini
    useGemini: document.getElementById('useGemini'),
    geminiApiKey: document.getElementById('geminiApiKey'),
    saveGeminiKey: document.getElementById('saveGeminiKey'),
    geminiKeyStatus: document.getElementById('geminiKeyStatus'),
    geminiDifficulty: document.getElementById('geminiDifficulty')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateDisplay();
    loadSavedApiKey();
    loadSavedGeminiKey();
    loadSavedVoiceId();
    loadSavedBackendBase();
    // En producción no persistimos claves desde el estado.
    checkBackendHealth();
    
    // Preferimos usar el backend para TTS; si hay API key local, también sirve para desarrollo
    if (ELEVENLABS_CONFIG.apiKey && ELEVENLABS_CONFIG.apiKey.length > 0) {
        console.log('🔧 Eleven Labs con API local (dev)');
    } else {
        console.log('✅ TTS: backend habilitado (producción)');
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

// Cargar Voice ID personalizado
function loadSavedVoiceId() {
    try {
        const saved = localStorage.getItem('elevenCustomVoiceId') || '';
        radioState.customVoiceId = saved;
        if (elements.elevenCustomVoiceId) elements.elevenCustomVoiceId.value = saved;
        if (saved && elements.voiceIdStatus) {
            elements.voiceIdStatus.textContent = '✓ Guardado';
            elements.voiceIdStatus.style.color = '#4CAF50';
        }
    } catch (e) {
        console.warn('No se pudo cargar el Voice ID');
    }
}

// Guardar Voice ID personalizado
function saveVoiceId() {
    const v = elements.elevenCustomVoiceId?.value?.trim() || '';
    radioState.customVoiceId = v;
    if (v) {
        localStorage.setItem('elevenCustomVoiceId', v);
        if (elements.voiceIdStatus) {
            elements.voiceIdStatus.textContent = '✓ Voice ID guardado';
            elements.voiceIdStatus.style.color = '#4CAF50';
        }
        addToHistory('SISTEMA', 'Voice ID personalizado establecido para Eleven Labs.', 'system');
    } else {
        localStorage.removeItem('elevenCustomVoiceId');
        if (elements.voiceIdStatus) {
            elements.voiceIdStatus.textContent = 'Voice ID limpiado';
            elements.voiceIdStatus.style.color = '#ff9800';
        }
        addToHistory('SISTEMA', 'Voice ID personalizado eliminado. Se usarán voces por defecto.', 'system');
    }
}

// Backend helpers: base configurable y fetch con esa base
function loadSavedBackendBase() {
    try {
        const base = localStorage.getItem('backendBase') || '';
        radioState.backendBase = base;
        if (elements.backendBase) elements.backendBase.value = base;
    } catch {}
}

function saveBackendBase() {
    const base = elements.backendBase?.value?.trim() || '';
    radioState.backendBase = base;
    if (base) localStorage.setItem('backendBase', base); else localStorage.removeItem('backendBase');
    checkBackendHealth();
}

function buildApiUrl(path) {
    const base = radioState.backendBase?.trim();
    if (!base) return path; // relativo (misma origin)
    try {
        return new URL(path, base).toString();
    } catch { return path; }
}

async function apiFetch(path, options) {
    const url = buildApiUrl(path);
    return fetch(url, options);
}
// Cargar API key de Gemini guardada
function loadSavedGeminiKey() {
    try {
        const savedKey = localStorage.getItem('geminiApiKey');
        const useGemini = localStorage.getItem('useGemini') === 'true';
        const diff = localStorage.getItem('geminiDifficulty') || 'intermedio';
        if (savedKey) {
            radioState.geminiApiKey = savedKey;
            if (elements.geminiApiKey) elements.geminiApiKey.value = savedKey;
            if (elements.geminiKeyStatus) {
                elements.geminiKeyStatus.textContent = '✓ Guardada';
                elements.geminiKeyStatus.style.color = '#4CAF50';
            }
        }
        radioState.useGemini = useGemini;
        if (elements.useGemini) elements.useGemini.checked = useGemini;
        radioState.geminiDifficulty = diff;
        if (elements.geminiDifficulty) elements.geminiDifficulty.value = diff;
    } catch (e) {
        console.warn('No se pudo cargar la configuración de Gemini');
    }
}

// Guardar API key de Gemini
function saveGeminiKey() {
    const apiKey = elements.geminiApiKey?.value?.trim();
    if (!apiKey) {
        if (elements.geminiKeyStatus) {
            elements.geminiKeyStatus.textContent = '⚠ Ingresa una API key';
            elements.geminiKeyStatus.style.color = '#ff9800';
        }
        return;
    }
    localStorage.setItem('geminiApiKey', apiKey);
    radioState.geminiApiKey = apiKey;
    if (elements.geminiKeyStatus) {
        elements.geminiKeyStatus.textContent = '✓ API Key guardada';
        elements.geminiKeyStatus.style.color = '#4CAF50';
    }
    addToHistory('SISTEMA', 'Gemini listo. Los escenarios podrán ser generados por IA.', 'system');
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
    if (elements.saveVoiceId) elements.saveVoiceId.addEventListener('click', saveVoiceId);
    if (elements.testTTSButton) {
        elements.testTTSButton.addEventListener('click', async () => {
            const phrase = 'Base, prueba de sonido desde simulador MEDEVAC. ¿Me copian? Cambio.';
            addToHistory('OPERADOR', '(Prueba TTS) ' + phrase, 'tx');
            await speakRadioMessage(phrase);
        });
    }
    if (elements.saveGeminiKey) elements.saveGeminiKey.addEventListener('click', saveGeminiKey);
    if (elements.backendBase) {
        elements.backendBase.addEventListener('change', saveBackendBase);
        elements.backendBase.addEventListener('blur', saveBackendBase);
    }
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', handlePresetClick);
    });
    elements.pttButton.addEventListener('mousedown', startTransmission);
    elements.pttButton.addEventListener('mouseup', stopTransmission);
    elements.pttButton.addEventListener('mouseleave', stopTransmission);
    elements.pttButton.addEventListener('touchstart', startTransmission);
    elements.pttButton.addEventListener('touchend', stopTransmission);
    elements.clearHistory.addEventListener('click', clearHistory);
    
    // Ayuda operacional
    if (elements.copyNineLineTemplate) {
        elements.copyNineLineTemplate.addEventListener('click', () => {
            const template = buildNineLineTemplate();
            copyToClipboard(template);
            addToHistory('SISTEMA', 'Plantilla de 9 líneas copiada al portapapeles.', 'system');
        });
    }
    
    // Escenarios
    if (elements.generateScenario) {
        elements.generateScenario.addEventListener('click', async () => {
            if (radioState.useGemini && radioState.geminiApiKey) {
                addToHistory('SISTEMA', 'Generando caso con Gemini…', 'system');
                try {
                    const scenario = await generateScenarioWithGemini(radioState.geminiDifficulty);
                    radioState.currentScenario = scenario;
                    renderScenario(scenario);
                    addToHistory('SISTEMA', 'Caso generado por IA (Gemini).', 'system');
                } catch (err) {
                    console.error(err);
                    addToHistory('SISTEMA', 'Fallo al generar con Gemini. Usando generador local.', 'system');
                    const scenario = generateMedevacScenario();
                    radioState.currentScenario = scenario;
                    renderScenario(scenario);
                }
            } else {
                const scenario = generateMedevacScenario();
                radioState.currentScenario = scenario;
                renderScenario(scenario);
            }
        });
    }
    // Selectores de roles
    if (elements.emitterRole) {
        elements.emitterRole.addEventListener('change', (e) => {
            radioState.emitterRole = e.target.value;
            addToHistory('SISTEMA', `Emisor seleccionado: ${radioState.emitterRole}`, 'system');
        });
    }
    if (elements.receiverRole) {
        elements.receiverRole.addEventListener('change', (e) => {
            radioState.receiverRole = e.target.value;
            addToHistory('SISTEMA', `Receptor seleccionado: ${radioState.receiverRole}`, 'system');
        });
    }
    if (elements.useGemini) {
        elements.useGemini.addEventListener('change', (e) => {
            radioState.useGemini = e.target.checked;
            localStorage.setItem('useGemini', String(radioState.useGemini));
            addToHistory('SISTEMA', radioState.useGemini ? 'Gemini activado para generación de casos.' : 'Gemini desactivado.', 'system');
        });
    }
    if (elements.geminiDifficulty) {
        elements.geminiDifficulty.addEventListener('change', (e) => {
            radioState.geminiDifficulty = e.target.value;
            localStorage.setItem('geminiDifficulty', radioState.geminiDifficulty);
        });
    }
    if (elements.copyNineLine) {
        elements.copyNineLine.addEventListener('click', () => {
            if (!radioState.currentScenario) {
                alert('Primero genera un caso.');
                return;
            }
            const nineLine = buildNineLineFromScenario(radioState.currentScenario);
            copyToClipboard(nineLine);
            addToHistory('SISTEMA', '9 líneas del caso copiadas al portapapeles.', 'system');
        });
    }
    if (elements.loadNineLineToMsg) {
        elements.loadNineLineToMsg.addEventListener('click', () => {
            if (!radioState.currentScenario) {
                alert('Primero genera un caso.');
                return;
            }
            const nineLine = buildNineLineFromScenario(radioState.currentScenario);
            elements.messageInput.value = nineLine;
            elements.messageInput.focus();
        });
    }
    if (elements.loadProceduralToMsg) {
        elements.loadProceduralToMsg.addEventListener('click', () => {
            if (!radioState.currentScenario) {
                alert('Primero genera un caso.');
                return;
            }
            const msg = buildProceduralRadioFromScenario(radioState.currentScenario);
            elements.messageInput.value = msg;
            elements.messageInput.focus();
        });
    }
    
    // Cargar voces cuando estén disponibles
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Voces cargadas
        };
    }
}

// --- Gemini: Generación de escenarios ---
async function generateScenarioWithGemini(difficulty = 'intermedio') {
    const difficultyMap = {
        facil: 'fácil',
        intermedio: 'intermedia',
        dificil: 'difícil',
        aleatorio: 'aleatoria'
    };

    const allowed = {
        categories: ['Militar','Civil','EPW'],
        precedences: ['URG','PRI','RUT'],
        types: ['Camilla','Ambulatorio'],
        regions: ['Cabeza','Cuello','Tórax','Abdomen','Pelvis','Brazo Izq','Brazo Der','Pierna Izq','Pierna Der'],
        airway: ['Permeable','Comprometida'],
        breathing: ['Adecuada','Dificultosa'],
        circulation: ['Estable','Inestable'],
        bleeding: ['Bajo','Moderado','Alto'],
        conscious: ['Sí','No'],
        equip: ['Ninguno','Guinche','Ventilador','Oxígeno'],
        security: ['Sin enemigo','Enemigo posible','Enemigo confirmado'],
        marking: ['Humo','Páneles','IR','Bengala'],
        nbc: ['Ninguna','Q','B','R']
    };

    const prompt = `Eres un generador de escenarios MEDEVAC para entrenamiento de radio táctico en español.
Debes crear un ÚNICO escenario con entre 1 y 4 bajas, adecuado a una dificultad ${difficultyMap[difficulty] || 'intermedia'}.
RESPONDE EXCLUSIVAMENTE con un JSON válido, sin texto adicional.

Estructura exacta esperada (usa estos nombres de campos y valores permitidos):
{
  "title": string,
  "line1_location": string, // Ej: "LZ Bravo - Coordenadas 4.321, -74.123"
  "line4_equipment": oneof ${JSON.stringify(allowed.equip)},
  "line6_security": oneof ${JSON.stringify(allowed.security)},
  "line7_marking": oneof ${JSON.stringify(allowed.marking)},
  "line9_nbc": oneof ${JSON.stringify(allowed.nbc)},
  "notes": string,
  "casualties": [
    {
      "category": oneof ${JSON.stringify(allowed.categories)},
      "precedence": oneof ${JSON.stringify(allowed.precedences)},
      "type": oneof ${JSON.stringify(allowed.types)},
      "injuries": [ { "region": oneof ${JSON.stringify(allowed.regions)}, "severity": oneof ["Leve","Moderada","Grave"] } ],
      "airway": oneof ${JSON.stringify(allowed.airway)},
      "breathing": oneof ${JSON.stringify(allowed.breathing)},
      "circulation": oneof ${JSON.stringify(allowed.circulation)},
      "bleeding": oneof ${JSON.stringify(allowed.bleeding)},
      "conscious": oneof ${JSON.stringify(allowed.conscious)},
      "vitals": { "hr": integer, "spo2": integer, "bp": string, "rr": integer }
    }
  ]
}

Reglas:
- Valores sólo de las listas permitidas.
- Incluye entre 1 y 3 lesiones por baja.
- Los signos vitales deben ser coherentes con la precedencia: URG suele peor que PRI, y PRI peor que RUT.
- No incluyas comentarios ni explicaciones fuera del JSON.`;

    // Si hay API key en el cliente, usar llamada directa (desarrollo). Si no, usar el endpoint backend /api/generate-scenario
    if (!radioState.geminiApiKey) {
    const backendRes = await apiFetch('/api/generate-scenario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                difficulty,
                prompt,
                frequency: radioState.frequency,
                emitterRole: radioState.emitterRole,
                receiverRole: radioState.receiverRole
            })
        });
        if (!backendRes.ok) {
            const t = await backendRes.text();
            throw new Error(`Backend error ${backendRes.status}: ${t}`);
        }
        const scenario = await backendRes.json();
        return scenario;
    }

    // Desarrollo: llamada directa a la API de Gemini
    const apiKey = radioState.geminiApiKey;
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = { contents: [ { role: 'user', parts: [ { text: prompt } ] } ], generationConfig: { temperature: 0.9 } };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const t = await res.text(); throw new Error(`Gemini error ${res.status}: ${t}`); }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const json = extractFirstJson(text);
    const raw = JSON.parse(json);

    // Normalizar/completar estructura
    const casualties = (raw.casualties || []).map((c, idx) => ({
        id: idx + 1,
        category: c.category,
        precedence: c.precedence,
        type: c.type,
        injuries: (c.injuries || []).map(i => ({ region: i.region, severity: i.severity })),
        airway: c.airway,
        breathing: c.breathing,
        circulation: c.circulation,
        bleeding: c.bleeding,
        conscious: c.conscious,
        vitals: c.vitals && typeof c.vitals === 'object' ? c.vitals : generateVitals(c.precedence || 'PRI')
    }));

    // Agregaciones
    const agg = casualties.reduce((acc, c) => {
        acc.precedence[c.precedence] = (acc.precedence[c.precedence] || 0) + 1;
        acc.type[c.type] = (acc.type[c.type] || 0) + 1;
        acc.category[c.category] = (acc.category[c.category] || 0) + 1;
        return acc;
    }, { precedence: {}, type: {}, category: {} });

    const urg = agg.precedence.URG || 0;
    const pri = agg.precedence.PRI || 0;
    const rut = agg.precedence.RUT || 0;
    const lit = agg.type.Camilla || 0;
    const amb = agg.type.Ambulatorio || 0;

    const scenario = {
        title: raw.title || 'Escenario MEDEVAC (IA)',
        line1_location: raw.line1_location || (randomFrom(['LZ Bravo','LZ Sierra','Helipuerto Base Norte','Puesto Avanzado Alfa']) + ' - ' + generateCoords()),
        line2_freq_callsign: `${radioState.frequency.toFixed(3)} MHz / Indicativo: ${radioState.emitterRole}`,
        line3_precedence: { URG: urg, PRI: pri, RUT: rut },
        line4_equipment: raw.line4_equipment || randomFrom(allowed.equip),
        line5_type: { Camilla: lit, Ambulatorio: amb },
        line6_security: raw.line6_security || randomFrom(allowed.security),
        line7_marking: raw.line7_marking || randomFrom(allowed.marking),
        line8_nationality: buildLine8FromCategories(agg.category),
        line9_nbc: raw.line9_nbc || randomFrom(allowed.nbc),
        emitterRole: radioState.emitterRole,
        receiverRole: radioState.receiverRole,
        casualties,
        notes: raw.notes || ''
    };
    return scenario;
}

function extractFirstJson(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw new Error('No se encontró JSON en la respuesta');
    return text.slice(start, end + 1);
}

// --- Healthcheck backend ---
async function checkBackendHealth() {
    const el = document.getElementById('backendStatus');
    if (!el) return;
    el.textContent = 'Backend: comprobando…';
    el.classList.remove('status-ok','status-warn','status-error');
    try {
    const res = await apiFetch('/api/health', { method: 'GET' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const h = await res.json();
        const hasGemini = !!(h?.services?.gemini);
        const hasEleven = !!(h?.services?.elevenlabs);
        if (hasGemini && hasEleven) {
            el.textContent = 'Backend: OK (Gemini, ElevenLabs)';
            el.classList.add('status-ok');
        } else if (hasGemini || hasEleven) {
            const which = hasGemini ? 'Gemini' : 'ElevenLabs';
            el.textContent = `Backend: parcial (${which})`;
            el.classList.add('status-warn');
        } else {
            el.textContent = 'Backend: no configurado';
            el.classList.add('status-error');
        }
    } catch (e) {
        el.textContent = 'Backend: sin respuesta';
        el.classList.add('status-error');
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

// Cambio de voz del operador
function handleVoiceChange(e) {
    radioState.voiceGender = e.target.value;
    addToHistory('SISTEMA', `Voz del operador cambiada a ${e.target.value === 'male' ? 'masculina' : 'femenina'}`, 'system');
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
    speakRadioMessage(response);
    
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
        const selectedVoiceId = (radioState.customVoiceId && radioState.customVoiceId.trim().length > 0)
            ? radioState.customVoiceId.trim()
            : ELEVENLABS_CONFIG.voiceIds[radioState.voiceGender];
        // Si no hay API key local, usar backend de producción
        let response;
        if (!ELEVENLABS_CONFIG.apiKey) {
            response = await apiFetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceGender: radioState.voiceGender, voiceId: radioState.customVoiceId?.trim() || undefined })
            });
        } else {
            // Desarrollo: llamada directa
            response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
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
        }
        
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

// =========================
// Utilidades y Generadores
// =========================

function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {
        // Fallback: crear textarea temporal
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

function buildNineLineTemplate() {
    return (
`L1: Ubicación punto de recogida: ____________\n` +
`L2: Frecuencia / Indicativo: ____________\n` +
`L3: Pacientes por precedencia (URG/PRI/RUT): ____/____/____\n` +
`L4: Equipo especial (Ninguno/Guinche/Ventilador/Otro): ____________\n` +
`L5: Pacientes por tipo (Camilla/Ambulatorio): ____/____\n` +
`L6: Seguridad (Sin enemigo/Posible/Confirmado): ____________\n` +
`L7: Señalización (Humo/Páneles/IR/Bengala): ____________\n` +
`L8: Nacionalidad/Estado (Militar/Civil; Aliado): ____________\n` +
`L9: Contaminación NBC (Ninguna/Q/B/R): ____________`);
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateCoords() {
    // Coordenadas sencillas simuladas (lat, lon)
    const lat = (Math.random() * 1.0 + 4.0).toFixed(3);   // ~ Colombia 4.x
    const lon = (-(Math.random() * 2.0 + 73.0)).toFixed(3); // ~ -75 a -73
    return `Coordenadas ${lat}, ${lon}`;
}

function generateMedevacScenario() {
    const specialEq = ['Ninguno', 'Guinche', 'Ventilador', 'Oxígeno'];
    const security = ['Sin enemigo', 'Enemigo posible', 'Enemigo confirmado'];
    const marking = ['Humo', 'Páneles', 'IR', 'Bengala'];
    const contamination = ['Ninguna', 'Q', 'B', 'R'];

    // Generar entre 1 y 4 bajas
    const casualtyCount = Math.floor(Math.random() * 4) + 1; // 1..4
    const casualties = Array.from({ length: casualtyCount }).map((_, idx) => generateCasualty(idx + 1));

    // Agregaciones para L3 (precedencia) y L5 (tipo)
    const agg = casualties.reduce((acc, c) => {
        acc.precedence[c.precedence] = (acc.precedence[c.precedence] || 0) + 1;
        acc.type[c.type] = (acc.type[c.type] || 0) + 1;
        acc.category[c.category] = (acc.category[c.category] || 0) + 1;
        return acc;
    }, { precedence: {}, type: {}, category: {} });

    const urg = agg.precedence.URG || 0;
    const pri = agg.precedence.PRI || 0;
    const rut = agg.precedence.RUT || 0;
    const lit = agg.type.Camilla || 0;
    const amb = agg.type.Ambulatorio || 0;

    const scenario = {
        title: randomFrom([
            'Contacto con IED', 'Accidente en inserción', 'Herida por arma ligera', 'Evacuación desde LZ caliente', 'Accidente de entrenamiento'
        ]),
        line1_location: randomFrom([
            'LZ Bravo','LZ Sierra','Helipuerto Base Norte','Puesto Avanzado Alfa'
        ]) + ' - ' + generateCoords(),
        line2_freq_callsign: `${radioState.frequency.toFixed(3)} MHz / Indicativo: ${radioState.emitterRole}`,
        line3_precedence: { URG: urg, PRI: pri, RUT: rut },
        line4_equipment: randomFrom(specialEq),
        line5_type: { Camilla: lit, Ambulatorio: amb },
        line6_security: randomFrom(security),
        line7_marking: randomFrom(marking),
        line8_nationality: buildLine8FromCategories(agg.category),
        line9_nbc: randomFrom(contamination),
        emitterRole: radioState.emitterRole,
        receiverRole: radioState.receiverRole,
        casualties,
        notes: randomFrom([
            'Hemorragia controlada, requiere traslado inmediato.',
            'Paciente con TCE moderado, monitoreo de vía aérea.',
            'Heridas por esquirlas, signos vitales estables.',
            'Riesgo de contacto hostil, aproximación rápida.'
        ])
    };
    return scenario;
}

function buildLine8FromCategories(catAgg) {
    const parts = [];
    if (catAgg.Militar) parts.push(`${catAgg.Militar} Militar(es) Aliado(s)`);
    if (catAgg.Civil) parts.push(`${catAgg.Civil} Civil(es)`);
    if (catAgg.EPW) parts.push(`${catAgg.EPW} Prisionero(s) de guerra (EPW)`);
    return parts.length ? parts.join(', ') : 'Pendiente de confirmar';
}

function generateCasualty(seq) {
    const categories = ['Militar', 'Civil', 'EPW'];
    const precedences = ['URG', 'PRI', 'RUT'];
    const types = ['Camilla', 'Ambulatorio'];
    const regions = ['Cabeza', 'Cuello', 'Tórax', 'Abdomen', 'Pelvis', 'Brazo Izq', 'Brazo Der', 'Pierna Izq', 'Pierna Der'];
    const severities = ['Leve', 'Moderada', 'Grave'];
    const blood = ['Bajo', 'Moderado', 'Alto'];

    // Aleatorios con sesgo leve a Militar y urgencias
    const category = randomFrom([ 'Militar','Militar','Civil','EPW' ]);
    const precedence = randomFrom([ 'URG','URG','PRI','RUT' ]);
    const type = randomFrom([ 'Camilla','Ambulatorio','Camilla' ]);
    const injuryCount = Math.floor(Math.random() * 3) + 1; // 1..3
    const injuries = Array.from({ length: injuryCount }).map(() => ({
        region: randomFrom(regions),
        severity: randomFrom(severities)
    }));

    const vitals = generateVitals(precedence);

    return {
        id: seq,
        category, // Militar | Civil | EPW
        precedence, // URG | PRI | RUT
        type, // Camilla | Ambulatorio
        injuries,
        vitals, // { hr, spo2, bp, rr }
        bleeding: randomFrom(blood),
        conscious: randomFrom(['Sí', 'Sí', 'No']),
        airway: randomFrom(['Permeable', 'Comprometida']),
        breathing: randomFrom(['Adecuada', 'Dificultosa']),
        circulation: randomFrom(['Estable', 'Inestable'])
    };
}

function generateVitals(precedence) {
    // Rango por precedencia (aprox.)
    let hrRange, spo2Range, sysRange, diaRange, rrRange;
    if (precedence === 'URG') {
        hrRange = [110, 130];
        spo2Range = [86, 94];
        sysRange = [85, 105];
        diaRange = [50, 70];
        rrRange = [22, 30];
    } else if (precedence === 'PRI') {
        hrRange = [90, 110];
        spo2Range = [90, 97];
        sysRange = [95, 120];
        diaRange = [60, 80];
        rrRange = [18, 24];
    } else { // RUT
        hrRange = [70, 100];
        spo2Range = [95, 100];
        sysRange = [110, 130];
        diaRange = [70, 85];
        rrRange = [12, 20];
    }
    const hr = randInt(hrRange[0], hrRange[1]);
    const spo2 = randInt(spo2Range[0], spo2Range[1]);
    const sys = randInt(sysRange[0], sysRange[1]);
    const dia = randInt(diaRange[0], diaRange[1]);
    const rr = randInt(rrRange[0], rrRange[1]);
    return { hr, spo2, bp: `${sys}/${dia}`, rr };
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildNineLineFromScenario(s) {
    return (
`L1: ${s.line1_location}\n` +
`L2: ${s.line2_freq_callsign}\n` +
`L3: URG ${s.line3_precedence.URG} / PRI ${s.line3_precedence.PRI} / RUT ${s.line3_precedence.RUT}\n` +
`L4: ${s.line4_equipment}\n` +
`L5: Camilla ${s.line5_type.Camilla} / Ambulatorio ${s.line5_type.Ambulatorio}\n` +
`L6: ${s.line6_security}\n` +
`L7: ${s.line7_marking}\n` +
`L8: ${s.line8_nationality}\n` +
`L9: ${s.line9_nbc}\n` +
`Bajas: ${s.casualties.length} (${s.casualties.map(c=>c.category).join(', ')})\n` +
`Notas: ${s.notes}`);
}

function renderScenario(s) {
    if (!elements.scenarioContainer) return;
    elements.scenarioContainer.innerHTML = `
        <div class="scenario-card">
            <h4>${escapeHtml(s.title)}</h4>
            <div class="scenario-grid">
                <div><strong>Emisor</strong> ${escapeHtml(s.emitterRole || 'Helo Uno')}</div>
                <div><strong>Receptor</strong> ${escapeHtml(s.receiverRole || 'Base')}</div>
                <div><strong>L1</strong> ${escapeHtml(s.line1_location)}</div>
                <div><strong>L2</strong> ${escapeHtml(s.line2_freq_callsign)}</div>
                <div><strong>L3</strong> URG ${s.line3_precedence.URG} / PRI ${s.line3_precedence.PRI} / RUT ${s.line3_precedence.RUT}</div>
                <div><strong>L4</strong> ${escapeHtml(s.line4_equipment)}</div>
                <div><strong>L5</strong> Camilla ${s.line5_type.Camilla} / Ambulatorio ${s.line5_type.Ambulatorio}</div>
                <div><strong>L6</strong> ${escapeHtml(s.line6_security)}</div>
                <div><strong>L7</strong> ${escapeHtml(s.line7_marking)}</div>
                <div><strong>L8</strong> ${escapeHtml(s.line8_nationality)}</div>
                <div><strong>L9</strong> ${escapeHtml(s.line9_nbc)}</div>
                <div><strong>Notas</strong> ${escapeHtml(s.notes)}</div>
            </div>
            <div class="casualty-list">
                ${s.casualties.map(c => renderCasualtyCard(c)).join('')}
            </div>
        </div>
    `;

    // Listeners para botones de copiar ficha
    s.casualties.forEach((c) => {
        const btn = document.getElementById(`copyCasualty-${c.id}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const txt = buildCasualtyCardText(c, s);
                copyToClipboard(txt);
                addToHistory('SISTEMA', `Ficha del herido ${c.id} copiada.`, 'system');
            });
        }
    });
}

function renderCasualtyCard(c) {
    return `
    <div class="casualty-card">
        <div class="casualty-header">
            <strong>Herido ${c.id}</strong> — ${c.category} · ${c.precedence} · ${c.type}
            <button id="copyCasualty-${c.id}" class="btn-small" style="float:right;">Copiar ficha</button>
        </div>
        <div class="casualty-body">
            <div class="body-diagram">
                ${renderBodyRegions(c.injuries)}
            </div>
            <div class="casualty-info">
                <div><strong>Lesiones:</strong> ${c.injuries.map(i=>`${i.region} (${i.severity})`).join('; ')}</div>
                <div><strong>Vía aérea:</strong> ${c.airway} · <strong>Resp:</strong> ${c.breathing} · <strong>Circulación:</strong> ${c.circulation}</div>
                <div><strong>Sangrado:</strong> ${c.bleeding} · <strong>Consciente:</strong> ${c.conscious}</div>
                <div><strong>Signos vitales:</strong> FC ${c.vitals.hr} lpm · SpO₂ ${c.vitals.spo2}% · TA ${c.vitals.bp} mmHg · FR ${c.vitals.rr} rpm</div>
            </div>
        </div>
    </div>`;
}

function renderBodyRegions(injuries) {
    const regions = ['Cabeza','Cuello','Tórax','Abdomen','Pelvis','Brazo Izq','Brazo Der','Pierna Izq','Pierna Der'];
    const hurt = new Set(injuries.map(i=>i.region));
    return `
        <div class="diagram-grid">
            ${regions.map(r => `<div class="region ${hurt.has(r)?'hurt':''}" title="${r}">${r}</div>`).join('')}
        </div>
    `;
}

function buildCasualtyCardText(c, s) {
    return (
`Herido ${c.id} — ${c.category} · ${c.precedence} · ${c.type}\n`+
`Lesiones: ${c.injuries.map(i=>`${i.region} (${i.severity})`).join('; ')}\n`+
`Vía aérea: ${c.airway} | Resp: ${c.breathing} | Circ: ${c.circulation} | Sangrado: ${c.bleeding} | Consciente: ${c.conscious}\n`+
`Signos vitales: FC ${c.vitals.hr} lpm | SpO2 ${c.vitals.spo2}% | TA ${c.vitals.bp} mmHg | FR ${c.vitals.rr} rpm\n`+
`Ubicación: ${s.line1_location}\n`+
`Frecuencia/Indicativo: ${s.line2_freq_callsign}`);
}

// Construir mensaje procedimental breve para radio a partir del escenario
function buildProceduralRadioFromScenario(s) {
    const locShort = s.line1_location.split(' - ')[0];
    const parts = [];
    const toWhom = s.receiverRole || 'Base';
    const fromWho = s.emitterRole || 'Helo Uno';
    parts.push(`${toWhom}, aquí ${fromWho} en ${locShort}.`);
    parts.push(`Solicito MEDEVAC: URG ${s.line3_precedence.URG}, PRI ${s.line3_precedence.PRI}, RUT ${s.line3_precedence.RUT}.`);
    parts.push(`Pacientes: Camilla ${s.line5_type.Camilla}, Ambulatorio ${s.line5_type.Ambulatorio}.`);
    if (s.line4_equipment && s.line4_equipment !== 'Ninguno') {
        parts.push(`Equipo requerido: ${s.line4_equipment}.`);
    }
    parts.push(`Señalización ${s.line7_marking}. Seguridad: ${s.line6_security}.`);
    parts.push('Cambio.');
    return parts.join(' ');
}
function renderBodyRegions(injuries) {
    const regions = ['Cabeza','Cuello','Tórax','Abdomen','Pelvis','Brazo Izq','Brazo Der','Pierna Izq','Pierna Der'];
    const hurt = new Set(injuries.map(i=>i.region));
    return `
        <div class="diagram-grid">
            ${regions.map(r => `<div class="region ${hurt.has(r)?'hurt':''}" title="${r}">${r}</div>`).join('')}
        </div>
    `;
}

function buildCasualtyCardText(c, s) {
    return (
`Herido ${c.id} — ${c.category} · ${c.precedence} · ${c.type}\n`+
`Lesiones: ${c.injuries.map(i=>`${i.region} (${i.severity})`).join('; ')}\n`+
`Vía aérea: ${c.airway} | Resp: ${c.breathing} | Circ: ${c.circulation} | Sangrado: ${c.bleeding} | Consciente: ${c.conscious}\n`+
`Signos vitales: FC ${c.vitals.hr} lpm | SpO2 ${c.vitals.spo2}% | TA ${c.vitals.bp} mmHg | FR ${c.vitals.rr} rpm\n`+
`Ubicación: ${s.line1_location}\n`+
`Frecuencia/Indicativo: ${s.line2_freq_callsign}`);
}

// Construir mensaje procedimental breve para radio a partir del escenario
function buildProceduralRadioFromScenario(s) {
    const locShort = s.line1_location.split(' - ')[0];
    const parts = [];
    const toWhom = s.receiverRole || 'Base';
    const fromWho = s.emitterRole || 'Helo Uno';
    parts.push(`${toWhom}, aquí ${fromWho} en ${locShort}.`);
    parts.push(`Solicito MEDEVAC: URG ${s.line3_precedence.URG}, PRI ${s.line3_precedence.PRI}, RUT ${s.line3_precedence.RUT}.`);
    parts.push(`Pacientes: Camilla ${s.line5_type.Camilla}, Ambulatorio ${s.line5_type.Ambulatorio}.`);
    if (s.line4_equipment && s.line4_equipment !== 'Ninguno') {
        parts.push(`Equipo requerido: ${s.line4_equipment}.`);
    }
    parts.push(`Señalización ${s.line7_marking}. Seguridad: ${s.line6_security}.`);
    parts.push('Cambio.');
    return parts.join(' ');
}
