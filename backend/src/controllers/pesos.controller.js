const Animal = require("../models/Animal");
const RegistroPeso = require("../models/RegistroPeso");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");

const createPeso = asyncHandler(async (req, res) => {
  const { animalId, peso, fecha, observaciones } = req.body || {};
  if (!animalId) return fail(res, 400, "animalId es requerido");
  if (peso === undefined) return fail(res, 400, "peso es requerido");

  const animal = await Animal.findById(animalId);
  if (!animal) return fail(res, 404, "Animal no encontrado");

  const reg = await RegistroPeso.create({
    animalId,
    peso: Number(peso),
    fecha: fecha ? new Date(fecha) : new Date(),
    observaciones,
  });

  animal.pesoActual = Number(peso);
  await animal.save();

  return ok(res, reg, "Registro de peso creado");
});

const listPesosByAnimal = asyncHandler(async (req, res) => {
  const { animalId } = req.params;
  const items = await RegistroPeso.find({ animalId })
    .sort({ fecha: 1 })
    .lean();
  return ok(res, items, "Historial de pesos");
});

module.exports = { createPeso, listPesosByAnimal };

