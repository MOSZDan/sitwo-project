import { createBrowserRouter } from "react-router-dom";
import RegisterPatientForm from "./pages/RegisterPatientForm";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div className="min-h-screen grid place-items-center">Home</div>,
  },
  {
    path: "/register",
    element: <RegisterPatientForm />,
  },
  {
    path: "*",
    element: <div className="min-h-screen grid place-items-center">404</div>,
  },
]);
