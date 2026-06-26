import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[color:var(--agro-crema)]">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-[color:var(--agro-verde)]">AgroTrack</div>
          <div className="mt-1 text-xl font-bold">Crear cuenta</div>
          <div className="mt-1 text-sm text-slate-600">
            Registrá un usuario para administrar la app con credenciales propias.
          </div>

          <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Nombre</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Usuario</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Email</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Contraseña</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium text-slate-700">Confirmar contraseña</span>
              <input
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-[color:var(--agro-verde)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link className="font-semibold text-[color:var(--agro-verde)] hover:underline" to="/login">
            Ingresar
          </Link>
        </div>
      </div>
    </div>
  );
}
