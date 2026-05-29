const express = require("express");
const { createPlan, getPlanActivo } = require("../controllers/alimentacion.controller");

const router = express.Router();

router.post("/", createPlan);
router.get("/:animalId", getPlanActivo);

module.exports = router;

