const Animal = require("../models/Animal");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");
const { calcularPlan } = require("../utils/calculadoraAlimento");
const { ownerFilter } = require("../utils/ownership");

const calcular = asyncHandler(async (req, res) => {
  const body = req.body || {};
  let { pesoActual, pesoObjetivo, diasDisponibles, especie, modo, objetivo, animalId } = body;

  if (animalId) {
    const animal = await Animal.findOne(ownerFilter(req, { _id: animalId })).lean();
    if (!animal) return fail(res, 404, "Animal no encontrado");
    if (!["bovino", "porcino"].includes(animal.especie)) {
      return fail(res, 400, "La calculadora solo aplica a bovinos y porcinos");
    }
    especie = animal.especie;
    if (pesoActual === undefined && animal.pesoActual != null) {
      pesoActual = animal.pesoActual;
    }
  }

  if (!especie) return fail(res, 400, "especie es requerida");
  if (pesoActual === undefined) return fail(res, 400, "pesoActual es requerido");
  if (pesoObjetivo === undefined) return fail(res, 400, "pesoObjetivo es requerido");

  const plan = calcularPlan({
    especie,
    pesoActual,
    pesoObjetivo,
    diasDisponibles,
    modo: modo || "planificar_por_dias",
    objetivo: objetivo || "engorde",
  });

  return ok(
    res,
    {
      ...plan,
      animalId: animalId || null,
    },
    "Plan calculado"
  );
});

module.exports = { calcular };
