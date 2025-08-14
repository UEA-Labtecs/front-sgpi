import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    useTheme,
    useMediaQuery,
    Stack,
} from "@mui/material";

import logo from "../assets/logo.png";
import backgroundImage from "../assets/copia2.png";
import { api } from "../services/api.service";
import { setToken } from "../services/auth.service";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post(
                "/auth/login",
                new URLSearchParams({
                    grant_type: "password",
                    username,
                    password,
                    scope: "",
                    client_id: "string",
                    client_secret: "********",
                }).toString(),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const { access_token } = response.data;
            setToken(access_token); // já configura o axios + localStorage, se seu service fizer isso

            // carrega o usuário para liberar menus/rotas logo após login
            try {
                const { data } = await api.get("/auth/me");
                localStorage.setItem("user", JSON.stringify(data));
            } catch {
                /* interceptor 401 já lida */
            }

            toast.success("Bem-vindo!");
            navigate("/patent-list", { replace: true });
        } catch {
            setError("Usuário ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100dvh",               // melhor para mobile (endereço do navegador)
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 2, sm: 3 },
                // overlay suave para legibilidade em cima do bg
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: { xs: 360, sm: 420 },   // limita largura no mobile
                    borderRadius: { xs: 2, sm: 4 },
                    boxShadow: { xs: 3, sm: 8 },
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(4px)",
                }}
                elevation={0}
            >
                <CardContent
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!loading) handleLogin();
                    }}
                    sx={{ p: { xs: 3, sm: 4 } }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            fontSize: isMobile ? 26 : 32,
                            fontWeight: 700,
                            textAlign: "center",
                            color: "#007B8F",
                            margin: 0,
                        }}
                    >
                        SGPI
                    </motion.h1>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: 76, sm: 92 },
                            height: { xs: 76, sm: 92 },
                            backgroundColor: "#007B8F",
                            borderRadius: "50%",
                            my: { xs: 2, sm: 3 },
                            mx: "auto",
                            boxShadow: 2,
                        }}
                    >
                        <img
                            src={logo}
                            alt="SGPI Logo"
                            style={{ width: isMobile ? 44 : 60, height: "auto" }}
                        />
                    </Box>

                    <Stack spacing={1.25}>
                        <TextField
                            fullWidth
                            label="Usuário"
                            variant="outlined"
                            size="small"               // inputs menores no mobile
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "&:hover fieldset": { borderColor: "#007B8F" },
                                    "&.Mui-focused fieldset": { borderColor: "#007B8F" },
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Senha"
                            type="password"
                            variant="outlined"
                            size="small"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "&:hover fieldset": { borderColor: "#007B8F" },
                                    "&.Mui-focused fieldset": { borderColor: "#007B8F" },
                                },
                            }}
                        />

                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading || !username || !password}
                            sx={{
                                mt: 0.5,
                                height: 44,                  // altura confortável no touch
                                borderRadius: 2,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                backgroundColor: "#007B8F",
                                "&:hover": { backgroundColor: "#005f72" },
                            }}
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
