const Animal = require("../models/Animal");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadImageFromMulter } = require("../utils/cloudinaryUpload");
const { parseAnimalBody } = require("../utils/parseBody");
const { getOwnerId, ownerFilter } = require("../utils/ownership");

function buildAnimalFilters(q) {
  const filter = {};
  if (q.especie) filter.especie = q.especie;
  if (q.sexo) filter.sexo = q.sexo;
  if (q.activo !== undefined) {
    if (q.activo === "true" || q.activo === true) filter.activo = true;
    if (q.activo === "false" || q.activo === false) filter.activo = false;
  }
  if (q.estadoReproductivo) filter.estadoReproductivo = q.estadoReproductivo;
  return filter;
}

const listAnimales = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
  const skip = (page - 1) * limit;

  const filter = ownerFilter(req, buildAnimalFilters(req.query));

  const [items, total] = await Promise.all([
    Animal.find(filter)
      .sort({ activo: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Animal.countDocuments(filter),
  ]);

  return ok(res, { items, page, limit, total }, "Lista de animales");
});

const getAnimal = asyncHandler(async (req, res) => {
  const animal = await Animal.findOne(ownerFilter(req, { _id: req.params.id })).lean();
  if (!animal) return fail(res, 404, "Animal no encontrado");
  return ok(res, animal, "Animal");
});

const createAnimal = asyncHandler(async (req, res) => {
  const body = parseAnimalBody(req.body || {});
  if (!body.especie) return fail(res, 400, "especie es requerida");
  if (!body.sexo) return fail(res, 400, "sexo es requerido");

  const fotoUrl = await uploadImageFromMulter(req.file, "agrotrack/animales");

  const doc = await Animal.create({
    ...body,
    ownerId: getOwnerId(req),
    foto: fotoUrl || body.foto,
    fechaIngreso: body.fechaIngreso || new Date(),
  });

  return ok(res, doc, "Animal creado");
});

const updateAnimal = asyncHandler(async (req, res) => {
  const body = parseAnimalBody(req.body || {});
  const animal = await Animal.findOne(ownerFilter(req, { _id: req.params.id }));
  if (!animal) return fail(res, 404, "Animal no encontrado");

  const fotoUrl = await uploadImageFromMulter(req.file, "agrotrack/animales");
  if (fotoUrl) animal.foto = fotoUrl;

  Object.assign(animal, body);
  await animal.save();

  return ok(res, animal, "Animal actualizado");
});

const deleteAnimalSoft = asyncHandler(async (req, res) => {
  const animal = await Animal.findOne(ownerFilter(req, { _id: req.params.id }));
  if (!animal) return fail(res, 404, "Animal no encontrado");
  animal.activo = false;
  await animal.save();
  return ok(res, animal, "Animal dado de baja");
});

module.exports = {
  listAnimales,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimalSoft,
};

