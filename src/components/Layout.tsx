import React, { type ReactNode, useEffect } from "react";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { api } from "../services/api.service";
import toast from "react-hot-toast";

const drawerWidth = 240;
const appBarHeight = 64; // padrão do MUI AppBar com Toolbar
import { safeGetUser, setToken } from "../services/auth.service";

interface LayoutProps {
    children: ReactNode;
}


// src/components/Layout.tsx (troque o topo do componente)
const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const user = safeGetUser() || {};
    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        // carrega /auth/me se ainda não tiver
        
        (async () => {
            try {
                const { data } = await api.get("/auth/me");
                localStorage.setItem("user", JSON.stringify(data));
            } catch {
                // 401 já é tratado pelo interceptor
            }
        })();
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        setToken(null);
        toast("Você saiu da sessão.");
        navigate("/login", { replace: true });
    };

    const getMenuItems = () => {
        const commonItems = [
            { label: "Listar Patentes", path: "/patent-list" },
            { label: "Dashboard", path: "/dashboard" },
        ];
        if ((user?.role || "").toLowerCase() === "admin") {
            return [{ label: "Cadastrar Usuários", path: "/register" }, ...commonItems];
        }
        return commonItems;
    };

    return (
        <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
            {/* Barra superior */}
            <AppBar position="fixed" sx={{ zIndex: 1300, backgroundColor: "#007B8F" }}>
                <Toolbar>
                    <Avatar src={logo} sx={{ mr: 2, width: 28, height: 40, p: 1 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Sistema de Gerenciamento de Patentes Industriais
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Menu lateral */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        backgroundColor: "#f5f5f5",
                        borderRight: "1px solid #ddd",
                        paddingTop: `${appBarHeight}px`, // empurra o conteúdo do menu abaixo da AppBar
                    },
                }}
            >
                <List>
                    {getMenuItems().map((item, index) => (
                        <ListItem
                            component="div"
                            key={index}
                            onClick={() => navigate(item.path)}
                            sx={{
                                m: 1,
                                borderRadius: 2,
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    backgroundColor: "#e0f7fa",
                                    transform: "scale(1.02)",
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                },
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    color: "#007B8F",
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Conteúdo principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    width: `calc(100% - ${drawerWidth}px)`,
                    marginTop: `${appBarHeight}px`, // empurra o conteúdo principal abaixo da AppBar
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
