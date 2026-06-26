const mongoose = require("mongoose");

const RegistroPesoSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    peso: { type: Number, required: true, min: 0 },
    fecha: { type: Date, default: Date.now, index: true },
    observaciones: { type: String, trim: true },
  },
  { timestamps: true }
);

RegistroPesoSchema.index({ ownerId: 1, animalId: 1, fecha: 1 });

module.exports = mongoose.model("RegistroPeso", RegistroPesoSchema);

