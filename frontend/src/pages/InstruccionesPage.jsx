import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Badge from "../components/Badge";
import { FUENTES_AR, problemasPara } from "../lib/sanidadAR";

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}

function prioridadBadge(p) {
  if (p === "rojo") return "rojo";
  if (p === "naranja") return "naranja";
  return "azul";
}

export default function InstruccionesPage() {
  const [animales, setAnimales] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [animalId, setAnimalId] = useState("");
  const [peso, setPeso] = useState("");
  const [edad, setEdad] = useState("");
  const [problemaId, setProblemaId] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/api/animales?activo=true&limit=200"),
      api.get("/api/dashboard"),
    ])
      .then(([a, d]) => {
        if (!mounted) return;
        setAnimales(a?.data?.data?.items || []);
        setDashboard(d?.data?.data || null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Error cargando instrucciones");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const animal = useMemo(
    () => animales.find((x) => x._id === animalId) || null,
    [animales, animalId]
  );

  useEffect(() => {
    if (!animal) return;
    if (animal.pesoActual != null) setPeso(String(animal.pesoActual));
    if (animal.edad != null) setEdad(String(animal.edad));
    setProblemaId("");
  }, [animalId]);

  const alertas = useMemo(() => (dashboard?.alertas || []).slice(0, 20), [dashboard]);

  const animalesConAtencion = useMemo(() => {
    // Mapear por alertas priorizadas
    const ids = new Set();
    for (const a of dashboard?.alertas || []) {
      if (a?.animal?.id) ids.add(a.animal.id);
    }
    return animales.filter((x) => ids.has(String(x._id))).slice(0, 50);
  }, [animales, dashboard]);

  const problemas = useMemo(() => problemasPara(animal?.especie), [animal?.especie]);
  const problema = useMemo(() => problemas.find((p) => p.id === problemaId) || null, [problemas, problemaId]);

  if (loading) return <div className="text-sm text-slate-600">Cargando…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>;

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-lg font-bold">Instrucciones (Sanidad)</div>
        <div className="text-sm text-slate-600">
          Asistente orientativo para priorizar animales y registrar acciones. **No reemplaza al veterinario**.
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Animales que requieren atención</div>
        <div className="mt-1 text-xs text-slate-500">
          Basado en alertas (sanidad, reproducción y desparasitación). Elegí uno para ver sugerencias.
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(animalesConAtencion || []).map((a) => (
            <button
              type="button"
              key={a._id}
              onClick={() => setAnimalId(a._id)}
              className={[
                "rounded-xl border p-3 text-left hover:bg-slate-50",
                animalId === a._id ? "border-emerald-300 bg-emerald-50" : "bg-white",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{a.numeroCaravana || a.nombre}</div>
              <div className="text-xs text-slate-600">
                {a.especie} • {a.sexo} {a.pesoActual != null ? `• ${a.pesoActual} kg` : ""}{" "}
                {a.edad != null ? `• ${a.edad} meses` : ""}
              </div>
            </button>
          ))}
          {!animalesConAtencion.length && (
            <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
              No hay animales destacados por alertas. Igual podés seleccionar cualquier animal y consultar opciones.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Seleccionar animal</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Animal" hint="Podés elegir cualquiera. Si tiene peso/edad, se autocompleta.">
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {animales.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.numeroCaravana || a.nombre} • {a.especie}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <Link
              to="/animales/nuevo"
              className="w-full rounded-xl border px-3 py-2 text-center text-sm hover:bg-slate-50"
            >
              + Registrar animal
            </Link>
          </div>
          <Field label="Peso (kg)" hint="Usar el peso actual o medir si hay dudas.">
            <input className="rounded-xl border px-3 py-2 text-sm" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ej: 360" />
          </Field>
          <Field label="Edad (meses)" hint="Afecta recomendaciones preventivas (vacunas/categoría).">
            <input className="rounded-xl border px-3 py-2 text-sm" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ej: 24" />
          </Field>
        </div>

        {animal && (
          <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
            Seleccionado: <strong>{animal.numeroCaravana || animal.nombre}</strong> ({animal.especie}).{" "}
            <Link className="text-[color:var(--agro-verde)] underline" to={`/animales/${animal._id}`}>
              Abrir ficha
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Posible problema y acciones</div>
        <div className="mt-1 text-xs text-slate-500">
          Mostramos opciones frecuentes por especie con principios activos típicos en Argentina. Confirmar con veterinario y marbete SENASA.
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Problema (orientativo)" hint={!animal ? "Primero elegí un animal" : ""}>
            <select
              className="rounded-xl border px-3 py-2 text-sm disabled:bg-slate-100"
              value={problemaId}
              onChange={(e) => setProblemaId(e.target.value)}
              disabled={!animal}
            >
              <option value="">Seleccionar…</option>
              {problemas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Field>
          <div className="rounded-xl border bg-amber-50 p-3 text-xs text-amber-950">
            **Seguridad:** antibióticos y sedantes requieren criterio veterinario. Si hay fiebre alta, decaimiento severo, cólico o dificultad respiratoria,
            priorizá veterinario.
          </div>
        </div>

        {problema && (
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border bg-white p-3">
              <div className="text-sm font-semibold">{problema.nombre}</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase text-slate-700">Señales frecuentes</div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-slate-800">
                    {problema.señales.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs font-semibold uppercase text-slate-700">Qué hacer ahora</div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-slate-800">
                    {problema.que_hacer.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-3 rounded-xl border bg-emerald-50 p-3">
                <div className="text-xs font-semibold uppercase text-emerald-900">Opciones habituales (principios activos)</div>
                <ul className="mt-1 list-disc pl-5 text-sm text-emerald-950">
                  {problema.opciones_tratamiento.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                {problema.nota && <div className="mt-2 text-xs text-emerald-900">{problema.nota}</div>}
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-700">Fuentes / referencia</div>
              <ul className="mt-1 list-disc pl-5">
                {FUENTES_AR.map((f, i) => (
                  <li key={i}>
                    <span className="font-medium">{f.titulo}</span>: {f.detalle}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold">Alertas recientes (prioridad)</div>
        <div className="mt-1 text-xs text-slate-500">Para ubicar rápidamente qué venció o qué está próximo.</div>
        <ul className="mt-3 divide-y rounded-xl border bg-white">
          {alertas.map((a, idx) => (
            <li key={`${a.refId || "x"}-${idx}`} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={prioridadBadge(a.prioridad)}>{a.prioridad}</Badge>
                    <span className="text-sm font-medium">{a.titulo}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{a.mensaje}</div>
                  {a.animal && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-[color:var(--agro-verde)] underline"
                      onClick={() => setAnimalId(a.animal.id)}
                    >
                      Seleccionar {a.animal.numeroCaravana || a.animal.nombre} ({a.animal.especie})
                    </button>
                  )}
                </div>
                {a.tipo && <span className="text-xs text-slate-400">{a.tipo}</span>}
              </div>
            </li>
          ))}
          {!alertas.length && <li className="px-4 py-3 text-sm text-slate-600">Sin alertas.</li>}
        </ul>
      </div>
    </div>
  );
}

