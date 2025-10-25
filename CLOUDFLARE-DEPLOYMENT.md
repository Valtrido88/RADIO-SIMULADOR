# 🌐 Guía de Deployment en Cloudflare Pages

Esta guía te ayudará a publicar tu Simulador de Radio MEDEVAC en **Cloudflare Pages** de forma **gratuita y rápida**.

## 🎯 ¿Por qué Cloudflare Pages?

- ✅ **Completamente gratis** para proyectos ilimitados
- ✅ **CDN global** ultra rápido
- ✅ **SSL automático** (HTTPS)
- ✅ **Custom domains** gratis
- ✅ **Builds automáticos** desde GitHub
- ✅ **Hosting ilimitado**
- ✅ **No requiere tarjeta de crédito**

## 🚀 Opción 1: Deploy Directo desde GitHub (Recomendado)

### Paso 1: Prepara tu repositorio
Tu repositorio ya está listo con todos los archivos necesarios.

### Paso 2: Conecta con Cloudflare Pages

1. **Ve a Cloudflare Pages:**
   - Abre [dash.cloudflare.com](https://dash.cloudflare.com)
   - Si no tienes cuenta, créala gratis (solo necesitas email)
   
2. **Crea un nuevo proyecto:**
   - Click en **"Pages"** en el menú lateral
   - Click en **"Create a project"**
   - Selecciona **"Connect to Git"**

3. **Conecta tu repositorio GitHub:**
   - Autoriza Cloudflare a acceder a GitHub
   - Selecciona el repositorio: `Valtrido88/RADIO-SIMULADOR`
   - Click en **"Begin setup"**

### Paso 3: Configura el Build

En la pantalla de configuración, usa estos valores:

```
Project name: radio-simulador-medevac
Production branch: main
Build command: (dejar vacío)
Build output directory: web
```

**Configuración detallada:**
- **Framework preset:** None
- **Build command:** (vacío, no necesitamos build)
- **Build output directory:** `web`
- **Root directory:** (vacío)
- **Environment variables:** (ninguna necesaria)

### Paso 4: Deploy

1. Click en **"Save and Deploy"**
2. Espera 1-2 minutos mientras Cloudflare despliega tu sitio
3. ¡Listo! Tu simulador estará disponible en:
   ```
   https://radio-simulador-medevac.pages.dev
   ```

### Paso 5: Comparte con tu equipo

Tu simulador ahora está disponible en:
```
https://radio-simulador-medevac.pages.dev
```

Comparte este link con tus compañeros para que entrenen.

---

## 🌐 Opción 2: Usar un Dominio Personalizado

Si quieres usar un dominio propio como `www.medevacsimulator.es`:

### Si NO tienes el dominio todavía:

1. **Compra el dominio en Cloudflare:**
   - Ve a **Domain Registration** en Cloudflare
   - Busca `medevacsimulator.es` o el que prefieras
   - Cómpralo (desde ~$10/año)
   
2. **Conecta el dominio a tu proyecto:**
   - Ve a tu proyecto en **Pages**
   - Click en **"Custom domains"**
   - Click en **"Set up a custom domain"**
   - Escribe: `www.medevacsimulator.es`
   - Cloudflare lo configurará automáticamente
   - En 5-10 minutos estará activo

### Si YA tienes el dominio en otro registrar:

1. **Agrega el dominio a Cloudflare:**
   - Ve a **"Websites"** en Cloudflare Dashboard
   - Click en **"Add a site"**
   - Ingresa tu dominio: `medevacsimulator.es`
   - Sigue los pasos para cambiar los nameservers
   
2. **Actualiza los nameservers en tu registrar:**
   Cloudflare te dará 2 nameservers como:
   ```
   amelie.ns.cloudflare.com
   otis.ns.cloudflare.com
   ```
   Cópialos y pégalos en la configuración DNS de tu registrar.

3. **Conecta el dominio a Pages:**
   - Ve a tu proyecto Pages
   - Click en **"Custom domains"**
   - Agrega: `www.medevacsimulator.es` o `medevacsimulator.es`
   - Cloudflare creará los registros DNS automáticamente

### Si quieres un dominio GRATIS:

Cloudflare Pages te da un subdominio gratis:
```
https://radio-simulador-medevac.pages.dev
```

También puedes usar servicios gratuitos como:
- **Freenom** (dominios .tk, .ml, .ga gratis)
- **EU.org** (subdominio .eu.org gratis)

Luego conectarlos a Cloudflare siguiendo los pasos de arriba.

---

## 🔄 Actualizaciones Automáticas

Una vez conectado, **cada vez que hagas push a GitHub**:
1. Cloudflare detecta el cambio automáticamente
2. Rebuilds y redeploys tu sitio
3. En 1-2 minutos, los cambios están en vivo

No necesitas hacer nada manual.

---

## 📊 Monitoreo y Analytics

Cloudflare te da gratis:
- **Web Analytics** (visitas, páginas, países)
- **Performance metrics** (velocidad de carga)
- **Uptime monitoring** (disponibilidad 24/7)

Para activarlos:
1. Ve a tu proyecto en Pages
2. Click en **"Analytics"**
3. Activa **"Web Analytics"**

---

## 🛠️ Configuración Avanzada

### Variables de Entorno
Si necesitas variables (opcional):
1. Ve a **Settings → Environment variables**
2. Agrega las que necesites
3. Redeploys automáticamente

### Preview Deployments
Cloudflare crea automáticamente URLs de preview para cada Pull Request:
```
https://abc123.radio-simulador-medevac.pages.dev
```

### Rollbacks
Si algo sale mal:
1. Ve a **Deployments**
2. Selecciona un deployment anterior
3. Click en **"Rollback to this deployment"**

---

## 🔒 Seguridad y Headers

El archivo `_headers` ya está configurado con:
- ✅ Content Security Policy
- ✅ XSS Protection
- ✅ Frame Options
- ✅ Cache Control optimizado

Cloudflare los aplicará automáticamente.

---

## ❓ Troubleshooting

### "Build failed"
- Verifica que `Build output directory` sea: `web`
- Verifica que `Build command` esté vacío
- El proyecto es HTML puro, no necesita build

### "404 Not Found"
- Asegúrate que el archivo `index.html` esté en la carpeta `web/`
- Verifica que `Build output directory` apunte a `web`

### "Dominio no funciona"
- Espera 5-10 minutos para propagación DNS
- Verifica que los nameservers estén correctos
- Usa [whatsmydns.net](https://whatsmydns.net) para verificar propagación

### "Cambios no se ven"
- Limpia caché del navegador (Ctrl+Shift+R)
- Ve a Cloudflare → Caching → Purge Cache
- Espera 1-2 minutos

---

## 📞 Soporte

- **Documentación oficial:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Comunidad:** [community.cloudflare.com](https://community.cloudflare.com)
- **Status:** [cloudflarestatus.com](https://cloudflarestatus.com)

---

## 💡 Ejemplo de URLs

Una vez deployado, tendrás:

**URL automática (gratis):**
```
https://radio-simulador-medevac.pages.dev
```

**Con dominio propio:**
```
https://www.medevacsimulator.es
https://medevacsimulator.es
```

**Preview branches:**
```
https://branch-name.radio-simulador-medevac.pages.dev
```

---

## 🎓 Resumen: Pasos Mínimos

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Create project → Connect GitHub
3. Selecciona: `Valtrido88/RADIO-SIMULADOR`
4. Build output: `web`
5. Deploy
6. ¡Listo! Comparte: `https://radio-simulador-medevac.pages.dev`

---

**¡Tu equipo ya puede entrenar desde cualquier lugar con internet!** 🚁📻
