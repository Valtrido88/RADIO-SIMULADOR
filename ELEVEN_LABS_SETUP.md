# Configuración de Eleven Labs para Radio MEDEVAC

## 🎤 Integración de Voces Ultra Realistas

Este simulador ahora soporta **Eleven Labs** para generar voces extremadamente realistas que mejoran la experiencia de entrenamiento.

## 📝 Cómo Obtener tu API Key de Eleven Labs

### Paso 1: Crear una Cuenta
1. Ve a [elevenlabs.io](https://elevenlabs.io)
2. Haz clic en "Sign Up" (Registrarse)
3. Crea tu cuenta (puedes usar Google o email)

### Paso 2: Obtener tu API Key
1. Una vez dentro, ve a tu **perfil** (esquina superior derecha)
2. Selecciona **"Profile Settings"** o **"API Keys"**
3. Copia tu API Key (comienza con `sk_...`)

### Paso 3: Configurar en el Simulador
1. Abre el simulador de radio
2. Busca el campo **"API Key Eleven Labs"** en la sección de controles de audio
3. Pega tu API key
4. Haz clic en **"Guardar API Key"**
5. Verás el mensaje ✓ confirmando que está guardada

## 🎯 Voces Disponibles

El simulador usa dos voces profesionales de Eleven Labs:

- **Voz Masculina**: Adam (voz profunda y clara, ideal para operador militar)
- **Voz Femenina**: Bella (voz clara y profesional, ideal para controladora)

Puedes cambiar entre ellas usando el selector **"Voz Operador"**.

## 💡 Características

✅ **Voces ultra realistas** - Mucho más naturales que la síntesis del navegador
✅ **Efectos de radio** - Estática antes y después de cada transmisión
✅ **Respuestas automáticas** - La "base" te responde después de tu transmisión
✅ **Fallback automático** - Si no hay API key, usa la voz del navegador

## 🔒 Seguridad

- Tu API key se guarda localmente en tu navegador (localStorage)
- No se envía a ningún servidor excepto a Eleven Labs
- Puedes eliminarla en cualquier momento borrando el campo y guardando vacío

## 💰 Costos

Eleven Labs ofrece:
- **Plan Gratuito**: 10,000 caracteres/mes (suficiente para práctica básica)
- **Plan Starter**: $5/mes - 30,000 caracteres
- **Plan Creator**: $22/mes - 100,000 caracteres

Cada respuesta usa aproximadamente 50-100 caracteres, así que con el plan gratuito puedes hacer ~100-200 transmisiones al mes.

## 🆘 Solución de Problemas

### No funciona la voz
- Verifica que tu API key sea correcta
- Asegúrate de tener caracteres disponibles en tu cuenta
- Revisa la consola del navegador (F12) para ver errores

### Error de CORS
- Las llamadas se hacen directamente desde el navegador, no debería haber problemas de CORS
- Si los hay, contacta al desarrollador

### Sin API Key
- El simulador funcionará normalmente usando la síntesis de voz del navegador
- La calidad será menor pero totalmente funcional

## 🎓 Uso Recomendado

Para mejor experiencia de entrenamiento:
1. Configura Eleven Labs con tu API key
2. Usa auriculares para mejor inmersión
3. Ajusta el volumen según prefieras
4. Practica los protocolos MEDEVAC reales

---

**¿Listo para entrenar con voces ultra realistas?** 
Configura tu API key y comienza a practicar comunicaciones MEDEVAC como un profesional. 🚁
