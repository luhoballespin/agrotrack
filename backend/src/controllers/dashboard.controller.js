const Animal = require("../models/Animal");
const EventoSanitario = require("../models/EventoSanitario");
const RegistroPeso = require("../models/RegistroPeso");
const { ok } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");
const { generarAlertas } = require("../utils/alertas");
const { ownerFilter } = require("../utils/ownership");

const getDashboard = asyncHandler(async (req, res) => {
  const hoy = new Date();

  const animales = await Animal.find(ownerFilter(req, { activo: true })).lean();
  const hembras = animales.filter((a) => a.sexo === "hembra");

  const totalPorEspecie = animales.reduce((acc, a) => {
    acc[a.especie] = (acc[a.especie] || 0) + 1;
    return acc;
  }, {});

  const { alertasSanitarias, alertasReproductivas, alertasGenerales, alertasTodas } =
    await generarAlertas({ Animal, EventoSanitario }, hoy, req);

  const proximosPartos = hembras
    .filter(
      (h) =>
        ["gestante", "preparto"].includes(h.estadoReproductivo) && h.fechaProbableParto
    )
    .sort((a, b) => new Date(a.fechaProbableParto) - new Date(b.fechaProbableParto))
    .slice(0, 20);

  const animalesEnCelo = hembras.filter((h) => h.estadoReproductivo === "en_celo").slice(0, 50);

  const ultimosRegistrosPeso = await RegistroPeso.find(ownerFilter(req))
    .sort({ fecha: -1 })
    .limit(20)
    .lean();

  return ok(
    res,
    {
      totalPorEspecie,
      alertas: alertasTodas,
      alertasSanitarias,
      alertasReproductivas,
      alertasGenerales,
      proximosPartos,
      animalesEnCelo,
      ultimosRegistrosPeso,
    },
    "Dashboard"
  );
});

module.exports = { getDashboard };
