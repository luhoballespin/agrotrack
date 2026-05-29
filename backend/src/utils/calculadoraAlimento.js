function round(n, d = 2) {
  const p = 10 ** d;
  return Math.round(Number(n) * p) / p;
}

const PERFILES = {
  bovino: {
    gdpOptima: 0.9,
    gdpMax: 1.8,
    msPorcentaje: 0.025,
    ratioConcentrado: 0.45,
    tiposAlimento: {
      engorde:
        "Pastura verde o rollos de calidad + concentrado 14–16% PB (1–1.5% del peso vivo). Agua limpia a libre demanda.",
      recria:
        "Pastura de buena calidad + suplemento proteico (13–15% PB). Evitar sobrepastoreo.",
      levantar_peso:
        "Forraje de calidad + concentrado energético-proteico. Incremento gradual del concentrado en 10–14 días.",
    },
  },
  porcino: {
    gdpOptima: 0.75,
    gdpMax: 1.2,
    msPorcentaje: 0.028,
    ratioConcentrado: 0.75,
    tiposAlimento: {
      engorde:
        "Balanceado comercial 16–18% PB (ad libitum o restringido según categoría). Agua siempre disponible.",
      recria:
        "Precebo: balanceado 18–20% PB. Transición gradual desde lactancia.",
      levantar_peso:
        "Dieta de crecimiento 16–17% PB con lisina y energía adecuada. Control de temperatura ambiente.",
    },
  },
};

/**
 * Calculadora de alimentación bovinos/porcinos.
 * modos:
 *  - planificar_por_dias: con peso actual, objetivo y días disponibles
 *  - estimar_tiempo: calcula días necesarios con GDP óptima de la especie
 */
function calcularPlan({
  especie,
  pesoActual,
  pesoObjetivo,
  diasDisponibles,
  modo = "planificar_por_dias",
  objetivo = "engorde",
}) {
  const alertas = [];
  if (!["bovino", "porcino"].includes(especie)) {
    throw new Error("La calculadora solo aplica a bovinos y porcinos");
  }

  const perfil = PERFILES[especie];
  const pa = Number(pesoActual);
  const po = Number(pesoObjetivo);
  if (!Number.isFinite(pa) || !Number.isFinite(po)) {
    throw new Error("Peso actual y peso objetivo son requeridos");
  }
  if (pa <= 0 || po <= 0) throw new Error("Los pesos deben ser mayores a 0");

  const delta = po - pa;
  if (delta <= 0) {
    alertas.push("El peso objetivo debe ser mayor al peso actual para engorde/levante.");
  }

  let dias = Number(diasDisponibles);
  let modoCalculo = modo;

  if (modo === "estimar_tiempo" || !dias || dias <= 0) {
    modoCalculo = "estimar_tiempo";
    if (delta > 0) {
      dias = Math.max(1, Math.ceil(delta / perfil.gdpOptima));
      alertas.push(
        `Tiempo estimado con GDP óptima de ${perfil.gdpOptima} kg/día (${especie}).`
      );
    } else {
      dias = 90;
    }
  }

  if (!Number.isFinite(dias) || dias <= 0) {
    throw new Error("Días disponibles inválidos");
  }

  const gdpDiaria = delta > 0 ? delta / dias : 0;
  if (gdpDiaria > perfil.gdpMax) {
    alertas.push(
      `GDP diaria (${round(gdpDiaria, 2)} kg/d) alta para ${especie}. Considerá más días o revisar el objetivo.`
    );
  }

  const pesoProm = (pa + po) / 2;
  const consumoMSDiario = pesoProm * perfil.msPorcentaje;

  const diasAdapt = Math.max(7, Math.min(14, Math.round(dias * 0.15)));
  const diasCrec = Math.max(1, dias - diasAdapt);

  const msAdapt = consumoMSDiario * 0.9;
  const msCrec = consumoMSDiario * 1.05;
  const ratioConcentrado = perfil.ratioConcentrado;

  const etapas = [
    {
      nombre: "Adaptación",
      duracionDias: diasAdapt,
      forraje_kg: round(msAdapt * (1 - ratioConcentrado), 2),
      concentrado_kg: round(msAdapt * ratioConcentrado, 2),
      descripcion:
        "Transición gradual al plan. Aumentar concentrado de a poco para evitar acidosis (bovinos) o diarrea (porcinos).",
    },
    {
      nombre: objetivo === "engorde" ? "Engorde" : "Crecimiento / levante",
      duracionDias: diasCrec,
      forraje_kg: round(msCrec * (1 - ratioConcentrado), 2),
      concentrado_kg: round(msCrec * ratioConcentrado, 2),
      descripcion: "Etapa principal de ganancia de peso según objetivo.",
    },
  ];

  const tipoAlimentoSugerido =
    perfil.tiposAlimento[objetivo] || perfil.tiposAlimento.engorde;

  const gananciaTotal = round(delta, 1);
  const resumen =
    delta > 0
      ? `Para llevar un ${especie} de ${round(pa)} kg a ${round(po)} kg (+${gananciaTotal} kg) en ${Math.round(dias)} días, necesitás una GDP de ${round(gdpDiaria, 3)} kg/día y un consumo aproximado de ${round(consumoMSDiario, 2)} kg MS/día.`
      : `Revisá el peso objetivo: debe ser superior al peso actual.`;

  return {
    especie,
    objetivo,
    modoCalculo,
    pesoInicial: round(pa, 2),
    pesoObjetivo: round(po, 2),
    gananciaTotal: round(delta, 2),
    diasPlanificados: Math.round(dias),
    gdpDiaria: round(gdpDiaria, 3),
    gdpOptimaReferencia: perfil.gdpOptima,
    consumoMSDiario: round(consumoMSDiario, 2),
    tipoAlimentoSugerido,
    etapas,
    alertas,
    resumen,
  };
}

module.exports = { calcularPlan, PERFILES };
