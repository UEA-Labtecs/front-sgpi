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
    Typography
} from "@mui/material";
import PatentTimeline from "./PatentTimeline";
import Layout from "../components/Layout";
import { api } from "../services/api.service";

export interface Patent {
    id: number;
    titulo: string;
    numero_pedido: string;
    status: number;
    info?: Record<number, { info: string }>;
}

const Patents: React.FC = () => {
    const [patents, setPatents] = useState<Patent[]>([]);
    const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchPatents();
    }, []);

    const fetchPatents = async () => {
        try {
            const response = await api.get<[]>("/patents");
            setPatents(response.data);
        } catch (error) {
            console.error("Erro ao buscar patentes", error);
        }
    };

    const updatePatentInfo = async (
        updatedInfo: Record<number, { info: string }>,
        updatedStatus: number
    ) => {
        if (!selectedPatent) return;

        try {
            await api.put(`/patents/${selectedPatent.id}/etapas`, {
                status: updatedStatus,
                info: updatedInfo,
            });

            setPatents((prev) =>
                prev.map((p) =>
                    p.id === selectedPatent.id
                        ? { ...p, status: updatedStatus, info: updatedInfo }
                        : p
                )
            );
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

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Título</TableCell>
                                <TableCell>Nº Pedido</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patents.map((patent) => (
                                <TableRow key={patent.id}>
                                    <TableCell>{patent.titulo}</TableCell>
                                    <TableCell>{patent.numero_pedido}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setSelectedPatent(patent);
                                                setOpen(true);
                                            }}
                                        >
                                            Ver Etapas
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                                onUpdate={updatePatentInfo}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default Patents;
