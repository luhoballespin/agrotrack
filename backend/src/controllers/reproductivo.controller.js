const Animal = require("../models/Animal");
const EventoReproductivo = require("../models/EventoReproductivo");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");
const { calcularProbableParto } = require("../utils/reproduccion");

const listReproductivoByAnimal = asyncHandler(async (req, res) => {
  const { animalId } = req.params;
  const items = await EventoReproductivo.find({ animalId }).sort({ fecha: -1 }).lean();
  return ok(res, items, "Historial reproductivo");
});

const createEventoReproductivo = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { animalId, tipo, fecha } = body;
  if (!animalId) return fail(res, 400, "animalId es requerido");
  if (!tipo) return fail(res, 400, "tipo es requerido");
  if (!fecha) return fail(res, 400, "fecha es requerida");

  const animal = await Animal.findById(animalId);
  if (!animal) return fail(res, 404, "Animal no encontrado");

  const evt = await EventoReproductivo.create({
    ...body,
    fecha: new Date(fecha),
  });

  // Sincronización básica con el estado del Animal (para consistencia y escalabilidad)
  if (animal.sexo === "hembra") {
    if (tipo === "deteccion_celo") {
      animal.estadoReproductivo = "en_celo";
      animal.fechaUltimoCelo = new Date(fecha);
    }

    if (tipo === "servicio_natural" || tipo === "inseminacion_artificial") {
      animal.estadoReproductivo = "servida";
      animal.fechaUltimoServicio = new Date(fecha);
      animal.fechaProbableParto = calcularProbableParto(animal.especie, fecha);
    }

    if (tipo === "diagnostico_gestacion") {
      const r = (body.resultado || "").toLowerCase();
      if (r.includes("positivo")) animal.estadoReproductivo = "gestante";
      if (r.includes("negativo")) animal.estadoReproductivo = "vacia";
    }

    if (tipo === "parto") {
      animal.fechaUltimoParto = new Date(fecha);
      animal.totalPartos = (animal.totalPartos || 0) + 1;
      animal.estadoReproductivo = "lactando";
      animal.fechaProbableParto = undefined;
    }

    if (tipo === "aborto") {
      animal.estadoReproductivo = "vacia";
      animal.fechaProbableParto = undefined;
    }

    await animal.save();
  }

  return ok(res, { evento: evt, animal }, "Evento reproductivo creado");
});

// Endpoint solicitado: PUT /api/animales/:id/reproduccion
const updateReproduccionAnimal = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const animal = await Animal.findById(req.params.id);
  if (!animal) return fail(res, 404, "Animal no encontrado");
  if (animal.sexo !== "hembra") return fail(res, 400, "Solo aplica a hembras");

  const {
    estadoReproductivo,
    fechaUltimoCelo,
    fechaUltimoServicio,
    fechaUltimoParto,
  } = body;

  if (estadoReproductivo) animal.estadoReproductivo = estadoReproductivo;
  if (fechaUltimoCelo) animal.fechaUltimoCelo = new Date(fechaUltimoCelo);
  if (fechaUltimoServicio) {
    animal.fechaUltimoServicio = new Date(fechaUltimoServicio);
    // Si se está registrando servicio, recalcular probable parto
    animal.fechaProbableParto = calcularProbableParto(animal.especie, animal.fechaUltimoServicio);
    if (!estadoReproductivo) animal.estadoReproductivo = "servida";
  }
  if (fechaUltimoParto) animal.fechaUltimoParto = new Date(fechaUltimoParto);

  await animal.save();
  return ok(res, animal, "Reproducción actualizada");
});

module.exports = { listReproductivoByAnimal, createEventoReproductivo, updateReproduccionAnimal };

