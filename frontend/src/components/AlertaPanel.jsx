import Badge from "./Badge";

function colorFromPrioridad(p) {
  if (p === "rojo") return "rojo";
  if (p === "naranja") return "naranja";
  return "azul";
}

export default function AlertaPanel({ alertas = [] }) {
  if (!alertas.length) {
    return (
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-600">Sin alertas por ahora.</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold">Alertas</div>
        <div className="text-xs text-slate-500">Ordenadas por prioridad</div>
      </div>
      <ul className="divide-y">
        {alertas.map((a, idx) => (
          <li key={`${a.refId || "x"}-${idx}`} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={colorFromPrioridad(a.prioridad)}>{a.prioridad}</Badge>
                  <span className="text-sm font-medium">{a.titulo}</span>
                </div>
                <div className="mt-1 text-sm text-slate-700">{a.mensaje}</div>
                {a.animal && (
                  <div className="mt-1 text-xs text-slate-500">
                    {a.animal.especie} • {a.animal.numeroCaravana || a.animal.nombre}
                  </div>
                )}
              </div>
              {a.tipo && <span className="text-xs text-slate-400">{a.tipo}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

