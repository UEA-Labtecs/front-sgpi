const AUTH_EVENT = "auth-changed";

export interface User {
    role?: string;
    [key: string]: unknown;
}

export function safeGetUser<T = User>(): T | null {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        // limpa lixo para não quebrar novamente
        localStorage.removeItem("user");
        return null;
    }
}

export function setToken(token: string | null) {
    if (token) localStorage.setItem("token", token);
    else { localStorage.removeItem("token"); localStorage.removeItem("user"); }
    window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isAuthenticated() { return !!localStorage.getItem("token"); }
export function onAuthChange(cb: () => void) {
    const h = () => cb();
    window.addEventListener(AUTH_EVENT, h);
    return () => window.removeEventListener(AUTH_EVENT, h);
}