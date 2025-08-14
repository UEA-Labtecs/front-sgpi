import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/GridLegacy";
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Stack,
    TableContainer,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.service";
import { type DashboardSummary } from "../types/dashboard";
import Layout from "../components/Layout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

const stepLabels = [
    "1. Cadastro",
    "2. Busca",
    "3. Guia",
    "4. Exame formal",
    "5. Mérito",
    "6. Concessão",
];

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get<DashboardSummary>("/dashboard/summary");
            setData(res.data);
        } catch (e) {
            toast.error("Erro ao carregar dashboard.");
            console.error("Erro ao carregar dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        if (!data) return [];
        return Array.from({ length: 6 }, (_, i) => ({
            etapa: stepLabels[i],
            qtd: data.steps_counts?.[i] ?? 0,
        }));
    }, [data]);

    if (loading) {
        return (
            <Layout>
                <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* main da página ocupa toda a altura disponível do Layout */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,               // 🔑 permite descendentes com overflow
                    gap: 2,
                    p: { xs: 2, md: 3 },
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>

                {/* Cards (Grid v2) */}
                <Grid container spacing={2}>
                    <Grid xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Minhas Patentes
                            </Typography>
                            <Typography variant="h4">
                                {data?.total_user_patents ?? 0}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Patentes Relacionadas
                            </Typography>
                            <Typography variant="h4">
                                {data?.total_related_patents ?? 0}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Gráfico (altura fixa responsiva) */}
                <Paper sx={{
                    p: 0,
                    flex: 1,                 // 🔑 ocupa o restante da altura
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,            // 🔑 deixa o TableContainer rolar
                }}>
                    <Typography variant="h6" gutterBottom>
                        Patentes por etapa
                    </Typography>
                    <Box sx={{ width: "100%", height: { xs: 220, sm: 280 } }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="etapa" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="qtd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Lista com scroll interno (igual à página de patentes) */}
                <Paper
                    sx={{
                        p: 0,
                        flex: 1,                 // 🔑 ocupa o restante da altura
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,            // 🔑 deixa o TableContainer rolar
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ p: 2, pb: 1 }}
                    >
                        <Typography variant="h6">
                            Minhas Patentes (Top por relacionadas)
                        </Typography>
                        <Button variant="text" onClick={() => navigate("/patent-list")}>
                            Ir para listagem
                        </Button>
                    </Stack>

                    <TableContainer
                        sx={{
                            flex: 1,                  // 🔑 cresce e cria a área rolável
                            overflow: "auto",
                            borderTop: "1px solid #eee",
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Título</TableCell>
                                    <TableCell align="right">Etapa</TableCell>
                                    <TableCell align="right">Relacionadas</TableCell>
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(data?.top_user_patents ?? []).map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.titulo || "Sem título"}</TableCell>
                                        <TableCell align="right">
                                            {(row.status ?? 0) + 1} / 6
                                        </TableCell>
                                        <TableCell align="right">{row.related_count}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() =>
                                                    navigate("/patent-list", {
                                                        state: { openPatentId: row.id },
                                                    })
                                                }
                                            >
                                                Abrir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!data || data.top_user_patents.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography variant="body2" color="text.secondary">
                                                Nenhuma patente cadastrada ainda.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Layout>
    );
};

export default Dashboard;
