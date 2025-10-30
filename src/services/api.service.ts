import axios from "axios";
import { toast } from "react-hot-toast";

// Em desenvolvimento, usa URL relativa para passar pelo proxy do Vite
// Em produção, usa a variável de ambiente ou URL absoluta
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Em desenvolvimento, usa URL relativa para passar pelo proxy
    if (import.meta.env.DEV) {
        return "";
    }
    // Fallback para produção
    return "http://api-sgpi.labtecs.com.br";
};

export const api = axios.create({
    baseURL: getBaseURL(),
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
        const url = err?.config?.url || "";
        const onLoginPage = window.location.pathname === "/login";
        const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");

        if (status === 401 && !onLoginPage && !isAuthEndpoint) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(err);
        }
        toast.error(
            status === 401
                ? "Sessão expirada. Faça login novamente."
                : `Erro ao acessar ${url}. Código: ${status}.`
        );
        // ... resto do toast de erro
        return Promise.reject(err);
    }
);

