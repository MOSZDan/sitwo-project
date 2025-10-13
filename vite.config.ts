import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    server: mode === "development"
        ? {
            proxy: {
                "/api": {
                    target: "http://localhost:8000", // Servidor Django local
                    changeOrigin: true,
                    secure: false, // No necesitamos SSL para desarrollo local
                },
            },
        }
        : undefined,
}));
