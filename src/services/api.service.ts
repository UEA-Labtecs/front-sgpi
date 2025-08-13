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
        const url = err?.config?.url || "";
        const onLoginPage = window.location.pathname === "/login";
        const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");

        if (status === 401 && !onLoginPage && !isAuthEndpoint) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(err);
        }

        // ... resto do toast de erro
        return Promise.reject(err);
    }
);

