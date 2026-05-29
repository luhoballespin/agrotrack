import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import EstadoReproductivo from "../components/EstadoReproductivo";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { todayISO, diffDaysFromToday } from "../lib/dates";
import { calcularFechaParto } from "../lib/constants";

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1.5 text-sm border",
        active ? "bg-[color:var(--agro-verde)] text-white border-[color:var(--agro-verde)]" : "bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AnimalDetallePage() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [pesos, setPesos] = useState([]);
  const [repro, setRepro] = useState([]);
  const [san, setSan] = useState([]);
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openPeso, setOpenPeso] = useState(false);
  const [openSanitario, setOpenSanitario] = useState(false);
  const [openRepro, setOpenRepro] = useState(false);
  const [reproTipo, setReproTipo] = useState("deteccion_celo");
  const [reproFecha, setReproFecha] = useState(todayISO());
  const [plan, setPlan] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function refreshAll() {
    const [a, p, r, s] = await Promise.all([
      api.get(`/api/animales/${id}`),
      api.get(`/api/pesos/${id}`),
      api.get(`/api/reproductivo/${id}`),
      api.get(`/api/sanitario?animalId=${id}`),
    ]);
    const an = a?.data?.data || null;
    setAnimal(an);
    setPesos(p?.data?.data || []);
    setRepro(r?.data?.data || []);
    setSan(s?.data?.data || []);
    if (an && ["bovino", "porcino"].includes(an.especie)) {
      const pl = await api.get(`/api/alimentacion/${id}`);
      setPlan(pl?.data?.data || null);
    } else {
      setPlan(null);
    }
  }

  function openReproModal(tipo) {
    setActionError("");
    setReproTipo(tipo);
    setReproFecha(todayISO());
    setOpenRepro(true);
  }

  const fppPreview =
    animal &&
    (reproTipo === "servicio_natural" || reproTipo === "inseminacion_artificial") &&
    reproFecha
      ? calcularFechaParto(animal.especie, reproFecha)
      : null;

  const diasParto = animal?.fechaProbableParto ? diffDaysFromToday(animal.fechaProbableParto) : null;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    refreshAll()
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Error cargando animal");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pesoData = useMemo(
    () =>
      (pesos || []).map((x) => ({
        fecha: format(new Date(x.fecha), "dd/MM"),
        peso: x.peso,
      })),
    [pesos]
  );

  if (loading) return <div className="text-sm text-slate-600">Cargando…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>;
  if (!animal) return <div className="text-sm text-slate-600">No encontrado.</div>;

  const title = animal.numeroCaravana || animal.nombre;

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full border bg-slate-100">
            {animal.foto ? (
              <img alt={title} src={animal.foto} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">Sin foto</div>
            )}
          </div>
          <div>
            <div className="text-lg font-bold">{title}</div>
            <div className="text-sm text-slate-600">
              {animal.especie} • {animal.sexo} {animal.pesoActual != null ? `• ${animal.pesoActual} kg` : ""}
            </div>
            {animal.sexo === "hembra" && (
              <div className="mt-2">
                <EstadoReproductivo estado={animal.estadoReproductivo} />
              </div>
            )}
          </div>
        </div>
        <Link to="/animales" className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          Volver
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "general"} onClick={() => setTab("general")}>
          Datos
        </TabButton>
        <TabButton active={tab === "pesos"} onClick={() => setTab("pesos")}>
          Pesos
        </TabButton>
        <TabButton active={tab === "sanitario"} onClick={() => setTab("sanitario")}>
          Sanitario
        </TabButton>
        {animal.sexo === "hembra" && (
          <TabButton active={tab === "repro"} onClick={() => setTab("repro")}>
            Reproducción
          </TabButton>
        )}
        {["bovino", "porcino"].includes(animal.especie) && (
          <TabButton active={tab === "alimentacion"} onClick={() => setTab("alimentacion")}>
            Alimentación
          </TabButton>
        )}
      </div>

      {tab === "general" && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Raza</span>
              <span className="font-medium">{animal.raza || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Edad (meses)</span>
              <span className="font-medium">{animal.edad ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Activo</span>
              <span className="font-medium">{animal.activo ? "Sí" : "No"}</span>
            </div>
            {animal.observaciones && (
              <div className="mt-2 rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">{animal.observaciones}</div>
            )}
          </div>
        </div>
      )}

      {tab === "pesos" && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Historial de pesos</div>
              <div className="text-xs text-slate-500">Recharts LineChart</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActionError("");
                setOpenPeso(true);
              }}
              className="rounded-xl bg-[color:var(--agro-verde)] px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Registrar peso
            </button>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pesoData}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="peso" stroke="#2d6a4f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "sanitario" && (
        <div className="rounded-2xl border bg-white">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Timeline sanitario</div>
                <div className="text-xs text-slate-500">Eventos sanitarios del animal</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setOpenSanitario(true);
                }}
                className="rounded-xl bg-[color:var(--agro-verde)] px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Registrar evento
              </button>
            </div>
          </div>
          <ul className="divide-y">
            {(san || []).map((e) => (
              <li key={e._id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {e.tipo} {e.nombre ? `• ${e.nombre}` : ""}
                    </div>
                    <div className="text-xs text-slate-500">{format(new Date(e.fecha), "dd/MM/yyyy")}</div>
                  </div>
                  {e.fechaProxima && <Badge color="naranja">Próx: {format(new Date(e.fechaProxima), "dd/MM/yyyy")}</Badge>}
                </div>
              </li>
            ))}
            {!(san || []).length && <li className="px-4 py-3 text-sm text-slate-600">Sin eventos.</li>}
          </ul>
        </div>
      )}

      {tab === "repro" && (
        <div className="rounded-2xl border bg-white">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Reproducción</div>
                <div className="text-xs text-slate-500">Estado y eventos</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionError("");
                  setReproTipo("deteccion_celo");
                  setOpenRepro(true);
                }}
                className="rounded-xl bg-[color:var(--agro-verde)] px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Registrar evento
              </button>
            </div>
          </div>
          <div className="px-4 py-3 text-sm">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Estado</span>
                <EstadoReproductivo estado={animal.estadoReproductivo} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Último celo</span>
                <span className="font-medium">{animal.fechaUltimoCelo ? format(new Date(animal.fechaUltimoCelo), "dd/MM/yyyy") : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Último servicio</span>
                <span className="font-medium">{animal.fechaUltimoServicio ? format(new Date(animal.fechaUltimoServicio), "dd/MM/yyyy") : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Probable parto</span>
                <span className="font-medium">{animal.fechaProbableParto ? format(new Date(animal.fechaProbableParto), "dd/MM/yyyy") : "-"}</span>
              </div>
              {diasParto != null && animal.estadoReproductivo === "gestante" && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
                  {diasParto <= 0 ? "Parto estimado hoy o vencido" : `Faltan ${diasParto} días para el parto estimado`}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => openReproModal("deteccion_celo")} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                Registrar celo
              </button>
              <button type="button" onClick={() => openReproModal("servicio_natural")} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                Registrar servicio
              </button>
              <button type="button" onClick={() => openReproModal("parto")} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                Registrar parto
              </button>
            </div>
          </div>
          <ul className="divide-y">
            {(repro || []).map((e) => (
              <li key={e._id} className="px-4 py-3">
                <div className="text-sm font-medium">{e.tipo.replaceAll("_", " ")}</div>
                <div className="text-xs text-slate-500">{format(new Date(e.fecha), "dd/MM/yyyy")}</div>
                {e.resultado && <div className="mt-1 text-sm text-slate-700">{e.resultado}</div>}
              </li>
            ))}
            {!(repro || []).length && <li className="px-4 py-3 text-sm text-slate-600">Sin eventos.</li>}
          </ul>
        </div>
      )}

      {tab === "alimentacion" && (
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">Plan de alimentación activo</div>
          {!plan && <div className="mt-2 text-sm text-slate-600">Sin plan activo. Usá la calculadora para generar uno y guardarlo.</div>}
          {plan && (
            <div className="mt-3 grid gap-2 text-sm">
              <div>
                Objetivo: {plan.pesoInicial} → {plan.pesoObjetivo} kg en {plan.diasPlanificados} días
              </div>
              <div>
                GDP: {plan.gdpDiaria} kg/día • MS: {plan.consumoMSDiario} kg/día
              </div>
              <div className="grid gap-2">
                {(plan.etapas || []).map((e, i) => (
                  <div key={i} className="rounded-xl border bg-slate-50 p-3">
                    <div className="font-medium">{e.nombre}</div>
                    <div className="text-xs text-slate-600">
                      {e.duracionDias} días • Forraje {e.forraje_kg} • Concentrado {e.concentrado_kg} kg MS/día
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={openPeso} title="Registrar peso" onClose={() => setOpenPeso(false)}>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setActionLoading(true);
            setActionError("");
            try {
              const fd = new FormData(e.currentTarget);
              const peso = Number(fd.get("peso"));
              const fecha = fd.get("fecha");
              const observaciones = fd.get("observaciones");
              await api.post("/api/pesos", {
                animalId: id,
                peso,
                fecha: fecha ? new Date(fecha).toISOString() : undefined,
                observaciones,
              });
              await refreshAll();
              setOpenPeso(false);
            } catch (err) {
              setActionError(err?.response?.data?.message || err?.message || "Error registrando peso");
            } finally {
              setActionLoading(false);
            }
          }}
        >
          <input
            name="peso"
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Peso (kg)"
            required
          />
          <input name="fecha" type="date" defaultValue={todayISO()} className="rounded-xl border px-3 py-2 text-sm" />
          <textarea
            name="observaciones"
            className="min-h-20 rounded-xl border px-3 py-2 text-sm"
            placeholder="Observaciones (opcional)"
          />
          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {actionError}
            </div>
          )}
          <button
            type="submit"
            disabled={actionLoading}
            className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {actionLoading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>

      <Modal open={openSanitario} title="Registrar evento sanitario" onClose={() => setOpenSanitario(false)}>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setActionLoading(true);
            setActionError("");
            try {
              const fd = new FormData(e.currentTarget);
              await api.post("/api/sanitario", {
                animalId: id,
                tipo: fd.get("tipo"),
                nombre: fd.get("nombre") || undefined,
                fecha: fd.get("fecha"),
                fechaProxima: fd.get("fechaProxima") || undefined,
                dosis: fd.get("dosis") || undefined,
                veterinario: fd.get("veterinario") || undefined,
                observaciones: fd.get("observaciones") || undefined,
              });
              await refreshAll();
              setOpenSanitario(false);
            } catch (err) {
              setActionError(err?.response?.data?.message || err?.message || "Error registrando evento");
            } finally {
              setActionLoading(false);
            }
          }}
        >
          <select name="tipo" className="rounded-xl border px-3 py-2 text-sm" defaultValue="vacuna" required>
            <option value="vacuna">Vacuna</option>
            <option value="desparasitacion">Desparasitación</option>
            <option value="consulta">Consulta</option>
            <option value="cirugia">Cirugía</option>
            <option value="vitaminas">Vitaminas</option>
            <option value="otro">Otro</option>
          </select>
          <input name="nombre" className="rounded-xl border px-3 py-2 text-sm" placeholder="Nombre (ej: Aftosa)" />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-slate-600">
              Fecha
              <input name="fecha" type="date" defaultValue={todayISO()} className="rounded-xl border px-3 py-2 text-sm" required />
            </label>
            <label className="grid gap-1 text-xs text-slate-600">
              Próxima (para alertas)
              <input name="fechaProxima" type="date" className="rounded-xl border px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input name="dosis" className="rounded-xl border px-3 py-2 text-sm" placeholder="Dosis (opcional)" />
            <input name="veterinario" className="rounded-xl border px-3 py-2 text-sm" placeholder="Veterinario (opcional)" />
          </div>
          <textarea
            name="observaciones"
            className="min-h-20 rounded-xl border px-3 py-2 text-sm"
            placeholder="Observaciones (opcional)"
          />
          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {actionError}
            </div>
          )}
          <button
            type="submit"
            disabled={actionLoading}
            className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {actionLoading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>

      <Modal open={openRepro} title="Registrar evento reproductivo" onClose={() => setOpenRepro(false)}>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setActionLoading(true);
            setActionError("");
            try {
              const fd = new FormData(e.currentTarget);
              const res = await api.post("/api/reproductivo", {
                animalId: id,
                tipo: reproTipo,
                fecha: reproFecha,
                resultado: fd.get("resultado") || undefined,
                pesoNacimiento: fd.get("pesoNacimiento") ? Number(fd.get("pesoNacimiento")) : undefined,
                veterinario: fd.get("veterinario") || undefined,
                observaciones: fd.get("observaciones") || undefined,
              });
              const an = res?.data?.data?.animal;
              if (an) setAnimal(an);
              await refreshAll();
              setOpenRepro(false);
            } catch (err) {
              setActionError(err?.response?.data?.message || err?.message || "Error registrando evento");
            } finally {
              setActionLoading(false);
            }
          }}
        >
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={reproTipo}
            onChange={(e) => setReproTipo(e.target.value)}
          >
            <option value="deteccion_celo">Detección de celo</option>
            <option value="servicio_natural">Servicio natural</option>
            <option value="inseminacion_artificial">Inseminación artificial</option>
            <option value="diagnostico_gestacion">Diagnóstico de gestación</option>
            <option value="parto">Parto</option>
            <option value="aborto">Aborto</option>
            <option value="destete">Destete</option>
          </select>
          <label className="grid gap-1 text-xs text-slate-600">
            Fecha
            <input
              name="fecha"
              type="date"
              value={reproFecha}
              onChange={(e) => setReproFecha(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
              required
            />
          </label>
          {fppPreview && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Fecha probable de parto: <strong>{format(fppPreview, "dd/MM/yyyy")}</strong>
            </div>
          )}
          {reproTipo === "parto" && (
            <input
              name="pesoNacimiento"
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder="Peso nacimiento (kg) (opcional)"
            />
          )}
          <input name="resultado" className="rounded-xl border px-3 py-2 text-sm" placeholder="Resultado (opcional)" />
          <input name="veterinario" className="rounded-xl border px-3 py-2 text-sm" placeholder="Veterinario (opcional)" />
          <textarea
            name="observaciones"
            className="min-h-20 rounded-xl border px-3 py-2 text-sm"
            placeholder="Observaciones (opcional)"
          />
          <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
            Si registrás <strong>servicio</strong> o <strong>inseminación</strong>, AgroTrack calcula automáticamente la{" "}
            <strong>fecha probable de parto</strong>.
          </div>
          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {actionError}
            </div>
          )}
          <button
            type="submit"
            disabled={actionLoading}
            className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {actionLoading ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

