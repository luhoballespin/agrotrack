export const REPRODUCCION = {
  bovino: { gestacionDias: 285, cicloCeloDias: 21 },
  equino: { gestacionDias: 340, cicloCeloDias: 21 },
  ovino: { gestacionDias: 150, cicloCeloDias: 17 },
  porcino: { gestacionDias: 115, cicloCeloDias: 21 },
};

export function calcularFechaParto(especie, fechaServicio) {
  const cfg = REPRODUCCION[especie];
  if (!cfg || !fechaServicio) return null;
  const d = new Date(fechaServicio);
  d.setDate(d.getDate() + cfg.gestacionDias);
  return d;
}
