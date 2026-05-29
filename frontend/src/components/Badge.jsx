export default function Badge({ children, color = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    verde: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rojo: "bg-red-50 text-red-800 border-red-200",
    naranja: "bg-orange-50 text-orange-800 border-orange-200",
    azul: "bg-sky-50 text-sky-800 border-sky-200",
    violeta: "bg-violet-50 text-violet-800 border-violet-200",
    rosa: "bg-pink-50 text-pink-800 border-pink-200",
    marron: "bg-amber-50 text-amber-900 border-amber-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[color] || map.slate}`}>
      {children}
    </span>
  );
}

