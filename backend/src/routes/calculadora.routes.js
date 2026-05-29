const express = require("express");
const { calcular } = require("../controllers/calculadora.controller");

const router = express.Router();

router.post("/", calcular);

module.exports = router;

