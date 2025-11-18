# 🚀 Asesoría Prevención CRM - Deployment Guide

## 🔧 Requisitos previos en Render

### Variables de entorno obligatorias

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=10000
APP_NAME=Asesoría Prevención CRM
APP_URL=https://tu-servicio.onrender.com
JWT_SECRET=tu-secret-seguro-aqui
JWT_EXPIRATION=7d
```

### Configuración del servicio

- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npm run start:prod`
- **Node Version:** 20.x (especificada en .nvmrc)

---

## 🐛 Troubleshooting - Error "Exited with status 1"

### Paso 1: Verificar logs completos

En Render Dashboard → Tu servicio → Logs, busca:

```
==> Building...
==> Running build command
[AQUÍ VERÁS EL ERROR ESPECÍFICO]
Exited with status 1
```

### Paso 2: Errores comunes y soluciones

#### ❌ Error: "DATABASE_URL is not defined"
**Solución:** Agregar DATABASE_URL en Environment variables

#### ❌ Error: "Cannot find module '@prisma/client'"
**Solución:** 
- Verificar que `prisma` esté en dependencies (no devDependencies)
- Verificar que el build command incluya `npx prisma generate`

#### ❌ Error: "ECONNREFUSED" o "Connection timeout"
**Causas posibles:**
1. DATABASE_URL incorrecta
2. Base de datos de Supabase no accesible desde Render
3. Necesitas agregar la IP de Render al whitelist de Supabase

**Solución Supabase:**
1. Ve a Supabase Dashboard
2. Settings → Database → Connection pooling
3. Usa la "Connection string" de **Connection pooling** (no la directa)
4. El formato debe ser: `postgresql://postgres.xxx:[YOUR-PASSWORD]@xxx.pooler.supabase.com:6543/postgres`

#### ❌ Error: "Port 10000 is already in use"
**Solución:** Render maneja esto automáticamente, pero verifica que:
- La variable PORT esté configurada como 10000
- El código escuche en `process.env.PORT`

#### ❌ Error: "Cannot find module './dist/src/main'"
**Solución:**
- El build no se completó correctamente
- Verifica que no haya errores TypeScript en el código
- Verifica que tsconfig.json esté configurado correctamente

### Paso 3: Validar localmente antes de deploy

```bash
# 1. Instalar dependencias
npm ci

# 2. Generar Prisma Client
npx prisma generate

# 3. Build
npm run build

# 4. Verificar que dist/ existe y tiene contenido
ls -la dist/src/

# 5. Probar start prod localmente
npm run start:prod
```

---

## ✅ Checklist de deploy exitoso

```
☑ Variables de entorno configuradas en Render
☑ DATABASE_URL apunta a Supabase (con pooling)
☑ Build command correcto en render.yaml
☑ Start command correcto
☑ .nvmrc presente (Node 20)
☑ prisma en dependencies (no solo en devDependencies)
☑ Código committeado y pusheado a GitHub
☑ Branch correcto seleccionado en Render
```

---

## 📊 Logs esperados en deploy exitoso

```
Nov 18 07:55:00 PM  ==> Cloning from GitHub...
Nov 18 07:55:05 PM  ==> Running build command: npm ci && npx prisma generate && npm run build
Nov 18 07:55:10 PM  npm ci
Nov 18 07:55:30 PM  ✅ Prisma Client generated successfully
Nov 18 07:55:40 PM  ✅ Build completed
Nov 18 07:55:45 PM  ==> Starting service with: npm run start:prod
Nov 18 07:55:50 PM  ✅ Variables de entorno validadas
Nov 18 07:55:51 PM  🔄 Conectando a base de datos...
Nov 18 07:55:52 PM  ✅ Conexión a base de datos establecida
Nov 18 07:55:53 PM  ✅ CORS configurado
Nov 18 07:55:54 PM  ✅ Pipes de validación configurados
Nov 18 07:55:55 PM  ✅ Swagger documentación configurada
Nov 18 07:55:56 PM  🚀 Application listening on port 10000
```

---

## 🔍 Comandos útiles para debugging

### Ver estado del servicio
```bash
curl https://tu-servicio.onrender.com/api/health
```

### Respuesta esperada
```json
{
  "status": "healthy",
  "service": "Asesoría Prevención CRM",
  "database": "connected",
  "uptime": 123,
  "timestamp": "2024-11-18T...",
  "environment": "production"
}
```

---

## 📞 Soporte

Si el problema persiste:
1. Copia los logs completos de Render
2. Incluye el error específico
3. Verifica las variables de entorno
4. Verifica la conexión a Supabase

---

## 🔗 Enlaces útiles

- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Prisma Docs - Deploy](https://www.prisma.io/docs/guides/deployment)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
