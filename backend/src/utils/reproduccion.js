const { REPRODUCCION } = require("./constantesReproduccion");
const { addDays } = require("./date");

function calcularProbableParto(especie, fechaServicio) {
  const cfg = REPRODUCCION[especie];
  if (!cfg) throw new Error(`Especie inválida: ${especie}`);
  return addDays(new Date(fechaServicio), cfg.gestacionDias);
}

module.exports = { calcularProbableParto };

