const express = require("express");
const { createPeso, listPesosByAnimal } = require("../controllers/pesos.controller");

const router = express.Router();

router.post("/", createPeso);
router.get("/:animalId", listPesosByAnimal);

module.exports = router;

