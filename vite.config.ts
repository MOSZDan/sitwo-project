import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    server: mode === "development"
        ? {
            proxy: {
                "/api": {
                    target: "https://notificct.dpdns.org", // Cambiar a HTTPS
                    changeOrigin: true,
                    secure: true, // Habilitar SSL para HTTPS
                },
            },
        }
        : undefined,
}));
