import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
    allowed: string[];          // ex: ['admin']
    children: React.ReactNode;
};

function getRole(): string {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return (user?.role || "").toLowerCase();
    } catch {
        return "";
    }
}

export default function RequireRole({ allowed, children }: Props) {
    const isAuthenticated = !!localStorage.getItem("token");
    const role = getRole();
    const loc = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: loc }} />;
    }

    const allowedLc = allowed.map((r) => r.toLowerCase());
    if (!allowedLc.includes(role)) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
}
