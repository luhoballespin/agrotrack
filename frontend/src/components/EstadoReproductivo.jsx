import Badge from "./Badge";

const colorByEstado = {
  vacia: "slate",
  en_celo: "rosa",
  servida: "azul",
  gestante: "verde",
  preparto: "naranja",
  lactando: "marron",
  descarte: "rojo",
};

export default function EstadoReproductivo({ estado }) {
  if (!estado) return null;
  return <Badge color={colorByEstado[estado] || "slate"}>{estado.replaceAll("_", " ")}</Badge>;
}

