/** Normaliza campos de multipart/form-data (strings) a tipos Mongoose. */
function parseAnimalBody(body = {}) {
  const out = { ...body };
  delete out.ownerId;
  delete out.createdAt;
  delete out.updatedAt;

  if (out.edad !== undefined && out.edad !== "") out.edad = Number(out.edad);
  if (out.pesoActual !== undefined && out.pesoActual !== "") out.pesoActual = Number(out.pesoActual);
  if (out.totalPartos !== undefined && out.totalPartos !== "") out.totalPartos = Number(out.totalPartos);
  if (out.esReproductor !== undefined) {
    out.esReproductor = out.esReproductor === "true" || out.esReproductor === true;
  }
  if (out.activo !== undefined) {
    out.activo = out.activo === "true" || out.activo === true;
  }
  if (out.fechaIngreso) out.fechaIngreso = new Date(out.fechaIngreso);
  return out;
}

module.exports = { parseAnimalBody };
