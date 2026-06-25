# AgroTrack

Sistema de gestión ganadera integral para **bovinos, equinos, ovinos y porcinos** (establecimiento mixto, 50–200 animales, un único administrador).

## Requisitos

- Node.js 20+ (funciona también en Node 24)
- MongoDB (Atlas o local)

## 1. Configurar variables de entorno

Copiá `backend/.env.example` → `backend/.env` y completá:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agrotrack
JWT_SECRET=un_secreto_largo_minimo_32_caracteres
JWT_EXPIRES_IN=7d
ADMIN_USER=admin
ADMIN_PASS=admin123
FRONTEND_URL=http://localhost:5173
# Cloudinary (opcional; sin esto las fotos se omiten)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend (opcional, el proxy de Vite ya apunta al backend):

```bash
cp frontend/.env.example frontend/.env
# VITE_API_URL=   (vacío = usa proxy /api → localhost:5000)
```

## 2. Instalar dependencias

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Cargar datos de prueba (seed)

```bash
cd backend
npm run seed
```

Crea **12 animales** (3 por especie), pesos, eventos sanitarios/reproductivos y un plan de alimentación.

## 4. Levantar servidores

**Terminal 1 – Backend:**

```bash
cd backend
npm run dev
```

Verificá: http://localhost:5000/api/health → `{ "success": true, ... }`

**Terminal 2 – Frontend:**

```bash
cd frontend
npm run dev
```

Abrí: http://localhost:5173

## 5. Probar el flujo completo

| Paso | Acción |
|------|--------|
| 1 | Login con `ADMIN_USER` / `ADMIN_PASS` del `.env` |
| 2 | **Dashboard**: alertas rojas/naranjas, totales por especie, partos y celo |
| 3 | **Animales**: filtros por especie/sexo/estado; abrir un animal |
| 4 | **Perfil animal**: registrar peso, evento sanitario, celo/servicio/parto |
| 5 | Al registrar **servicio/IA**: ver fecha probable de parto (preview + guardado) |
| 6 | **Sanitario**: timeline + calendario predefinido por especie |
| 7 | **Reproducción**: hembras gestantes y estados |
| 8 | **Calculadora**: calcular plan → guardar en un bovino/porcino → ver en pestaña Alimentación |

## API principal

| Método | Ruta |
|--------|------|
| POST | `/api/auth/login` |
| GET | `/api/dashboard` |
| GET/POST | `/api/animales` |
| PUT | `/api/animales/:id/reproduccion` |
| POST | `/api/pesos` |
| GET/POST | `/api/sanitario` |
| GET/POST | `/api/reproductivo` |
| POST | `/api/calculadora` |
| POST/GET | `/api/alimentacion/:animalId` |
| GET | `/api/calendario-sanitario?especie=bovino` |

Todas las rutas `/api/*` (excepto `/api/auth/login` y `/api/health`) requieren header:

`Authorization: Bearer <token>`

## Notas

- **Soft delete**: `DELETE /api/animales/:id` marca `activo: false`.
- **Cron** (node-cron): cada día a las 06:00 y al iniciar, pasa hembras gestantes a `preparto` si faltan ≤15 días para el parto.
- **Cloudinary**: opcional; sin credenciales el sistema funciona igual (sin subida de fotos).

## Despliegue a producción

Arquitectura recomendada:

- **Backend**: Render Web Service (`backend/`)
- **Frontend**: Vercel (`frontend/`)
- **Base de datos**: MongoDB Atlas
- **Imágenes**: Cloudinary

### 1. MongoDB Atlas

En Atlas:

1. Crear cluster.
2. Crear usuario en **Database Access**.
3. En **Network Access**, permitir acceso desde Render. Para empezar en free tier podés usar `0.0.0.0/0`.
4. Copiar la URI:

```env
mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/agrotrack?retryWrites=true&w=majority
```

### 2. Backend en Render

Opción A: usar `render.yaml` desde el repo.

Opción B: crear servicio manual:

- **Service Type**: Web Service
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

Variables de entorno en Render:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=generar_un_secreto_largo_minimo_32_caracteres
JWT_EXPIRES_IN=7d
ADMIN_USER=admin
ADMIN_PASS=contraseña_segura
FRONTEND_URL=https://tu-frontend.vercel.app
ALLOW_VERCEL_PREVIEWS=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cuando Render termine, probá:

```text
https://tu-backend.onrender.com/api/health
```

### 3. Frontend en Vercel

En Vercel:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Variable de entorno:

```env
VITE_API_URL=https://tu-backend.onrender.com
```

Después de obtener la URL final de Vercel, volver a Render y actualizar:

```env
FRONTEND_URL=https://tu-frontend.vercel.app
```

Luego redeploy del backend.

### 4. Seed en producción

Ejecutar seed solo si querés cargar datos demo en la base de producción.

En Render podés abrir **Shell** y correr:

```bash
npm run seed
```

Si preferís no cargar demo, creá animales desde la app.

### 5. Checklist final

- `/api/health` responde en Render.
- Vercel tiene `VITE_API_URL` con la URL de Render.
- Render tiene `FRONTEND_URL` con la URL de Vercel.
- MongoDB Atlas permite conexiones desde Render.
- `.env` real no está versionado.
