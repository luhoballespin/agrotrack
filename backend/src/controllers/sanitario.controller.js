const EventoSanitario = require("../models/EventoSanitario");
const Animal = require("../models/Animal");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");

const listSanitario = asyncHandler(async (req, res) => {
  const { animalId, especie } = req.query;
  const proximosDias = req.query.proximosDias ? Number(req.query.proximosDias) : null;

  const filter = {};
  if (animalId) filter.animalId = animalId;
  if (especie) filter.especie = especie;

  if (proximosDias !== null && !Number.isNaN(proximosDias)) {
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + proximosDias);
    filter.fechaProxima = { $lte: hasta };
  }

  const items = await EventoSanitario.find(filter).sort({ fecha: -1 }).lean();
  return ok(res, items, "Eventos sanitarios");
});

const createSanitario = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { animalId, tipo, fecha } = body;
  if (!animalId) return fail(res, 400, "animalId es requerido");
  if (!tipo) return fail(res, 400, "tipo es requerido");
  if (!fecha) return fail(res, 400, "fecha es requerida");

  const animal = await Animal.findById(animalId).lean();
  if (!animal) return fail(res, 404, "Animal no encontrado");

  const doc = await EventoSanitario.create({
    ...body,
    especie: animal.especie,
    fecha: new Date(fecha),
    fechaProxima: body.fechaProxima ? new Date(body.fechaProxima) : undefined,
  });

  return ok(res, doc, "Evento sanitario creado");
});

const updateSanitario = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const doc = await EventoSanitario.findById(req.params.id);
  if (!doc) return fail(res, 404, "Evento no encontrado");

  if (body.fecha) body.fecha = new Date(body.fecha);
  if (body.fechaProxima) body.fechaProxima = new Date(body.fechaProxima);

  Object.assign(doc, body);
  await doc.save();
  return ok(res, doc, "Evento sanitario actualizado");
});

const deleteSanitario = asyncHandler(async (req, res) => {
  const doc = await EventoSanitario.findById(req.params.id);
  if (!doc) return fail(res, 404, "Evento no encontrado");
  await doc.deleteOne();
  return ok(res, true, "Evento sanitario eliminado");
});

module.exports = { listSanitario, createSanitario, updateSanitario, deleteSanitario };

