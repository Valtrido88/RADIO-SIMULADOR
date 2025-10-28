export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(request) });
      }
      const hasGemini = Boolean(env.GEMINI_API_KEY);
      const hasEleven = Boolean(env.ELEVENLABS_API_KEY);
      const data = { ok: hasGemini || hasEleven, services: { gemini: hasGemini, elevenlabs: hasEleven } };
      return jsonResponse(data, request);
    }

    if (url.pathname === '/api/tts') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(request) });
      }
      try {
        const { text = '', voiceGender = 'male' } = await request.json();
        if (!text || typeof text !== 'string') return new Response('Bad Request', { status: 400, headers: corsHeaders(request) });
        const apiKey = env.ELEVENLABS_API_KEY;
        if (!apiKey) return new Response('Missing ELEVENLABS_API_KEY', { status: 500, headers: corsHeaders(request) });

        const voiceIds = { male: 'pNInz6obpgDQGcFmaJgB', female: 'EXAVITQu4vr4xnSDxMaL' };
        const voiceId = voiceIds[voiceGender] || voiceIds.male;

        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true }
          })
        });
        if (!r.ok) {
          const t = await r.text();
          return new Response(`Eleven Labs error ${r.status}: ${t}` , { status: 502, headers: corsHeaders(request) });
        }
        const audioArrayBuffer = await r.arrayBuffer();
        return new Response(audioArrayBuffer, { status: 200, headers: { 'Content-Type': 'audio/mpeg', ...corsHeaders(request) } });
      } catch (err) {
        return new Response(String(err), { status: 500, headers: corsHeaders(request) });
      }
    }

    if (url.pathname === '/api/generate-scenario') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(request) });
      }
      try {
        const { difficulty = 'intermedio', prompt: clientPrompt, frequency = 121.5, emitterRole = 'Helo Uno', receiverRole = 'Base' } = await request.json();

        const difficultyMap = { facil: 'fácil', intermedio: 'intermedia', dificil: 'difícil', aleatorio: 'aleatoria' };
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

        const prompt = clientPrompt ||
`Eres un generador de escenarios MEDEVAC para entrenamiento de radio táctico en español.
Debes crear un ÚNICO escenario con entre 1 y 4 bajas, adecuado a una dificultad ${difficultyMap[difficulty] || 'intermedia'}.
RESPONDE EXCLUSIVAMENTE con un JSON válido, sin texto adicional.

Estructura exacta esperada (usa estos nombres de campos y valores permitidos):
{
  "title": string,
  "line1_location": string,
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

        // Llamada a Gemini
        const model = 'gemini-1.5-flash';
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) return new Response('Missing GEMINI_API_KEY', { status: 500, headers: corsHeaders(request) });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const body = { contents: [ { role: 'user', parts: [ { text: prompt } ] } ], generationConfig: { temperature: 0.9 } };
        const r = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) {
          const t = await r.text();
          return new Response(`Gemini error ${r.status}: ${t}`, { status: 502, headers: corsHeaders(request) });
        }
        const data = await r.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const raw = JSON.parse(extractFirstJson(text));

        // Normalización
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
          vitals: c.vitals && typeof c.vitals === 'object' ? c.vitals : defaultVitals(c.precedence || 'PRI')
        }));

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
          line1_location: raw.line1_location || 'LZ Bravo - Coordenadas 4.123, -74.123',
          line2_freq_callsign: `${Number(frequency).toFixed(3)} MHz / Indicativo: ${emitterRole}`,
          line3_precedence: { URG: urg, PRI: pri, RUT: rut },
          line4_equipment: raw.line4_equipment,
          line5_type: { Camilla: lit, Ambulatorio: amb },
          line6_security: raw.line6_security,
          line7_marking: raw.line7_marking,
          line8_nationality: buildLine8FromCategories(agg.category),
          line9_nbc: raw.line9_nbc,
          emitterRole,
          receiverRole,
          casualties,
          notes: raw.notes || ''
        };

        return jsonResponse(scenario, request);
      } catch (err) {
        return new Response(String(err), { status: 500, headers: corsHeaders(request) });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(data, request) {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(request) } });
}

function extractFirstJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('No JSON found in response');
  return text.slice(start, end + 1);
}

function defaultVitals(precedence) {
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  let hrRange, spo2Range, sysRange, diaRange, rrRange;
  if (precedence === 'URG') { hrRange=[110,130]; spo2Range=[86,94]; sysRange=[85,105]; diaRange=[50,70]; rrRange=[22,30]; }
  else if (precedence === 'PRI') { hrRange=[90,110]; spo2Range=[90,97]; sysRange=[95,120]; diaRange=[60,80]; rrRange=[18,24]; }
  else { hrRange=[70,100]; spo2Range=[95,100]; sysRange=[110,130]; diaRange=[70,85]; rrRange=[12,20]; }
  const hr = rand(...hrRange); const spo2 = rand(...spo2Range); const sys = rand(...sysRange); const dia = rand(...diaRange); const rr = rand(...rrRange);
  return { hr, spo2, bp: `${sys}/${dia}`, rr };
}

function buildLine8FromCategories(catAgg) {
  const parts = [];
  if (catAgg.Militar) parts.push(`${catAgg.Militar} Militar(es) Aliado(s)`);
  if (catAgg.Civil) parts.push(`${catAgg.Civil} Civil(es)`);
  if (catAgg.EPW) parts.push(`${catAgg.EPW} Prisionero(s) de guerra (EPW)`);
  return parts.length ? parts.join(', ') : 'Pendiente de confirmar';
}
