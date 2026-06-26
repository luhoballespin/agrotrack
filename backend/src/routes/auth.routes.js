const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, register } = require("../controllers/auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: "Demasiados intentos. Probá nuevamente en unos minutos." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;

