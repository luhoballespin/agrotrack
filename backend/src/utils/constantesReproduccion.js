const REPRODUCCION = {
  bovino: {
    cicloCeloDias: 21,
    duracionCeloHoras: 18, // promedio 6-30 hs
    gestacionDias: 285, // ~9 meses
    estacional: false, // celo todo el año
  },
  equino: {
    cicloCeloDias: 21,
    duracionCeloDias: 5, // promedio 2-8 días
    gestacionDias: 340, // ~11 meses
    estacional: true, // activo primavera/verano hemisferio sur
    mesesActivos: [9, 10, 11, 12, 1, 2], // sep-feb en Argentina
  },
  ovino: {
    cicloCeloDias: 17,
    duracionCeloHoras: 28, // promedio 20-36 hs
    gestacionDias: 150, // promedio 147-153 días
    estacional: true,
    mesesActivos: [3, 4, 5, 6, 7, 8], // otoño/invierno hemisferio sur
  },
  porcino: {
    cicloCeloDias: 21,
    duracionCeloDias: 2.5, // promedio 2-3 días
    gestacionDias: 115, // 3 meses, 3 semanas, 3 días
    estacional: false,
  },
};

module.exports = { REPRODUCCION };

