const mongoose = require("mongoose");

const RegistroPesoSchema = new mongoose.Schema(
  {
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    peso: { type: Number, required: true, min: 0 },
    fecha: { type: Date, default: Date.now, index: true },
    observaciones: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistroPeso", RegistroPesoSchema);

