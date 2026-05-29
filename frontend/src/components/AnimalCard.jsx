import { Link } from "react-router-dom";
import Badge from "./Badge";
import EstadoReproductivo from "./EstadoReproductivo";

const especieColor = {
  bovino: "marron",
  equino: "azul",
  ovino: "violeta",
  porcino: "rosa",
};

export default function AnimalCard({ animal }) {
  const title = animal.numeroCaravana || animal.nombre || "Sin identificación";

  return (
    <Link
      to={`/animales/${animal._id}`}
      className="block rounded-xl border bg-white p-3 hover:bg-slate-50"
    >
      <div className="flex gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-slate-100">
          {animal.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={title} src={animal.foto} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
              Sin foto
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={especieColor[animal.especie] || "slate"}>{animal.especie}</Badge>
            <div className="truncate text-sm font-semibold">{title}</div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>{animal.sexo}</span>
            {animal.pesoActual != null && <span>• {animal.pesoActual} kg</span>}
          </div>
          {animal.sexo === "hembra" && (
            <div className="mt-2">
              <EstadoReproductivo estado={animal.estadoReproductivo} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

