import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import { format } from "date-fns";

export default function SanitarioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proximosDias, setProximosDias] = useState("30");
  const [calendario, setCalendario] = useState(null);
  const [especieCal, setEspecieCal] = useState("bovino");

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (proximosDias) q.set("proximosDias", proximosDias);
    return q.toString();
  }, [proximosDias]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    api
      .get(`/api/sanitario?${query}`)
      .then((res) => mounted && setItems(res?.data?.data || []))
      .catch((e) => mounted && setError(e?.response?.data?.message || e?.message || "Error cargando sanitario"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  useEffect(() => {
    api
      .get(`/api/calendario-sanitario?especie=${especieCal}`)
      .then((res) => setCalendario(res?.data?.data?.items || []))
      .catch(() => setCalendario([]));
  }, [especieCal]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold">Sanitario</div>
          <div className="text-sm text-slate-600">Timeline global + próximos vencimientos</div>
        </div>
        <select className="rounded-xl border bg-white px-3 py-2 text-sm" value={proximosDias} onChange={(e) => setProximosDias(e.target.value)}>
          <option value="7">Próx. 7 días</option>
          <option value="30">Próx. 30 días</option>
          <option value="90">Próx. 90 días</option>
          <option value="">Todos</option>
        </select>
      </div>

      {loading && <div className="text-sm text-slate-600">Cargando…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Calendario sanitario predefinido</div>
        <select className="mt-2 rounded-xl border px-3 py-2 text-sm" value={especieCal} onChange={(e) => setEspecieCal(e.target.value)}>
          <option value="bovino">Bovinos</option>
          <option value="equino">Equinos</option>
          <option value="ovino">Ovinos</option>
          <option value="porcino">Porcinos</option>
        </select>
        <ul className="mt-3 grid gap-2 text-sm">
          {(calendario || []).map((c, i) => (
            <li key={i} className="rounded-xl border bg-slate-50 p-3">
              <div className="font-medium">{c.nombre}</div>
              <div className="text-xs text-slate-600">{c.frecuencia}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-semibold">Eventos</div>
        </div>
        <ul className="divide-y">
          {items.map((e) => (
            <li key={e._id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {e.tipo} {e.nombre ? `• ${e.nombre}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    {e.especie} • {format(new Date(e.fecha), "dd/MM/yyyy")}
                  </div>
                </div>
                {e.fechaProxima && <Badge color="naranja">Próx: {format(new Date(e.fechaProxima), "dd/MM/yyyy")}</Badge>}
              </div>
            </li>
          ))}
          {!items.length && <li className="px-4 py-3 text-sm text-slate-600">Sin eventos para mostrar.</li>}
        </ul>
      </div>
    </div>
  );
}

