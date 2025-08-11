import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, CircularProgress, Table, TableHead,
    TableRow, TableCell, TableBody, Button, Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.service";
import { type DashboardSummary } from "../types/dashboard";
import Layout from "../components/Layout";

// recharts
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const stepLabels = [
    "1. Cadastro", "2. Busca", "3. Guia", "4. Exame formal", "5. Mérito", "6. Concessão"
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
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>

                {/* Cards */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid component="div">
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Minhas Patentes
                            </Typography>
                            <Typography variant="h4">
                                {data?.total_user_patents ?? 0}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid >
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

                {/* Gráfico por etapas */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Patentes por etapa
                    </Typography>
                    <Box sx={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" color="blue" />
                                <XAxis dataKey="etapa" color="blue" />
                                <YAxis allowDecimals={false} color="blue" />
                                <Tooltip />
                                <Bar dataKey="qtd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Top minhas patentes */}
                <Paper sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Minhas Patentes (Top por relacionadas)</Typography>
                        <Button variant="text" onClick={() => navigate("/patent-list")}>
                            Ir para listagem
                        </Button>
                    </Stack>
                    <Table size="small">
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
                                    <TableCell align="right">{(row.status ?? 0) + 1} / 6</TableCell>
                                    <TableCell align="right">{row.related_count}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() =>
                                                navigate("/patent-list", { state: { openPatentId: row.id } })
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
                </Paper>
            </Box>
        </Layout>
    );
};

export default Dashboard;
