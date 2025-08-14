import React, { useState, useEffect } from "react";
import Grid from "@mui/material/GridLegacy";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Stack,
    TextField,
    CircularProgress,
    Paper,
    Collapse,
} from "@mui/material";
import PatentTimeline from "./PatentTimeline";
import Layout from "../components/Layout";
import { api } from "../services/api.service";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export interface RelatedPatent {
    id: number;
    titulo: string;
    numero_pedido: string;
    url_detalhe?: string;
    depositante?: string;
    inventores?: string;
}

export interface UserPatent {
    id: number;
    titulo: string;
    descricao?: string;
    status: number; // 0..5
    patents?: RelatedPatent[];
}

const Patents: React.FC = () => {
    const [userPatents, setUserPatents] = useState<UserPatent[]>([]);
    const [selectedPatent, setSelectedPatent] = useState<UserPatent | null>(null);
    const [open, setOpen] = useState(false);

    // form de criação
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [creating, setCreating] = useState(false);
    const [loadingRow, setLoadingRow] = useState<number | null>(null);

    const role = (JSON.parse(localStorage.getItem("user") || "{}")?.role || "").toLowerCase();
    const isViewer = role === "viewer" || role === "read_only" || role === "leitor";

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUserPatents();
    }, []);

    const fetchUserPatents = async () => {
        try {
            const { data } = await api.get<UserPatent[]>("/patents");
            setUserPatents(data);
        } catch (error) {
            console.error("Erro ao listar minhas patentes", error);
        }
    };

    const createUserPatent = async () => {
        if (!titulo.trim()) return;
        try {
            setCreating(true);
            await api.post<UserPatent>("/patents/minhas-patentes", { titulo, descricao });
            setTitulo("");
            setDescricao("");
            toast.success("Patente cadastrada!");
            await fetchUserPatents();
        } catch (e) {
            console.error("Erro ao criar minha patente", e);
        } finally {
            setCreating(false);
        }
    };

    const openTimeline = async (id: number) => {
        try {
            setLoadingRow(id);
            const { data } = await api.get<UserPatent>(`/patents/${id}`);
            setSelectedPatent(data);
            setOpen(true);
        } catch (e) {
            console.error("Erro ao buscar detalhes da minha patente", e);
        } finally {
            setLoadingRow(null);
        }
    };

    const updatePatentStatus = async (newStatus: number) => {
        if (!selectedPatent) return;
        try {
            const { data } = await api.put(`/patents/${selectedPatent.id}/etapas`, { status: newStatus });
            setUserPatents((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
            setSelectedPatent((prev) => (prev && prev.id === data.id ? { ...prev, ...data } : prev));
            toast.success("Etapa atualizada!");
        } catch (error) {
            console.error("Erro ao atualizar status", error);
        }
    };

    return (
        <Layout>
            
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: { xs: 1.5, sm: 2 },
                    width: "100%",
                    maxWidth: { lg: 1200 },
                    mx: { lg: "auto", xs: 0 },
                }}
            >

                <Typography variant="h4" gutterBottom>
                    Minhas Patentes
                </Typography>

                {/* Formulário compacto e colapsável */}
                {!isViewer && (
                    <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontSize: { xs: 16, md: 18 } }}>
                                Cadastrar nova patente
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={showForm ? <CloseIcon /> : <AddIcon />}
                                onClick={() => setShowForm((s) => !s)}
                            >
                                {showForm ? "Ocultar" : "Nova patente"}
                            </Button>
                        </Stack>

                        <Collapse in={showForm} timeout="auto" unmountOnExit>
                            <Grid
                                container
                                rowSpacing={{ xs: 1, sm: 2 }}
                                columnSpacing={{ xs: 1, sm: 2 }}
                                alignItems="stretch"
                                sx={{ mt: { xs: 1, sm: 2 } }}
                            >
                                <Grid xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        label="Título da minha patente"
                                        variant="outlined"
                                        size="small"
                                        margin="dense"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </Grid>

                                <Grid xs={12} sm={5}>
                                    <TextField
                                        fullWidth
                                        label="Descrição (opcional)"
                                        variant="outlined"
                                        size="small"
                                        margin="dense"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                    />
                                </Grid>

                                <Grid xs={12} sm={2} display="flex" alignItems={{ xs: "stretch", sm: "center" }}>
                                    <Button
                                        variant="contained"
                                        onClick={createUserPatent}
                                        disabled={creating || !titulo.trim()}
                                        fullWidth
                                        sx={{
                                            height: 40, // igual aos TextFields small
                                            whiteSpace: "nowrap",
                                            px: { xs: 2, sm: 2.5 },
                                            mt: { xs: 0.5, sm: 0 },
                                        }}
                                    >
                                        {creating ? <CircularProgress size={18} /> : "Cadastrar"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Paper>
                )}

                {/* Listagem das minhas patentes */}
                <Paper sx={{ p: 0 }}>
                    <TableContainer
                        sx={{
                            mt: 2,
                            maxHeight: { xs: "56vh", sm: "60vh", md: "65vh" },
                            overflow: "auto",
                            borderRadius: 1,
                            border: "1px solid #eee",
                        }}
                    >
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Título</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userPatents.map((patent) => (
                                    <TableRow key={patent.id} hover>
                                        <TableCell>{patent.titulo}</TableCell>
                                        <TableCell>{patent.descricao || "-"}</TableCell>
                                        <TableCell>{patent.status ?? 0}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" size="small" onClick={() => openTimeline(patent.id)}>
                                                {loadingRow === patent.id ? <CircularProgress size={18} /> : "Ver Etapas"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {userPatents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography>Nenhuma patente cadastrada ainda.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Modal Timeline */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle>Status da Patente</DialogTitle>
                    <DialogContent>
                        {selectedPatent && (
                            <PatentTimeline patent={selectedPatent} onUpdateStatus={updatePatentStatus} />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default Patents;
