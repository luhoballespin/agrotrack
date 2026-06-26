const mongoose = require("mongoose");

const EventoReproductivoSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    tipo: {
      type: String,
      enum: [
        "deteccion_celo",
        "servicio_natural",
        "inseminacion_artificial",
        "diagnostico_gestacion",
        "parto",
        "aborto",
        "destete",
      ],
      required: true,
      index: true,
    },
    fecha: { type: Date, required: true, index: true },
    resultado: { type: String, trim: true },
    pesoNacimiento: { type: Number, min: 0 },
    observaciones: { type: String, trim: true },
    veterinario: { type: String, trim: true },
  },
  { timestamps: true }
);

EventoReproductivoSchema.index({ ownerId: 1, animalId: 1, fecha: -1 });

module.exports = mongoose.model("EventoReproductivo", EventoReproductivoSchema);

