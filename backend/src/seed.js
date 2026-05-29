const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { connectDB } = require("./config/db");
const Animal = require("./models/Animal");
const RegistroPeso = require("./models/RegistroPeso");
const EventoSanitario = require("./models/EventoSanitario");
const EventoReproductivo = require("./models/EventoReproductivo");
const PlanAlimentacion = require("./models/PlanAlimentacion");
const { calcularProbableParto } = require("./utils/reproduccion");
const { addDays } = require("./utils/date");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function run() {
  await connectDB();

  console.log("Limpiando colecciones...");
  await Promise.all([
    Animal.deleteMany({}),
    RegistroPeso.deleteMany({}),
    EventoSanitario.deleteMany({}),
    EventoReproductivo.deleteMany({}),
    PlanAlimentacion.deleteMany({}),
  ]);

  console.log("Creando animales...");
  const animales = await Animal.insertMany([
    // Bovinos
    {
      especie: "bovino",
      numeroCaravana: "B-101",
      sexo: "hembra",
      edad: 36,
      raza: "Hereford",
      pesoActual: 420,
      categoriaBovino: "engorde",
      estadoReproductivo: "gestante",
      fechaUltimoServicio: daysAgo(200),
      fechaProbableParto: calcularProbableParto("bovino", daysAgo(200)),
      fechaIngreso: daysAgo(400),
    },
    {
      especie: "bovino",
      numeroCaravana: "B-102",
      sexo: "macho",
      edad: 30,
      raza: "Angus",
      pesoActual: 480,
      categoriaBovino: "engorde",
      esReproductor: true,
      fechaIngreso: daysAgo(500),
    },
    {
      especie: "bovino",
      numeroCaravana: "B-103",
      sexo: "hembra",
      edad: 28,
      raza: "Cruza",
      pesoActual: 360,
      categoriaBovino: "recria",
      estadoReproductivo: "vacia",
      fechaUltimoParto: daysAgo(55),
      fechaIngreso: daysAgo(300),
    },
    // Equinos
    {
      especie: "equino",
      nombre: "Mora",
      sexo: "hembra",
      edad: 60,
      raza: "Criollo",
      color: "Gateado",
      usoEquino: "trabajo",
      pesoActual: 410,
      estadoReproductivo: "en_celo",
      fechaUltimoCelo: daysAgo(1),
      fechaIngreso: daysAgo(900),
    },
    {
      especie: "equino",
      nombre: "Sultán",
      sexo: "macho",
      edad: 72,
      raza: "Criollo",
      color: "Zaino",
      usoEquino: "reproduccion",
      pesoActual: 430,
      esReproductor: true,
      fechaIngreso: daysAgo(1000),
    },
    {
      especie: "equino",
      nombre: "Luna",
      sexo: "hembra",
      edad: 48,
      raza: "Polo",
      color: "Tordillo",
      usoEquino: "deporte",
      pesoActual: 395,
      estadoReproductivo: "servida",
      fechaUltimoServicio: daysAgo(30),
      fechaIngreso: daysAgo(800),
    },
    // Ovinos
    {
      especie: "ovino",
      numeroCaravana: "O-201",
      sexo: "hembra",
      edad: 24,
      raza: "Corriedale",
      aptitudOvino: "mixto",
      pesoActual: 55,
      estadoReproductivo: "gestante",
      fechaUltimoServicio: daysAgo(120),
      fechaProbableParto: calcularProbableParto("ovino", daysAgo(120)),
      fechaIngreso: daysAgo(500),
    },
    {
      especie: "ovino",
      numeroCaravana: "O-202",
      sexo: "macho",
      edad: 30,
      raza: "Merino",
      aptitudOvino: "lana",
      pesoActual: 70,
      esReproductor: true,
      fechaIngreso: daysAgo(650),
    },
    {
      especie: "ovino",
      numeroCaravana: "O-203",
      sexo: "hembra",
      edad: 18,
      raza: "Hampshire",
      aptitudOvino: "carne",
      pesoActual: 45,
      estadoReproductivo: "vacia",
      fechaUltimoParto: daysAgo(20),
      fechaIngreso: daysAgo(300),
    },
    // Porcinos
    {
      especie: "porcino",
      nombre: "Rosa",
      sexo: "hembra",
      edad: 14,
      raza: "Landrace",
      categoriaPorcino: "reproductor",
      pesoActual: 165,
      estadoReproductivo: "gestante",
      fechaUltimoServicio: daysAgo(100),
      fechaProbableParto: calcularProbableParto("porcino", daysAgo(100)),
      fechaIngreso: daysAgo(250),
    },
    {
      especie: "porcino",
      nombre: "Toro",
      sexo: "macho",
      edad: 16,
      raza: "Duroc",
      categoriaPorcino: "reproductor",
      pesoActual: 210,
      esReproductor: true,
      fechaIngreso: daysAgo(260),
    },
    {
      especie: "porcino",
      nombre: "Chispa",
      sexo: "hembra",
      edad: 6,
      raza: "Yorkshire",
      categoriaPorcino: "recria",
      pesoActual: 55,
      estadoReproductivo: "vacia",
      fechaIngreso: daysAgo(90),
    },
  ]);

  const by = (predicate) => animales.filter(predicate);
  const bovinos = by((a) => a.especie === "bovino");
  const equinos = by((a) => a.especie === "equino");
  const ovinos = by((a) => a.especie === "ovino");
  const porcinos = by((a) => a.especie === "porcino");

  console.log("Creando pesos...");
  const pesos = [];
  for (const a of animales) {
    const base = a.pesoActual || 100;
    pesos.push(
      { animalId: a._id, peso: Math.max(10, base - 12), fecha: daysAgo(60) },
      { animalId: a._id, peso: Math.max(10, base - 6), fecha: daysAgo(30) },
      { animalId: a._id, peso: base, fecha: daysAgo(5) }
    );
  }
  await RegistroPeso.insertMany(pesos);

  console.log("Creando eventos sanitarios...");
  const eventosSan = [
    // Bovinos: aftosa venciendo pronto + desparasitación vieja
    {
      animalId: bovinos[0]._id,
      especie: "bovino",
      tipo: "vacuna",
      nombre: "Fiebre Aftosa",
      fecha: daysAgo(170),
      fechaProxima: addDays(new Date(), 5),
      veterinario: "SENASA",
    },
    {
      animalId: bovinos[1]._id,
      especie: "bovino",
      tipo: "desparasitacion",
      nombre: "Ivermectina 1%",
      fecha: daysAgo(140),
      fechaProxima: addDays(daysAgo(140), 90),
    },
    // Equinos: coggins al día, despa al día
    {
      animalId: equinos[0]._id,
      especie: "equino",
      tipo: "consulta",
      nombre: "Coggins (AIE)",
      fecha: daysAgo(20),
      fechaProxima: addDays(daysAgo(20), 365),
    },
    {
      animalId: equinos[0]._id,
      especie: "equino",
      tipo: "desparasitacion",
      nombre: "Moxidectina",
      fecha: daysAgo(30),
      fechaProxima: addDays(daysAgo(30), 90),
    },
    // Ovinos: clostridial vencida
    {
      animalId: ovinos[0]._id,
      especie: "ovino",
      tipo: "vacuna",
      nombre: "Clostridiales",
      fecha: daysAgo(390),
      fechaProxima: daysAgo(25),
    },
    // Porcinos: leptospirosis próxima en 20 días
    {
      animalId: porcinos[0]._id,
      especie: "porcino",
      tipo: "vacuna",
      nombre: "Leptospirosis",
      fecha: daysAgo(160),
      fechaProxima: addDays(new Date(), 20),
    },
  ];
  await EventoSanitario.insertMany(eventosSan);

  console.log("Creando eventos reproductivos...");
  const eventosRep = [
    {
      animalId: bovinos[0]._id,
      tipo: "inseminacion_artificial",
      fecha: bovinos[0].fechaUltimoServicio,
      resultado: "registrado",
    },
    {
      animalId: equinos[0]._id,
      tipo: "deteccion_celo",
      fecha: equinos[0].fechaUltimoCelo,
      resultado: "observado",
    },
    {
      animalId: ovinos[0]._id,
      tipo: "servicio_natural",
      fecha: ovinos[0].fechaUltimoServicio,
      resultado: "registrado",
    },
    {
      animalId: porcinos[0]._id,
      tipo: "servicio_natural",
      fecha: porcinos[0].fechaUltimoServicio,
      resultado: "registrado",
    },
  ];
  await EventoReproductivo.insertMany(eventosRep);

  console.log("Creando plan de alimentación ejemplo...");
  await PlanAlimentacion.create({
    animalId: bovinos[2]._id,
    especie: "bovino",
    pesoInicial: 360,
    pesoObjetivo: 420,
    diasPlanificados: 90,
    gdpDiaria: (420 - 360) / 90,
    consumoMSDiario: 9.5,
    etapas: [
      { nombre: "Recría", duracionDias: 45, forraje_kg: 6.0, concentrado_kg: 2.0 },
      { nombre: "Terminación", duracionDias: 45, forraje_kg: 5.0, concentrado_kg: 3.0 },
    ],
    alertas: [],
    activo: true,
  });

  console.log("Seed completo:", {
    animales: await Animal.countDocuments({}),
    pesos: await RegistroPeso.countDocuments({}),
    sanitario: await EventoSanitario.countDocuments({}),
    reproductivo: await EventoReproductivo.countDocuments({}),
    planes: await PlanAlimentacion.countDocuments({}),
  });

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

