import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/animales", label: "Animales" },
  { to: "/sanitario", label: "Sanitario" },
  { to: "/instrucciones", label: "Instrucciones" },
  { to: "/reproduccion", label: "Reproducción" },
  { to: "/calculadora", label: "Calculadora" },
];

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            className="text-left"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            <div className="text-sm font-semibold text-[color:var(--agro-verde)]">
              AgroTrack
            </div>
            <div className="text-xs text-slate-500">Gestión Animal</div>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Salir
          </button>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-2 pb-2">
          <div className="flex gap-2 px-2">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-sm",
                    isActive
                      ? "bg-[color:var(--agro-verde)] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50 border",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}

