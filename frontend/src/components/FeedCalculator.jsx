import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}

export default function FeedCalculator() {
  const [animales, setAnimales] = useState([]);
  const [animalId, setAnimalId] = useState("");
  const [especie, setEspecie] = useState("bovino");
  const [objetivo, setObjetivo] = useState("engorde");
  const [modo, setModo] = useState("estimar_tiempo");
  const [pesoActual, setPesoActual] = useState("");
  const [pesoObjetivo, setPesoObjetivo] = useState("");
  const [diasDisponibles, setDiasDisponibles] = useState("90");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/api/animales?activo=true&limit=100")
      .then((res) => {
        const items = (res?.data?.data?.items || []).filter((a) =>
          ["bovino", "porcino"].includes(a.especie)
        );
        setAnimales(items);
      })
      .catch(() => {});
  }, []);

  const animalSeleccionado = useMemo(
    () => animales.find((a) => a._id === animalId),
    [animales, animalId]
  );

  useEffect(() => {
    if (!animalId || !animalSeleccionado) return;
    setEspecie(animalSeleccionado.especie);
    if (animalSeleccionado.pesoActual != null) {
      setPesoActual(String(animalSeleccionado.pesoActual));
    }
    const base = animalSeleccionado.pesoActual || (animalSeleccionado.especie === "bovino" ? 300 : 50);
    const sugerido =
      animalSeleccionado.especie === "bovino"
        ? Math.round(base * 1.15)
        : Math.round(base * 1.25);
    setPesoObjetivo(String(sugerido));
  }, [animalId, animalSeleccionado]);

  const animalesFiltrados = animales.filter((a) => a.especie === especie);

  async function handleCalcular(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    setResult(null);
    try {
      const payload = {
        especie,
        objetivo,
        modo,
        pesoActual: Number(pesoActual),
        pesoObjetivo: Number(pesoObjetivo),
        animalId: animalId || undefined,
      };
      if (modo === "planificar_por_dias") {
        payload.diasDisponibles = Number(diasDisponibles);
      }
      const res = await api.post("/api/calculadora", payload);
      setResult(res?.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error calculando");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div>
        <div className="text-lg font-bold">Calculadora de alimentación</div>
        <div className="text-sm text-slate-600">
          Estimá tiempo de engorde o levante de peso con plan de forraje y concentrado sugerido (bovinos y porcinos).
        </div>
      </div>

      <form className="grid gap-4 rounded-2xl border bg-white p-4" onSubmit={handleCalcular}>
        {/* Animal */}
        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-800">1. Animal</div>
          <p className="mt-1 text-xs text-slate-600">
            Elegí un animal ya cargado o ingresá los datos manualmente. El peso actual se completa solo si está en el sistema.
          </p>
          <div className="mt-3 grid gap-2">
            <Field label="Animal de la base de datos" hint="Opcional — vincula el plan al historial del animal">
              <select
                className="rounded-xl border bg-white px-3 py-2 text-sm"
                value={animalId}
                onChange={(e) => {
                  setAnimalId(e.target.value);
                  if (!e.target.value) return;
                }}
              >
                <option value="">— Sin vincular / datos manuales —</option>
                {animales.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.numeroCaravana || a.nombre || "Sin nombre"} · {a.especie} ·{" "}
                    {a.pesoActual != null ? `${a.pesoActual} kg` : "sin peso"}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/animales/nuevo"
                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                + Registrar animal nuevo
              </Link>
              {animalSeleccionado && (
                <Link
                  to={`/animales/${animalSeleccionado._id}`}
                  className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  Ver ficha del animal
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Especie y objetivo */}
        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-800">2. Especie y objetivo</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Especie" hint={animalId ? "Definida por el animal seleccionado" : ""}>
              <select
                className="rounded-xl border bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                value={especie}
                disabled={Boolean(animalId)}
                onChange={(e) => setEspecie(e.target.value)}
              >
                <option value="bovino">Bovino</option>
                <option value="porcino">Porcino</option>
              </select>
            </Field>
            <Field label="Objetivo productivo">
              <select
                className="rounded-xl border bg-white px-3 py-2 text-sm"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
              >
                <option value="engorde">Engorde (terminación)</option>
                <option value="levantar_peso">Levantar peso / crecimiento</option>
                <option value="recria">Recría</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Pesos */}
        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-800">3. Pesos (kg)</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Peso actual (kg)" hint="Peso vivo hoy. Si elegiste animal, se autocompleta.">
              <input
                type="number"
                min="1"
                step="0.1"
                required
                className="rounded-xl border bg-white px-3 py-2 text-sm"
                value={pesoActual}
                onChange={(e) => setPesoActual(e.target.value)}
                placeholder="Ej: 360"
              />
            </Field>
            <Field label="Peso objetivo (kg)" hint="Peso que querés alcanzar al final del plan.">
              <input
                type="number"
                min="1"
                step="0.1"
                required
                className="rounded-xl border bg-white px-3 py-2 text-sm"
                value={pesoObjetivo}
                onChange={(e) => setPesoObjetivo(e.target.value)}
                placeholder={especie === "bovino" ? "Ej: 420" : "Ej: 110"}
              />
            </Field>
          </div>
        </div>

        {/* Modo cálculo */}
        <div className="rounded-xl border bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-800">4. ¿Cómo querés calcular?</div>
          <div className="mt-3 grid gap-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border bg-white p-3">
              <input
                type="radio"
                name="modo"
                checked={modo === "estimar_tiempo"}
                onChange={() => setModo("estimar_tiempo")}
                className="mt-1"
              />
              <span>
                <span className="text-sm font-medium">Estimar tiempo necesario</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  Calcula cuántos días llevará llegar al peso objetivo con una ganancia diaria óptima para la especie.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border bg-white p-3">
              <input
                type="radio"
                name="modo"
                checked={modo === "planificar_por_dias"}
                onChange={() => setModo("planificar_por_dias")}
                className="mt-1"
              />
              <span>
                <span className="text-sm font-medium">Ya tengo un plazo fijo (días)</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  Indicá cuántos días tenés disponibles y calculamos la ganancia diaria y el plan de alimento.
                </span>
              </span>
            </label>
          </div>
          {modo === "planificar_por_dias" && (
            <div className="mt-3">
              <Field label="Días disponibles" hint="Duración total del plan de alimentación">
                <input
                  type="number"
                  min="1"
                  required
                  className="rounded-xl border bg-white px-3 py-2 text-sm"
                  value={diasDisponibles}
                  onChange={(e) => setDiasDisponibles(e.target.value)}
                  placeholder="Ej: 90"
                />
              </Field>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Calculando plan..." : "Calcular plan de alimentación"}
        </button>
      </form>

      {result && (
        <div className="grid gap-3 rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">Resultado del plan</div>
          {result.resumen && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {result.resumen}
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs text-slate-500">Tiempo estimado</div>
              <div className="text-lg font-bold">{result.diasPlanificados} días</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs text-slate-500">Ganancia diaria (GDP)</div>
              <div className="text-lg font-bold">{result.gdpDiaria} kg/día</div>
              <div className="text-xs text-slate-500">
                Referencia óptima {especie}: ~{result.gdpOptimaReferencia} kg/día
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs text-slate-500">Ganancia total</div>
              <div className="text-lg font-bold">+{result.gananciaTotal} kg</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs text-slate-500">Consumo MS estimado</div>
              <div className="text-lg font-bold">{result.consumoMSDiario} kg/día</div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-900">
              Tipo de alimento sugerido
            </div>
            <p className="mt-1 text-sm text-amber-950">{result.tipoAlimentoSugerido}</p>
          </div>

          <div>
            <div className="text-sm font-medium">Etapas del plan</div>
            <div className="mt-2 grid gap-2">
              {(result.etapas || []).map((et, idx) => (
                <div key={idx} className="rounded-xl border bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">
                    {et.nombre} · {et.duracionDias} días
                  </div>
                  <div className="mt-1">
                    Forraje: <strong>{et.forraje_kg}</strong> kg MS/día · Concentrado:{" "}
                    <strong>{et.concentrado_kg}</strong> kg MS/día
                  </div>
                  {et.descripcion && <div className="mt-1 text-xs text-slate-600">{et.descripcion}</div>}
                </div>
              ))}
            </div>
          </div>

          {(result.alertas || []).length > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
              <div className="font-semibold">Observaciones</div>
              <ul className="mt-1 list-disc pl-5">
                {result.alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="text-sm font-semibold">Guardar plan en el animal</div>
            <p className="mt-1 text-xs text-slate-600">
              El plan quedará activo en la ficha del animal (pestaña Alimentación).
            </p>
            {!animalId && animalesFiltrados.length > 0 && (
              <select
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
              >
                <option value="">Seleccionar animal para guardar…</option>
                {animalesFiltrados.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.numeroCaravana || a.nombre}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={!animalId || loading}
              className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              onClick={async () => {
                setLoading(true);
                setMsg("");
                setError("");
                try {
                  await api.post("/api/alimentacion", {
                    animalId,
                    ...result,
                  });
                  setMsg("Plan guardado correctamente.");
                } catch (err) {
                  setError(err?.response?.data?.message || err?.message || "Error guardando");
                } finally {
                  setLoading(false);
                }
              }}
            >
              Guardar plan activo
            </button>
            {animalId && (
              <Link
                to={`/animales/${animalId}`}
                className="mt-2 block text-center text-sm text-[color:var(--agro-verde)] underline"
              >
                Ver en perfil del animal →
              </Link>
            )}
            {msg && (
              <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                {msg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
