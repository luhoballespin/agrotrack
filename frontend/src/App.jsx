import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnimalesPage from "./pages/AnimalesPage";
import NuevoAnimalPage from "./pages/NuevoAnimalPage";
import AnimalDetallePage from "./pages/AnimalDetallePage";
import SanitarioPage from "./pages/SanitarioPage";
import InstruccionesPage from "./pages/InstruccionesPage";
import ReproduccionPage from "./pages/ReproduccionPage";
import CalculadoraPage from "./pages/CalculadoraPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/animales" element={<AnimalesPage />} />
        <Route path="/animales/nuevo" element={<NuevoAnimalPage />} />
        <Route path="/animales/:id" element={<AnimalDetallePage />} />
        <Route path="/sanitario" element={<SanitarioPage />} />
        <Route path="/instrucciones" element={<InstruccionesPage />} />
        <Route path="/reproduccion" element={<ReproduccionPage />} />
        <Route path="/calculadora" element={<CalculadoraPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
