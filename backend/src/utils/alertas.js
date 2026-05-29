const { REPRODUCCION } = require("./constantesReproduccion");
const { addDays, diffInDays, startOfDay } = require("./date");

const PRIORIDAD = {
  rojo: 3,
  naranja: 2,
  info: 1,
};

function sortByPrioridad(alertas) {
  return [...alertas].sort((a, b) => {
    const pa = PRIORIDAD[a.prioridad] || 0;
    const pb = PRIORIDAD[b.prioridad] || 0;
    if (pb !== pa) return pb - pa;
    // secundarios: fecha ascendente si existe
    const fa = a.fechaObjetivo ? new Date(a.fechaObjetivo).getTime() : Number.POSITIVE_INFINITY;
    const fb = b.fechaObjetivo ? new Date(b.fechaObjetivo).getTime() : Number.POSITIVE_INFINITY;
    return fa - fb;
  });
}

function baseAlerta({ tipo, prioridad, titulo, mensaje, animal, refId, fechaObjetivo }) {
  return {
    tipo, // sanitaria | reproductiva | general
    prioridad, // rojo | naranja | info
    titulo,
    mensaje,
    animal: animal
      ? {
          id: String(animal._id),
          especie: animal.especie,
          nombre: animal.nombre,
          numeroCaravana: animal.numeroCaravana,
          sexo: animal.sexo,
          estadoReproductivo: animal.estadoReproductivo,
        }
      : null,
    refId: refId ? String(refId) : null,
    fechaObjetivo: fechaObjetivo ? new Date(fechaObjetivo).toISOString() : null,
    createdAt: new Date().toISOString(),
  };
}

function generarAlertasSanitarias(eventos, hoy = new Date()) {
  const alertas = [];
  const h = startOfDay(hoy);
  for (const ev of eventos) {
    if (!ev.fechaProxima) continue;
    const fp = startOfDay(ev.fechaProxima);
    const dias = diffInDays(fp, h); // fp - hoy

    if (fp.getTime() < h.getTime()) {
      alertas.push(
        baseAlerta({
          tipo: "sanitaria",
          prioridad: "rojo",
          titulo: "Sanidad vencida",
          mensaje: `${ev.tipo}${ev.nombre ? `: ${ev.nombre}` : ""} vencida hace ${Math.abs(dias)} días`,
          animal: ev.animal,
          refId: ev._id,
          fechaObjetivo: ev.fechaProxima,
        })
      );
      continue;
    }

    if (dias <= 7) {
      alertas.push(
        baseAlerta({
          tipo: "sanitaria",
          prioridad: "rojo",
          titulo: "Sanidad por vencer",
          mensaje: `${ev.tipo}${ev.nombre ? `: ${ev.nombre}` : ""} vence en ${dias} días`,
          animal: ev.animal,
          refId: ev._id,
          fechaObjetivo: ev.fechaProxima,
        })
      );
      continue;
    }

    if (dias <= 30) {
      alertas.push(
        baseAlerta({
          tipo: "sanitaria",
          prioridad: "naranja",
          titulo: "Sanidad próxima",
          mensaje: `${ev.tipo}${ev.nombre ? `: ${ev.nombre}` : ""} próxima en ${dias} días`,
          animal: ev.animal,
          refId: ev._id,
          fechaObjetivo: ev.fechaProxima,
        })
      );
    }
  }
  return alertas;
}

function generarAlertasReproductivas(hembras, hoy = new Date()) {
  const alertas = [];
  const h = startOfDay(hoy);

  for (const a of hembras) {
    const especie = a.especie;
    const cfg = REPRODUCCION[especie];
    if (!cfg) continue;

    if (a.estadoReproductivo === "en_celo") {
      alertas.push(
        baseAlerta({
          tipo: "reproductiva",
          prioridad: "info",
          titulo: "En celo",
          mensaje: "Animal en celo - momento óptimo de servicio",
          animal: a,
        })
      );
    }

    if (a.estadoReproductivo === "vacia" && a.fechaUltimoParto) {
      // bovino: 60 días postparto promedio retorno al celo. Otras especies: dejamos 30 por default.
      const diasPostParto = especie === "bovino" ? 60 : 30;
      const proximoCelo = addDays(a.fechaUltimoParto, diasPostParto);
      const dias = diffInDays(startOfDay(proximoCelo), h);
      if (dias <= 10) {
        alertas.push(
          baseAlerta({
            tipo: "reproductiva",
            prioridad: "info",
            titulo: "Posible celo próximo",
            mensaje: `Posible celo próximo en ${Math.max(0, dias)} días`,
            animal: a,
            fechaObjetivo: proximoCelo,
          })
        );
      }
    }

    if (a.estadoReproductivo === "servida" && a.fechaUltimoServicio) {
      const verif = addDays(a.fechaUltimoServicio, cfg.cicloCeloDias + 5);
      if (h.getTime() >= startOfDay(verif).getTime()) {
        alertas.push(
          baseAlerta({
            tipo: "reproductiva",
            prioridad: "info",
            titulo: "Verificar gestación",
            mensaje: "No repitió celo esperado: verificar si está gestante",
            animal: a,
            fechaObjetivo: verif,
          })
        );
      }
    }

    if (a.estadoReproductivo === "gestante" && a.fechaProbableParto) {
      const fpp = startOfDay(a.fechaProbableParto);
      const dias = diffInDays(fpp, h);
      if (dias <= 7) {
        alertas.push(
          baseAlerta({
            tipo: "reproductiva",
            prioridad: "rojo",
            titulo: "Parto inminente",
            mensaje: `⚠️ PARTO INMINENTE: en ${Math.max(0, dias)} días`,
            animal: a,
            fechaObjetivo: a.fechaProbableParto,
          })
        );
      } else if (dias <= 15) {
        alertas.push(
          baseAlerta({
            tipo: "reproductiva",
            prioridad: "naranja",
            titulo: "Preparto",
            mensaje: `PREPARTO: parto en ${dias} días`,
            animal: a,
            fechaObjetivo: a.fechaProbableParto,
          })
        );
      }
    }
  }

  return alertas;
}

function generarAlertasDesparasitacion(hembrasOMachos, ultimoDespaByAnimalId, hoy = new Date()) {
  const alertas = [];
  const h = startOfDay(hoy);
  for (const a of hembrasOMachos) {
    const last = ultimoDespaByAnimalId.get(String(a._id)) || null;
    if (!last) {
      alertas.push(
        baseAlerta({
          tipo: "general",
          prioridad: "naranja",
          titulo: "Desparasitación pendiente",
          mensaje: "Sin registro de desparasitación reciente",
          animal: a,
        })
      );
      continue;
    }
    const dias = diffInDays(h, startOfDay(last.fecha)); // hoy - last
    if (dias > 90) {
      alertas.push(
        baseAlerta({
          tipo: "general",
          prioridad: "naranja",
          titulo: "Desparasitación atrasada",
          mensaje: `Sin registro de desparasitación reciente (última hace ${dias} días)`,
          animal: a,
          fechaObjetivo: addDays(last.fecha, 90),
        })
      );
    }
  }
  return alertas;
}

async function generarAlertas(models, hoy = new Date()) {
  const { Animal, EventoSanitario } = models;
  const animales = await Animal.find({ activo: true }).lean();
  const hembras = animales.filter((a) => a.sexo === "hembra");

  const eventosSan = await EventoSanitario.find({
    animalId: { $in: animales.map((a) => a._id) },
    fechaProxima: { $exists: true, $ne: null },
  })
    .lean();

  const animalById = new Map(animales.map((a) => [String(a._id), a]));
  for (const ev of eventosSan) {
    ev.animal = animalById.get(String(ev.animalId)) || null;
  }

  const ultDespaAgg = await EventoSanitario.aggregate([
    { $match: { tipo: "desparasitacion", animalId: { $in: animales.map((a) => a._id) } } },
    { $sort: { fecha: -1 } },
    { $group: { _id: "$animalId", fecha: { $first: "$fecha" } } },
  ]);
  const ultimoDespaByAnimalId = new Map(ultDespaAgg.map((x) => [String(x._id), x]));

  const alertasSanitarias = generarAlertasSanitarias(eventosSan, hoy);
  const alertasReproductivas = generarAlertasReproductivas(hembras, hoy);
  const alertasGenerales = generarAlertasDesparasitacion(animales, ultimoDespaByAnimalId, hoy);

  return {
    alertasSanitarias,
    alertasReproductivas,
    alertasGenerales,
    alertasTodas: sortByPrioridad([
      ...alertasSanitarias,
      ...alertasReproductivas,
      ...alertasGenerales,
    ]),
  };
}

module.exports = {
  sortByPrioridad,
  generarAlertas,
  generarAlertasSanitarias,
  generarAlertasReproductivas,
  generarAlertasDesparasitacion,
};

