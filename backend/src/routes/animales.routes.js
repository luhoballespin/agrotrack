const express = require("express");
const {
  listAnimales,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimalSoft,
} = require("../controllers/animales.controller");
const { updateReproduccionAnimal } = require("../controllers/reproductivo.controller");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listAnimales);
router.post("/", upload.single("foto"), createAnimal);
router.put("/:id/reproduccion", updateReproduccionAnimal);
router.get("/:id", getAnimal);
router.put("/:id", upload.single("foto"), updateAnimal);
router.delete("/:id", deleteAnimalSoft);

module.exports = router;

