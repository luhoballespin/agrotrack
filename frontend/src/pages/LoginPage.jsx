import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[color:var(--agro-crema)]">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-[color:var(--agro-verde)]">AgroTrack</div>
          <div className="mt-1 text-xl font-bold">Ingreso</div>
          <div className="mt-1 text-sm text-slate-600">
            Usuario administrador único (configurado en <code>.env</code> del backend)
          </div>

          <form
            className="mt-6 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError("");
              try {
                await login(username, password);
                navigate("/dashboard");
              } catch (err) {
                setError(err?.response?.data?.message || err?.message || "No se pudo iniciar sesión");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Usuario</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Contraseña</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Backend configurado en <code>VITE_API_URL</code>
        </div>
        <div className="text-center text-sm text-slate-600">
          ¿No tenés cuenta?{" "}
          <Link className="font-semibold text-[color:var(--agro-verde)] hover:underline" to="/register">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

