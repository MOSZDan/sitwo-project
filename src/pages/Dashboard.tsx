// src/pages/Dashboard.tsx

import {useAuth} from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import PacienteDashboard from "../components/PacienteDashboard";


const Dashboard = () => {
    const {user} = useAuth();

    console.log("Componente Dashboard renderizado. Usuario:", user);
    // Si aún no se cargan los datos del usuario, muestra un mensaje
    if (!user) {
        return <div>Cargando...</div>;
    }
    console.log("Verificando usuario en Dashboard:", user);

    if (user.idtipousuario === 2) {
        return <PacienteDashboard/>;
    } else {
        // Para cualquier otro rol (Admin, Recepcionista, etc.), muestra el panel de la clínica
        return <AdminDashboard/>;
    }
};

export default Dashboard;