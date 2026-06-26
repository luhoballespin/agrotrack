const mongoose = require("mongoose");

const EventoSanitarioSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    especie: { type: String, enum: ["bovino", "equino", "ovino", "porcino"], required: true, index: true },
    tipo: {
      type: String,
      enum: ["vacuna", "desparasitacion", "consulta", "cirugia", "vitaminas", "otro"],
      required: true,
      index: true,
    },
    nombre: { type: String, trim: true },
    fecha: { type: Date, required: true, index: true },
    fechaProxima: { type: Date, index: true },
    dosis: { type: String, trim: true },
    veterinario: { type: String, trim: true },
    observaciones: { type: String, trim: true },
  },
  { timestamps: true }
);

EventoSanitarioSchema.index({ ownerId: 1, fechaProxima: 1, especie: 1 });

module.exports = mongoose.model("EventoSanitario", EventoSanitarioSchema);

