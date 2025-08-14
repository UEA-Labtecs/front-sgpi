import React, { type ReactNode, useEffect, useState } from "react";
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
    Button,
    IconButton,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu"; // ✅ ícone correto
import logo from "../assets/logo.png";
import { api } from "../services/api.service";
import toast from "react-hot-toast";
import { safeGetUser, setToken } from "../services/auth.service";

const drawerWidth = 240;
const appBarHeight = 64;

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<any>(safeGetUser() || null);
    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        // carrega /auth/me na primeira vez para popular o menu com o papel certo
        (async () => {
            try {
                const { data } = await api.get("/auth/me");
                localStorage.setItem("user", JSON.stringify(data));
                setUser(data); // força re-render do menu quando chegar
            } catch {
                /* 401 tratado no interceptor */
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

    const drawer = (
        <List sx={{ mt: 1 }}>
            {getMenuItems().map((item, idx) => (
                <ListItem
                    component="div"
                    key={idx}
                    onClick={() => {
                        navigate(item.path); 6
                        if (isMobile) setMobileOpen(false); // fecha o menu no mobile ao navegar
                    }}
                    sx={{
                        m: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all .2s",
                        "&:hover": { backgroundColor: "#e0f7fa", transform: "scale(1.02)", boxShadow: 1 },
                    }}
                >
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontWeight: 500, color: "#007B8F" }}
                    />
                </ListItem>
            ))}
            {/* botão de sair dentro do drawer no mobile */}
            {isMobile && (
                <ListItem
                    component="div"
                    onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                    }}
                    sx={{
                        m: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all .2s",
                        "&:hover": { backgroundColor: "#ffecec", transform: "scale(1.02)" },
                    }}
                >
                    <ListItemText
                        primary="Sair"
                        primaryTypographyProps={{ fontWeight: 500, color: "error.main" }}
                    />
                </ListItem>
            )}
        </List>
    );

    return (
        <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
            <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, backgroundColor: "#007B8F" }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="abrir menu"
                            onClick={() => setMobileOpen((s) => !s)}
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon /> {/* ✅ sem prop open */}
                        </IconButton>
                    )}
                    <Avatar src={logo} sx={{ mr: 2, width: 28, height: 40, p: 1 }} />
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        {!isMobile ? "Sistema de Gerenciamento de Patentes Industriais" : "SGPI"}
                    </Typography>
                    {/* no desktop mantém o botão direto na appbar */}
                    {!isMobile && (
                        <Button color="inherit" onClick={handleLogout}>
                            Sair
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Drawer mobile (temporary) */}
            <Drawer
                variant="temporary"
                open={isMobile && mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        pt: `${appBarHeight}px`,
                        backgroundColor: "#f5f5f5",
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Drawer desktop (permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        pt: `${appBarHeight}px`,
                        backgroundColor: "#f5f5f5",
                    },
                }}
                open
            >
                {drawer}
            </Drawer>

            {/* Conteúdo */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    mt: `${appBarHeight}px`,
                    height: `calc(100vh - ${appBarHeight}px)`,
                    overflowY: "auto",
                    overflowX: "hidden",        // 👈 bloqueia scroll lateral
                    p: { xs: 2, md: 3 }
                }}
            >
                {children}
            </Box>


        </Box>
    );
};

export default Layout;
