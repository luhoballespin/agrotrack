const express = require("express");
const {
  listReproductivoByAnimal,
  createEventoReproductivo,
  updateReproduccionAnimal,
} = require("../controllers/reproductivo.controller");

const router = express.Router();

router.get("/:animalId", listReproductivoByAnimal);
router.post("/", createEventoReproductivo);

module.exports = router;

