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
} from "@mui/material";

import logo from "../assets/logo.png";
import backgroundImage from "../assets/copia2.png";
import { api } from "../services/api.service";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleLogin = async () => {
        try {
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
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );


            const { access_token } = response.data;

            localStorage.setItem("token", access_token);
            try {
                const { data } = await api.get("/auth/me");
                localStorage.setItem("user", JSON.stringify(data));
            } catch {/* interceptor 401 já lida */ }
            toast.success("Bem-vindo!");
            navigate(`/patent-list`);
        } catch (err) {
            setError("Usuário ou senha incorretos.");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                px: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 4,
                    boxShadow: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(6px)",
                }}
            >
                <CardContent
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                    sx={{ p: isMobile ? 4 : 5 }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#007B8F" }}
                    >
                        SGPI
                    </motion.h1>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 100,
                            height: 100,
                            backgroundColor: "#007B8F",
                            borderRadius: "50%",
                            margin: "24px auto",
                            boxShadow: 3,
                        }}
                    >
                        <img src={logo} alt="SGPI Logo" style={{ width: 60 }} />
                    </Box>

                    <TextField
                        fullWidth
                        label="Usuário"
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e: any) => setUsername(e.target.value.toString())}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#007B8F' },
                                '&.Mui-focused fieldset': { borderColor: '#007B8F' },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#007B8F' },
                                '&.Mui-focused fieldset': { borderColor: '#007B8F' },
                            },
                        }}
                    />

                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: "bold",
                            backgroundColor: "#007B8F",
                            '&:hover': { backgroundColor: "#005f72" },
                        }}
                    >
                        Entrar
                    </Button>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 4, color: "text.secondary" }}
                    >
                        Não tem uma conta?{" "}
                        <a href="/register" style={{ color: "#007B8F", textDecoration: "underline" }}>
                            Cadastre-se
                        </a>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
