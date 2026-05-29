const PlanAlimentacion = require("../models/PlanAlimentacion");
const Animal = require("../models/Animal");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");

const createPlan = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { animalId } = body;
  if (!animalId) return fail(res, 400, "animalId es requerido");

  const animal = await Animal.findById(animalId).lean();
  if (!animal) return fail(res, 404, "Animal no encontrado");
  if (!["bovino", "porcino"].includes(animal.especie)) {
    return fail(res, 400, "Plan de alimentación solo aplica a bovinos y porcinos");
  }

  // Solo un plan activo por animal
  await PlanAlimentacion.updateMany({ animalId, activo: true }, { $set: { activo: false } });

  const doc = await PlanAlimentacion.create({
    ...body,
    especie: animal.especie,
    activo: true,
  });

  return ok(res, doc, "Plan de alimentación guardado");
});

const getPlanActivo = asyncHandler(async (req, res) => {
  const { animalId } = req.params;
  const plan = await PlanAlimentacion.findOne({ animalId, activo: true }).sort({ createdAt: -1 }).lean();
  if (!plan) return ok(res, null, "Sin plan activo");
  return ok(res, plan, "Plan activo");
});

module.exports = { createPlan, getPlanActivo };

