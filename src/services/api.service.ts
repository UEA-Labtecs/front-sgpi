import axios from "axios";
import { toast } from "react-hot-toast";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        const status = err?.response?.status;
        const cfg = err?.config ?? {};
        // 🔕 permitir silenciar toasts por requisição
        const skip = cfg.headers?.["X-Skip-Error-Toast"] === "1";

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(err);
        }

        if (!skip) {
            const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null) ??
                err?.message ??
                "Erro inesperado. Tente novamente.";
            toast.error(msg);
        }
        return Promise.reject(err);
    }
);
