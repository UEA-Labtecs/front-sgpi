import { useState } from "react";
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
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";
import backgroundImage from "../assets/copia2.png";
import { api } from "../services/api.service";

export default function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleRegister = async () => {
        try {
            const response = await api.post("/auth/register", {
                email,
                name,
                password,
            });

            const { access_token } = response.data;

            localStorage.setItem("token", access_token);
            toast.success("Cadastro realizado com sucesso!");
            navigate("/patent-list");
        } catch (err) {
            setError("Erro ao cadastrar. Verifique os dados.");
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
                        handleRegister();
                    }}
                    sx={{ p: isMobile ? 4 : 5 }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            textAlign: "center",
                            color: "#007B8F",
                        }}
                    >
                        Cadastro
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
                        <img src={logo} alt="Logo" style={{ width: 60 }} />
                    </Box>

                    <TextField
                        fullWidth
                        label="Nome"
                        variant="outlined"
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "&:hover fieldset": { borderColor: "#007B8F" },
                                "&.Mui-focused fieldset": { borderColor: "#007B8F" },
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
                            "&:hover": {
                                backgroundColor: "#005f72",
                            },
                        }}
                    >
                        Cadastrar
                    </Button>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 4, color: "text.secondary" }}
                    >
                        Já possui uma conta?{" "}
                        <a href="/login" style={{ color: "#007B8F", textDecoration: "underline" }}>
                            Entrar
                        </a>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
