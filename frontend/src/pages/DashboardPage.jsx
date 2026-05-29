import { useEffect, useState } from "react";
import api from "../lib/api";
import AlertaPanel from "../components/AlertaPanel";
import Badge from "../components/Badge";
import { format } from "date-fns";

function Card({ title, children }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    api
      .get("/api/dashboard")
      .then((res) => {
        if (!mounted) return;
        setData(res?.data?.data || null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Error cargando dashboard");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="text-sm text-slate-600">Cargando dashboard…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>;

  const total = data?.totalPorEspecie || {};

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card title="Bovinos">
          <div className="text-2xl font-bold">{total.bovino || 0}</div>
        </Card>
        <Card title="Equinos">
          <div className="text-2xl font-bold">{total.equino || 0}</div>
        </Card>
        <Card title="Ovinos">
          <div className="text-2xl font-bold">{total.ovino || 0}</div>
        </Card>
        <Card title="Porcinos">
          <div className="text-2xl font-bold">{total.porcino || 0}</div>
        </Card>
      </div>

      <AlertaPanel alertas={data?.alertas || []} />

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <div className="text-sm font-semibold">Próximos partos</div>
            <div className="text-xs text-slate-500">Hembras gestantes ordenadas por fecha</div>
          </div>
          <ul className="divide-y">
            {(data?.proximosPartos || []).slice(0, 10).map((a) => (
              <li key={a._id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{a.numeroCaravana || a.nombre}</div>
                  <Badge color="verde">{format(new Date(a.fechaProbableParto), "dd/MM/yyyy")}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">{a.especie}</div>
              </li>
            ))}
            {!(data?.proximosPartos || []).length && (
              <li className="px-4 py-3 text-sm text-slate-600">Sin partos próximos.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3">
            <div className="text-sm font-semibold">Animales en celo</div>
            <div className="text-xs text-slate-500">Hembras con estado reproductivo en_celo</div>
          </div>
          <ul className="divide-y">
            {(data?.animalesEnCelo || []).slice(0, 10).map((a) => (
              <li key={a._id} className="px-4 py-3">
                <div className="text-sm font-medium">{a.numeroCaravana || a.nombre}</div>
                <div className="text-xs text-slate-500">{a.especie}</div>
              </li>
            ))}
            {!(data?.animalesEnCelo || []).length && (
              <li className="px-4 py-3 text-sm text-slate-600">Sin animales en celo.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

