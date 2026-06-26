const mongoose = require("mongoose");

const EtapaSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true, required: true },
    duracionDias: { type: Number, min: 1, required: true },
    forraje_kg: { type: Number, min: 0, required: true },
    concentrado_kg: { type: Number, min: 0, required: true },
    descripcion: { type: String, trim: true },
  },
  { _id: false }
);

const PlanAlimentacionSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    especie: { type: String, enum: ["bovino", "porcino"], required: true, index: true },
    pesoInicial: { type: Number, min: 0 },
    pesoObjetivo: { type: Number, min: 0 },
    diasPlanificados: { type: Number, min: 1 },
    gdpDiaria: { type: Number, min: 0 },
    consumoMSDiario: { type: Number, min: 0 },
    etapas: { type: [EtapaSchema], default: [] },
    alertas: { type: [String], default: [] },
    fechaInicio: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

PlanAlimentacionSchema.index({ ownerId: 1, animalId: 1, activo: 1 });

module.exports = mongoose.model("PlanAlimentacion", PlanAlimentacionSchema);

