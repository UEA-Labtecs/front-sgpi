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
    status: number;
    info?: Record<number, { info: string }>;
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

    const updatePatentInfo = async (
        updatedInfo: Record<number, { info: string }>,
        updatedStatus: number
    ) => {
        if (!selectedPatent) return;

        try {
            const { data } = await api.put(`/patents/${selectedPatent.id}/etapas`, {
                status: updatedStatus,
                info: updatedInfo,
            }); // data: UserPatent

            // reflete na tabela
            setUserPatents((prev) =>
                prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))
            );

            // reflete no modal/timeline
            setSelectedPatent((prev) => (prev && prev.id === data.id ? { ...prev, ...data } : prev));
        } catch (error) {
            console.error("Erro ao atualizar patente", error);
        }
    };

    return (
        <Layout>
            <Box sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Minhas Patentes
                </Typography>

                {/* Criar "minha patente" */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
                    <TextField
                        label="Título da minha patente"
                        variant="outlined"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Descrição (opcional)"
                        variant="outlined"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        onClick={createUserPatent}
                        disabled={creating || !titulo.trim()}
                    >
                        {creating ? <CircularProgress size={20} /> : "Cadastrar"}
                    </Button>
                </Stack>

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
                            <PatentTimeline patent={selectedPatent} onUpdate={updatePatentInfo} />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default Patents;
