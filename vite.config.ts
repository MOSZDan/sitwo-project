import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss()],
    server: mode === "development"
        ? {
            proxy: {
                "/api": {
                    target: "http://127.0.0.1:8000", // backend local (Django)
                    changeOrigin: true,
                    secure: false,
                },
            },
        }
        : undefined,

}));
