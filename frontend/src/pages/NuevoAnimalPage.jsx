import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const ESPECIES = [
  { id: "bovino", label: "Bovino" },
  { id: "equino", label: "Equino" },
  { id: "ovino", label: "Ovino" },
  { id: "porcino", label: "Porcino" },
];

export default function NuevoAnimalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [especie, setEspecie] = useState("bovino");
  const [sexo, setSexo] = useState("hembra");
  const [nombre, setNombre] = useState("");
  const [numeroCaravana, setNumeroCaravana] = useState("");
  const [edad, setEdad] = useState("");
  const [raza, setRaza] = useState("");
  const [pesoActual, setPesoActual] = useState("");
  const [foto, setFoto] = useState(null);

  const showNombre = especie === "equino" || especie === "porcino";
  const showCaravana = especie === "bovino" || especie === "ovino";

  const extraFields = useMemo(() => {
    if (especie === "bovino") {
      return (
        <select className="rounded-xl border px-3 py-2 text-sm" name="categoriaBovino" defaultValue="">
          <option value="">Categoría (opcional)</option>
          <option value="cria">Cría</option>
          <option value="recria">Recría</option>
          <option value="engorde">Engorde</option>
        </select>
      );
    }
    if (especie === "equino") {
      return (
        <>
          <input className="rounded-xl border px-3 py-2 text-sm" name="color" placeholder="Color (opcional)" />
          <select className="rounded-xl border px-3 py-2 text-sm" name="usoEquino" defaultValue="">
            <option value="">Uso (opcional)</option>
            <option value="trabajo">Trabajo</option>
            <option value="deporte">Deporte</option>
            <option value="reproduccion">Reproducción</option>
            <option value="otro">Otro</option>
          </select>
        </>
      );
    }
    if (especie === "ovino") {
      return (
        <select className="rounded-xl border px-3 py-2 text-sm" name="aptitudOvino" defaultValue="">
          <option value="">Aptitud (opcional)</option>
          <option value="carne">Carne</option>
          <option value="lana">Lana</option>
          <option value="mixto">Mixto</option>
        </select>
      );
    }
    if (especie === "porcino") {
      return (
        <select className="rounded-xl border px-3 py-2 text-sm" name="categoriaPorcino" defaultValue="">
          <option value="">Categoría (opcional)</option>
          <option value="lechon">Lechón</option>
          <option value="recria">Recría</option>
          <option value="engorde">Engorde</option>
          <option value="reproductor">Reproductor</option>
        </select>
      );
    }
    return null;
  }, [especie]);

  return (
    <div className="mx-auto grid max-w-xl gap-4">
      <div>
        <div className="text-lg font-bold">Nuevo animal</div>
        <div className="text-sm text-slate-600">Formulario adaptativo por especie</div>
      </div>

      <form
        className="grid gap-3 rounded-2xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            const fd = new FormData(e.currentTarget);
            fd.set("especie", especie);
            fd.set("sexo", sexo);
            if (nombre) fd.set("nombre", nombre);
            if (numeroCaravana) fd.set("numeroCaravana", numeroCaravana);
            if (edad) fd.set("edad", edad);
            if (raza) fd.set("raza", raza);
            if (pesoActual) fd.set("pesoActual", pesoActual);
            if (foto) fd.set("foto", foto);

            const res = await api.post("/api/animales", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            const id = res?.data?.data?._id;
            navigate(id ? `/animales/${id}` : "/animales");
          } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Error creando animal");
          } finally {
            setLoading(false);
          }
        }}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <select className="rounded-xl border px-3 py-2 text-sm" value={especie} onChange={(e) => setEspecie(e.target.value)}>
            {ESPECIES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
          <select className="rounded-xl border px-3 py-2 text-sm" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="hembra">Hembra</option>
            <option value="macho">Macho</option>
            <option value="castrado">Castrado</option>
          </select>
        </div>

        {showNombre && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        )}
        {showCaravana && (
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Número de caravana"
            value={numeroCaravana}
            onChange={(e) => setNumeroCaravana(e.target.value)}
          />
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Edad (meses)" value={edad} onChange={(e) => setEdad(e.target.value)} />
          <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
        </div>

        <input className="rounded-xl border px-3 py-2 text-sm" placeholder="Peso actual (kg)" value={pesoActual} onChange={(e) => setPesoActual(e.target.value)} />

        <div className="grid gap-2 sm:grid-cols-2">{extraFields}</div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-slate-700">Foto (opcional)</span>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
        </label>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}

