const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema(
  {
    especie: {
      type: String,
      enum: ["bovino", "equino", "ovino", "porcino"],
      required: true,
      index: true,
    },

    nombre: { type: String, trim: true },
    numeroCaravana: { type: String, trim: true },

    sexo: {
      type: String,
      enum: ["macho", "hembra", "castrado"],
      required: true,
      index: true,
    },
    edad: { type: Number, min: 0 }, // meses
    raza: { type: String, trim: true },
    pesoActual: { type: Number, min: 0 },
    foto: { type: String, trim: true }, // URL Cloudinary
    fechaIngreso: { type: Date },
    activo: { type: Boolean, default: true, index: true },
    observaciones: { type: String, trim: true },

    // Específicos
    // Bovinos
    categoriaBovino: { type: String, enum: ["cria", "recria", "engorde"] },
    // Equinos
    color: { type: String, trim: true },
    usoEquino: {
      type: String,
      enum: ["trabajo", "deporte", "reproduccion", "otro"],
    },
    // Ovinos
    aptitudOvino: { type: String, enum: ["carne", "lana", "mixto"] },
    // Porcinos
    categoriaPorcino: {
      type: String,
      enum: ["lechon", "recria", "engorde", "reproductor"],
    },

    // Reproductivo (solo hembras)
    estadoReproductivo: {
      type: String,
      enum: [
        "vacia",
        "en_celo",
        "servida",
        "gestante",
        "preparto",
        "lactando",
        "descarte",
      ],
      default: "vacia",
      index: true,
    },
    fechaUltimoCelo: { type: Date },
    fechaUltimoServicio: { type: Date },
    fechaProbableParto: { type: Date },
    fechaUltimoParto: { type: Date },
    totalPartos: { type: Number, default: 0, min: 0 },

    // Machos
    esReproductor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unicidad de caravana por especie (solo si existe numeroCaravana)
AnimalSchema.index(
  { especie: 1, numeroCaravana: 1 },
  { unique: true, partialFilterExpression: { numeroCaravana: { $type: "string" } } }
);
AnimalSchema.index({ activo: 1, especie: 1, estadoReproductivo: 1 });
AnimalSchema.index({ fechaProbableParto: 1 });

module.exports = mongoose.model("Animal", AnimalSchema);

