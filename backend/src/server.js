const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDB } = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");
const { fail, ok } = require("./utils/response");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => ok(res, { status: "ok" }, "AgroTrack OK"));

// Routes (se cargan después para usar middleware auth en /api/*)
const authRoutes = require("./routes/auth.routes");
const animalesRoutes = require("./routes/animales.routes");
const pesosRoutes = require("./routes/pesos.routes");
const sanitarioRoutes = require("./routes/sanitario.routes");
const reproductivoRoutes = require("./routes/reproductivo.routes");
const calculadoraRoutes = require("./routes/calculadora.routes");
const alimentacionRoutes = require("./routes/alimentacion.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const calendarioRoutes = require("./routes/calendario.routes");
const { authMiddleware } = require("./middleware/auth");
const { startCronJobs } = require("./jobs/cronJobs");

app.use("/api/auth", authRoutes);
app.use("/api", authMiddleware);
app.use("/api/animales", animalesRoutes);
app.use("/api/pesos", pesosRoutes);
app.use("/api/sanitario", sanitarioRoutes);
app.use("/api/reproductivo", reproductivoRoutes);
app.use("/api/calculadora", calculadoraRoutes);
app.use("/api/calendario-sanitario", calendarioRoutes);
app.use("/api/alimentacion", alimentacionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => fail(res, 404, "Ruta no encontrada"));

app.use((err, req, res, next) => {
  console.error(err);
  return fail(res, err.status || 500, err.message || "Error interno");
});

async function start() {
  await connectDB();
  initCloudinary();
  startCronJobs();

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Backend escuchando en :${port}`));
}

start().catch((e) => {
  console.error("Error iniciando servidor:", e);
  process.exit(1);
});

