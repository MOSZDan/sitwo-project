import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api': {
                target: 'https://sitwo-project-backend-vzq2.onrender.com',
                changeOrigin: true,
                secure: false, // opcional, Render ya da SSL válido
            }
        }

    },

});
