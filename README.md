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
