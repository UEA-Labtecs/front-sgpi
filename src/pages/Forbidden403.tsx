import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Forbidden403() {
    const navigate = useNavigate();
    return (
        <Box sx={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 3 }}>
            <Typography variant="h3" color="error">403</Typography>
            <Typography variant="h6">Acesso negado</Typography>
            <Typography variant="body2" color="text.secondary">Você não tem permissão para acessar esta página.</Typography>
            <Button onClick={() => navigate("/")} variant="contained" sx={{ mt: 2 }}>Voltar</Button>
        </Box>
    );
}
