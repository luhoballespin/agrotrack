import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import EstadoReproductivo from "../components/EstadoReproductivo";
import Badge from "../components/Badge";
import { format } from "date-fns";

export default function ReproduccionPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("sexo", "hembra");
    q.set("activo", "true");
    q.set("limit", "100");
    return q.toString();
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    api
      .get(`/api/animales?${query}`)
      .then((res) => mounted && setItems(res?.data?.data?.items || []))
      .catch((e) => mounted && setError(e?.response?.data?.message || e?.message || "Error cargando reproducción"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  const gestantes = items
    .filter((a) => a.estadoReproductivo === "gestante" && a.fechaProbableParto)
    .sort((a, b) => new Date(a.fechaProbableParto) - new Date(b.fechaProbableParto));

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-lg font-bold">Reproducción</div>
        <div className="text-sm text-slate-600">Hembras por estado + próximos partos</div>
      </div>

      {loading && <div className="text-sm text-slate-600">Cargando…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-semibold">Próximos partos</div>
          <div className="text-xs text-slate-500">Ordenado por fecha probable</div>
        </div>
        <ul className="divide-y">
          {gestantes.slice(0, 20).map((a) => (
            <li key={a._id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{a.numeroCaravana || a.nombre}</div>
                  <div className="text-xs text-slate-500">{a.especie}</div>
                </div>
                <div className="flex items-center gap-2">
                  <EstadoReproductivo estado={a.estadoReproductivo} />
                  <Badge color="verde">{format(new Date(a.fechaProbableParto), "dd/MM/yyyy")}</Badge>
                </div>
              </div>
            </li>
          ))}
          {!gestantes.length && <li className="px-4 py-3 text-sm text-slate-600">Sin gestantes con FPP.</li>}
        </ul>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-semibold">Hembras</div>
        </div>
        <ul className="divide-y">
          {items.slice(0, 50).map((a) => (
            <li key={a._id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{a.numeroCaravana || a.nombre}</div>
                  <div className="text-xs text-slate-500">{a.especie}</div>
                </div>
                <EstadoReproductivo estado={a.estadoReproductivo} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

