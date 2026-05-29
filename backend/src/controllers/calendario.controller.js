const { CALENDARIO_SANITARIO } = require("../utils/calendarioSanitario");
const { ok, fail } = require("../utils/response");
const { asyncHandler } = require("../utils/asyncHandler");

const getCalendario = asyncHandler(async (req, res) => {
  const { especie } = req.query;
  if (especie) {
    const items = CALENDARIO_SANITARIO[especie];
    if (!items) return fail(res, 400, "Especie inválida");
    return ok(res, { especie, items }, "Calendario sanitario");
  }
  return ok(res, CALENDARIO_SANITARIO, "Calendario sanitario completo");
});

module.exports = { getCalendario };
