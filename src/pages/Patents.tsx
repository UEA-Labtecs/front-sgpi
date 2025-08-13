import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import PatentTimeline from "./PatentTimeline";
import Layout from "../components/Layout";
import { api } from "../services/api.service";
import toast from "react-hot-toast";

// src/pages/Patents.tsx (ou num arquivo types)
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
    status: number;           // 0..5
    patents?: RelatedPatent[];
}


const Patents: React.FC = () => {
    const [userPatents, setUserPatents] = useState<UserPatent[]>([]);
    const [selectedPatent, setSelectedPatent] = useState<UserPatent | null>(null);
    const [open, setOpen] = useState(false);

    // form de criação de "minha patente"
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [creating, setCreating] = useState(false);
    const [loadingRow, setLoadingRow] = useState<number | null>(null); // quando abre modal e puxa detalhe

    const role = (JSON.parse(localStorage.getItem("user") || "{}")?.role || "").toLowerCase();
    const isViewer = role === "viewer" || role === "read_only" || role === "leitor";

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
            // pega o detalhe já com as relacionadas
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
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Minhas Patentes
                </Typography>

                {/* Criar "minha patente" */}
                {!isViewer && (
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        mb={3}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="stretch"            // ⬅️ permite esticar os filhos na altura
                    >
                        <TextField
                            label="Título da minha patente"
                            variant="outlined"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            sx={{ flex: "1 1 280px", minWidth: 260 }}
                        />

                        <TextField
                            label="Descrição (opcional)"
                            variant="outlined"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            sx={{ flex: "1 1 280px", minWidth: 260 }}
                        />

                        <Button
                            variant="contained"
                            onClick={createUserPatent}
                            disabled={creating || !titulo.trim()}
                            sx={{
                                flex: "0 0 auto",
                                whiteSpace: "nowrap",
                                px: 3,
                                minWidth: 140,
                                alignSelf: "stretch",       // ⬅️ estica na altura do maior item (o TextField)
                                height: 56,                 // ⬅️ garante mesma altura do TextField (outlined/medium)
                            }}
                        >
                            {creating ? <CircularProgress size={20} /> : "Cadastrar"}
                        </Button>
                    </Stack>


                )}
                {/* Listagem das minhas patentes */}
                <TableContainer>
                    <Table>
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
                                <TableRow key={patent.id}>
                                    <TableCell>{patent.titulo}</TableCell>
                                    <TableCell>{patent.descricao || "-"}</TableCell>
                                    <TableCell>{patent.status ?? 0}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            onClick={() => openTimeline(patent.id)}
                                        >
                                            {loadingRow === patent.id ? (
                                                <CircularProgress size={18} />
                                            ) : (
                                                "Ver Etapas"
                                            )}
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

                {/* Modal Timeline */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle>Status da Patente</DialogTitle>
                    <DialogContent>
                        {selectedPatent && (
                            <PatentTimeline
                                patent={selectedPatent}
                                onUpdateStatus={updatePatentStatus}  // <-- só status
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default Patents;
