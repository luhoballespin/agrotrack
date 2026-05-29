const express = require("express");
const {
  listSanitario,
  createSanitario,
  updateSanitario,
  deleteSanitario,
} = require("../controllers/sanitario.controller");

const router = express.Router();

router.get("/", listSanitario);
router.post("/", createSanitario);
router.put("/:id", updateSanitario);
router.delete("/:id", deleteSanitario);

module.exports = router;

