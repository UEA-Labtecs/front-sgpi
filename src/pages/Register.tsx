import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/copia2.png";
import logo from "../assets/logo.png";
import { api } from "../services/api.service";
import { setToken } from "../services/auth.service";

export default function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Só admins podem acessar essa tela
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if ((user?.role || "").toLowerCase() !== "admin") {
            toast.error("Acesso restrito a administradores.");
            navigate("/patent-list", { replace: true });
        }
    }, [navigate]);

    const handleRegister = async () => {
        setError(null);

        // validações simples
        if (!name.trim()) return setError("Informe o nome.");
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Email inválido.");
        if (password.length < 6) return setError("A senha deve ter ao menos 6 caracteres.");

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                email,
                name,
                password,
                role,
            });

            const { access_token } = response.data;
            setToken(access_token); // configura axios + guarda token

            // carrega /auth/me para refletir permissões no front
            try {
                const { data } = await api.get("/auth/me");
                localStorage.setItem("user", JSON.stringify(data));
            } catch {
                /* se der 401, o interceptor trata */
            }

            toast.success("Cadastro realizado com sucesso!");
            navigate("/patent-list", { replace: true });
        } catch {
            setError("Erro ao cadastrar. Verifique os dados.");
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: "user", label: "Usuário" },
        { value: "viewer", label: "Visualizador" },
        { value: "admin", label: "Administrador" },
    ];

    return (
        <Box
            sx={{
                minHeight: "100dvh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 2, sm: 3 },
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Card
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: { xs: 360, sm: 420 },
                    borderRadius: { xs: 2, sm: 4 },
                    boxShadow: { xs: 3, sm: 8 },
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    backdropFilter: "blur(4px)",
                }}
            >
                <CardContent
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!loading) handleRegister();
                    }}
                    sx={{ p: { xs: 3, sm: 4 } }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            fontSize: isMobile ? 24 : 30,
                            fontWeight: 700,
                            textAlign: "center",
                            color: "#007B8F",
                            margin: 0,
                        }}
                    >
                        Cadastro
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
                            alt="Logo"
                            style={{ width: isMobile ? 44 : 60, height: "auto" }}
                        />
                    </Box>

                    <Stack spacing={1.25}>
                        <TextField
                            fullWidth
                            label="Nome"
                            variant="outlined"
                            size="small"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
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
                            label="Email"
                            type="email"
                            variant="outlined"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
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
                            autoComplete="new-password"
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
                            label="Função"
                            select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            variant="outlined"
                            size="small"
                            SelectProps={{ MenuProps: { PaperProps: { elevation: 3 } } }}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    "&:hover fieldset": { borderColor: "#007B8F" },
                                    "&.Mui-focused fieldset": { borderColor: "#007B8F" },
                                },
                            }}
                        >
                            {roleOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 0.5,
                                height: 44,
                                borderRadius: 2,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                backgroundColor: "#007B8F",
                                "&:hover": { backgroundColor: "#005f72" },
                            }}
                        >
                            {loading ? "Cadastrando..." : "Cadastrar"}
                        </Button>

                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2, color: "text.secondary" }}
                        >
                            Já possui uma conta?{" "}
                            <a
                                href="/login"
                                style={{ color: "#007B8F", textDecoration: "underline" }}
                            >
                                Entrar
                            </a>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
