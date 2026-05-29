const cron = require("node-cron");
const Animal = require("../models/Animal");
const { diffInDays, startOfDay } = require("../utils/date");

/** Actualiza hembras gestantes a preparto cuando faltan <= 15 días para el parto. */
async function actualizarEstadosPreparto() {
  const hoy = startOfDay(new Date());
  const gestantes = await Animal.find({
    activo: true,
    sexo: "hembra",
    estadoReproductivo: "gestante",
    fechaProbableParto: { $exists: true, $ne: null },
  });

  let updated = 0;
  for (const a of gestantes) {
    const dias = diffInDays(startOfDay(a.fechaProbableParto), hoy);
    if (dias <= 15 && dias >= 0 && a.estadoReproductivo !== "preparto") {
      a.estadoReproductivo = "preparto";
      await a.save();
      updated += 1;
    }
  }
  if (updated) console.log(`[cron] ${updated} animal(es) pasaron a preparto`);
}

function startCronJobs() {
  // Diario 06:00 (hora local del servidor)
  cron.schedule("0 6 * * *", () => {
    actualizarEstadosPreparto().catch((e) => console.error("[cron] preparto:", e));
  });
  // Al iniciar, una pasada
  actualizarEstadosPreparto().catch((e) => console.error("[cron] preparto init:", e));
}

module.exports = { startCronJobs, actualizarEstadosPreparto };
