const jwt = require("jsonwebtoken");
const { fail } = require("../utils/response");

function authMiddleware(req, res, next) {
  if (req.path === "/health") return next();

  if (!process.env.JWT_SECRET) {
    return fail(res, 500, "JWT_SECRET no configurado en .env");
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return fail(res, 401, "No autenticado");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    return fail(res, 401, "Token inválido o expirado");
  }
}

module.exports = { authMiddleware };

