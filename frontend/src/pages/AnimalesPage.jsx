import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import AnimalCard from "../components/AnimalCard";

export default function AnimalesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [especie, setEspecie] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoReproductivo, setEstadoReproductivo] = useState("");
  const [activo, setActivo] = useState("true");

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (especie) q.set("especie", especie);
    if (sexo) q.set("sexo", sexo);
    if (estadoReproductivo) q.set("estadoReproductivo", estadoReproductivo);
    if (activo) q.set("activo", activo);
    q.set("limit", "50");
    return q.toString();
  }, [especie, sexo, estadoReproductivo, activo]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    api
      .get(`/api/animales?${query}`)
      .then((res) => {
        if (!mounted) return;
        setItems(res?.data?.data?.items || []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Error cargando animales");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold">Animales</div>
          <div className="text-sm text-slate-600">Lista unificada con filtros</div>
        </div>
        <Link
          to="/animales/nuevo"
          className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Nuevo
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <select className="rounded-lg border px-3 py-2 text-sm" value={especie} onChange={(e) => setEspecie(e.target.value)}>
            <option value="">Todas las especies</option>
            <option value="bovino">Bovinos</option>
            <option value="equino">Equinos</option>
            <option value="ovino">Ovinos</option>
            <option value="porcino">Porcinos</option>
          </select>
          <select className="rounded-lg border px-3 py-2 text-sm" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Todos los sexos</option>
            <option value="hembra">Hembras</option>
            <option value="macho">Machos</option>
            <option value="castrado">Castrados</option>
          </select>
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={estadoReproductivo}
            onChange={(e) => setEstadoReproductivo(e.target.value)}
          >
            <option value="">Estado reproductivo (todas)</option>
            <option value="vacia">Vacía</option>
            <option value="en_celo">En celo</option>
            <option value="servida">Servida</option>
            <option value="gestante">Gestante</option>
            <option value="preparto">Preparto</option>
            <option value="lactando">Lactando</option>
            <option value="descarte">Descarte</option>
          </select>
          <select className="rounded-lg border px-3 py-2 text-sm" value={activo} onChange={(e) => setActivo(e.target.value)}>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-600">Cargando…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((a) => (
          <AnimalCard key={a._id} animal={a} />
        ))}
      </div>
    </div>
  );
}

