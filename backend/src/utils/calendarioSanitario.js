const CALENDARIO_SANITARIO = {
  bovino: [
    { nombre: "Fiebre Aftosa", frecuencia: "Cada 6 meses (SENASA, obligatoria)" },
    { nombre: "Brucelosis", frecuencia: "Terneras 3-8 meses, dosis única" },
    { nombre: "Mancha + Gangrena Gaseosa", frecuencia: "2 dosis (intervalo 20 días), desde 2 meses" },
    { nombre: "Carbunclo", frecuencia: "Anual" },
    { nombre: "BVD/PI3", frecuencia: "2 dosis (predestete + 10-20 días después)" },
    { nombre: "Desparasitación", frecuencia: "Cada 90 días" },
  ],
  equino: [
    { nombre: "Influenza Equina", frecuencia: "Cada 6 meses" },
    { nombre: "Tétanos", frecuencia: "Anual (o cada 6 meses en zonas de riesgo)" },
    { nombre: "Herpesvirus Equino (EHV)", frecuencia: "Cada 6 meses" },
    { nombre: "Desparasitación", frecuencia: "Cada 90 días (rotar ivermectina/moxidectina)" },
    { nombre: "Coggins (AIE)", frecuencia: "Anual (obligatorio en Argentina)" },
  ],
  ovino: [
    { nombre: "Clostridiales", frecuencia: "Anual" },
    { nombre: "Ectima Contagioso", frecuencia: "Según focos de la zona" },
    { nombre: "Desparasitación", frecuencia: "Cada 60-90 días (rotar por resistencia)" },
    { nombre: "Control de pezuñas", frecuencia: "Cada 3-4 meses" },
  ],
  porcino: [
    { nombre: "Parvovirosis", frecuencia: "Reproductoras, 2 veces/año" },
    { nombre: "Leptospirosis", frecuencia: "Reproductoras, 2 veces/año" },
    { nombre: "Erisipela", frecuencia: "2 veces/año" },
    { nombre: "Mycoplasma", frecuencia: "Lechones 7-10 días" },
    { nombre: "Circovirus (PCV2)", frecuencia: "Lechones 3 semanas" },
    { nombre: "Desparasitación", frecuencia: "Cada 90 días" },
  ],
};

module.exports = { CALENDARIO_SANITARIO };

