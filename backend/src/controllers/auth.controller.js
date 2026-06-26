const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ok, fail } = require("../utils/response");

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function signToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return { token, expiresIn };
}

async function register(req, res) {
  const { username, password, email, name } = req.body || {};
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedUsername || !password) return fail(res, 400, "Usuario y contraseña son obligatorios");
  if (normalizedUsername.length < 3) return fail(res, 400, "El usuario debe tener al menos 3 caracteres");
  if (String(password).length < 6) return fail(res, 400, "La contraseña debe tener al menos 6 caracteres");
  if (process.env.ADMIN_USER && normalizedUsername === normalizeUsername(process.env.ADMIN_USER)) {
    return fail(res, 409, "Ese usuario está reservado");
  }

  const existingUser = await User.findOne({
    $or: [
      { username: normalizedUsername },
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
    ],
  });
  if (existingUser) return fail(res, 409, "Ya existe un usuario registrado con esos datos");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail || undefined,
    name,
    passwordHash,
  });

  const { token, expiresIn } = signToken({
    sub: user._id.toString(),
    username: user.username,
    role: user.role,
  });

  return ok(res, { token, expiresIn, user: user.toSafeJSON() }, "Usuario registrado");
}

async function login(req, res) {
  const { username, password } = req.body || {};
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername || !password) return fail(res, 400, "Faltan credenciales");

  const user = await User.findOne({ username: normalizedUsername, active: true }).select("+passwordHash");
  if (user) {
    const passOk = await bcrypt.compare(password, user.passwordHash);
    if (!passOk) return fail(res, 401, "Credenciales inválidas");

    const { token, expiresIn } = signToken({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return ok(res, { token, expiresIn, user: user.toSafeJSON() }, "Login exitoso");
  }

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  if (!adminUser || !adminPass) return fail(res, 500, "Admin no configurado en .env");

  if (normalizedUsername !== normalizeUsername(adminUser)) return fail(res, 401, "Credenciales inválidas");

  // ADMIN_PASS puede venir en texto plano. Si el usuario lo guarda hasheado, también lo aceptamos.
  const isHashed = adminPass.startsWith("$2a$") || adminPass.startsWith("$2b$") || adminPass.startsWith("$2y$");
  const passOk = isHashed ? await bcrypt.compare(password, adminPass) : password === adminPass;
  if (!passOk) return fail(res, 401, "Credenciales inválidas");

  const { token, expiresIn } = signToken({ sub: "admin", username: adminUser, role: "admin" });
  return ok(res, { token, expiresIn }, "Login exitoso");
}

module.exports = { login, register };

