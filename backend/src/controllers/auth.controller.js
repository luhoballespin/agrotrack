const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ok, fail } = require("../utils/response");

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res, 400, "Faltan credenciales");

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  if (!adminUser || !adminPass) return fail(res, 500, "Admin no configurado en .env");

  if (username !== adminUser) return fail(res, 401, "Credenciales inválidas");

  // ADMIN_PASS puede venir en texto plano. Si el usuario lo guarda hasheado, también lo aceptamos.
  const isHashed = adminPass.startsWith("$2a$") || adminPass.startsWith("$2b$") || adminPass.startsWith("$2y$");
  const passOk = isHashed ? await bcrypt.compare(password, adminPass) : password === adminPass;
  if (!passOk) return fail(res, 401, "Credenciales inválidas");

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign({ sub: "admin", username: adminUser }, process.env.JWT_SECRET, { expiresIn });
  return ok(res, { token, expiresIn }, "Login exitoso");
}

module.exports = { login };

