// src/pages/PatentTimeline.tsx
import React, { useEffect, useState } from "react";
import {
    Container,
    Stepper,
    Step,
    StepLabel,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Typography,
    Button,
    Stack,
    CircularProgress,
    Link,
    Divider,
    Chip,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { api } from "../services/api.service";
import { type UserPatent, type RelatedPatent } from "./Patents";

interface PatentTimelineProps {
    patent: UserPatent;
    onUpdate: (info: Record<number, { info: string; files?: string[] }>, status: number) => Promise<void> | void;
}

const statuses = [
    "1ª Etapa: Cadastrada com sucesso",
    "2ª Etapa: Busca de patentes similares",
    "3ª Etapa: Guia de pagamento",
    "4ª Etapa: Exame Formal",
    "5ª Etapa: Exame de Mérito",
    "6ª Etapa: Concessão",
];

const PatentTimeline: React.FC<PatentTimelineProps> = ({ patent, onUpdate }) => {
    const [formData, setFormData] = useState<Record<number, { info: string; files?: string[] }>>(
        () => (patent.info as any) || {}
    );
    const [currentStep, setCurrentStep] = useState<number>(() => patent.status || 0);
    const [editModeStep, setEditModeStep] = useState<number | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);

    // Etapa 2
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [related, setRelated] = useState<RelatedPatent[]>(() => patent.patents || []);
    const [expandRelated, setExpandRelated] = useState<Record<number, boolean>>({});

    useEffect(() => {
        setFormData((patent.info as any) || {});
        setCurrentStep(patent.status || 0);
        setRelated(patent.patents || []);
    }, [patent]);

    // Regra geral de edição:
    // - etapa 1 sempre leitura
    // - etapa atual editável
    // - etapas concluídas (index < currentStep) podem ser editadas ao clicar "Editar"
    const isEditable = (index: number) => {
        if (index === 0) return false;
        if (index === currentStep) return true;
        if (index < currentStep) return index === editModeStep; // concluída só quando em modo edição
        return false;
    };

    const handleInputChange = (stepIndex: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [stepIndex]: { ...(prev[stepIndex] || {}), info: value },
        }));
    };

    const handleFilesChange = (stepIndex: number, files: FileList | null) => {
        const names = files ? Array.from(files).map((f) => f.name) : [];
        setFormData((prev) => ({
            ...prev,
            [stepIndex]: { ...(prev[stepIndex] || {}), files: names },
        }));
    };

    const handleSave = async (stepIndex: number) => {
        if (stepIndex === statuses.length - 1) setIsFinalized(true);
        await onUpdate(formData as any, stepIndex); // salva info mantendo status atual
        setEditModeStep(null);
    };

    // Finalizar qualquer etapa (GENÉRICO): avança status para a próxima
    const finalizeStep = async (stepIndex: number) => {
        const next = stepIndex + 1;
        await onUpdate(formData as any, next); // backend grava status=next e retorna atualizado
        setCurrentStep(next);                  // UX instantâneo; depois o prop `patent` sincroniza via efeito
    };

    // Etapa 2: busca INPI
    const runINPISearch = async () => {
        if (!searchTerm.trim()) return;
        try {
            setSearchLoading(true);
            await api.get("/patents/search", {
                params: { termo: searchTerm, quantidade: 3, user_patent_id: patent.id },
            });
            const { data } = await api.get<UserPatent>(`/user-patents/${patent.id}`);
            setRelated(data.patents || []);
            setSearchTerm("");
        } catch (e) {
            console.error("Erro ao buscar no INPI", e);
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <Container sx={{ pb: 3 }}>
            <Typography variant="h5" gutterBottom>
                Timeline da Patente
            </Typography>

            <Stepper activeStep={currentStep} alternativeLabel>
                {statuses.map((label, index) => (
                    <Step key={index}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box mt={4}>
                {statuses.map((status, index) => {
                    const editable = isEditable(index);
                    const concluded = index < currentStep;

                    return (
                        <Accordion key={index} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="h6" color={index === currentStep ? "primary" : "textPrimary"}>
                                        {status}
                                    </Typography>
                                    {(concluded || index === 0) && (
                                        <Chip
                                            icon={<CheckCircleIcon color="success" />}
                                            label="Concluída"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            </AccordionSummary>

                            <AccordionDetails>
                                {/* ETAPA 1 - leitura */}
                                {index === 0 && (
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                        <CheckCircleIcon color="success" />
                                        <Typography variant="body1">
                                            Cadastro realizado com sucesso. Siga para a Etapa 2 para buscar patentes similares.
                                        </Typography>
                                    </Stack>
                                )}

                                {/* ETAPA 2 - Busca (discreta/colapsada) + relacionados + finalizar */}
                                {index === 1 && (
                                    <>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="subtitle1">Patentes relacionadas</Typography>
                                            <Tooltip title={showSearch ? "Ocultar busca" : "Buscar/Adicionar patentes relacionadas"}>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    startIcon={showSearch ? <KeyboardArrowDownIcon /> : <SearchIcon />}
                                                    onClick={() => setShowSearch((s) => !s)}
                                                >
                                                    {showSearch ? "Ocultar busca" : "Adicionar / Buscar"}
                                                </Button>
                                            </Tooltip>
                                        </Stack>

                                        <Collapse in={showSearch} timeout="auto" unmountOnExit>
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                                                <TextField
                                                    label="Termo de busca"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    fullWidth
                                                    disabled={!(currentStep <= 1)} // etapa 2 usável em status 0 ou 1
                                                    size="small"
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={runINPISearch}
                                                    disabled={searchLoading || !searchTerm.trim() || !(currentStep <= 1)}
                                                >
                                                    {searchLoading ? <CircularProgress size={20} /> : "Buscar e Relacionar"}
                                                </Button>
                                            </Stack>
                                        </Collapse>

                                        {searchLoading && (
                                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                                <CircularProgress size={18} />
                                                <Typography>Buscando no INPI…</Typography>
                                            </Stack>
                                        )}

                                        {related.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                Nenhuma patente relacionada ainda.
                                            </Typography>
                                        ) : (
                                            <Box sx={{ border: "1px solid #eee", borderRadius: 1, p: 1 }}>
                                                {related.map((r) => {
                                                    const open = !!expandRelated[r.id];
                                                    return (
                                                        <Box key={r.id} sx={{ px: 1, py: 1 }}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        setExpandRelated((prev) => ({ ...prev, [r.id]: !open }))
                                                                    }
                                                                >
                                                                    {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                                                </IconButton>
                                                                <Typography sx={{ fontWeight: 600, flex: 1 }}>
                                                                    {r.titulo || "Sem título"}
                                                                </Typography>
                                                                <Typography variant="body2">Nº: {r.numero_pedido || "-"}</Typography>
                                                            </Stack>

                                                            <Collapse in={open} timeout="auto" unmountOnExit>
                                                                <Box sx={{ pl: 5, pt: 1 }}>
                                                                    <List dense>
                                                                        {r.depositante && (
                                                                            <ListItem>
                                                                                <ListItemText primary="Depositante" secondary={r.depositante} />
                                                                            </ListItem>
                                                                        )}
                                                                        {r.inventores && (
                                                                            <ListItem>
                                                                                <ListItemText primary="Inventores" secondary={r.inventores} />
                                                                            </ListItem>
                                                                        )}
                                                                        {!!r.url_detalhe && (
                                                                            <ListItem>
                                                                                <ListItemText
                                                                                    primary="Detalhe"
                                                                                    secondary={
                                                                                        <Link href={r.url_detalhe} target="_blank" rel="noreferrer">
                                                                                            Abrir página no INPI
                                                                                        </Link>
                                                                                    }
                                                                                />
                                                                            </ListItem>
                                                                        )}
                                                                    </List>
                                                                    <Divider sx={{ mt: 1 }} />
                                                                </Box>
                                                            </Collapse>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}

                                        <Stack direction="row" justifyContent="flex-end" mt={2}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                endIcon={<DoneAllIcon />}
                                                disabled={currentStep !== 1}
                                                onClick={() => finalizeStep(1)}
                                            >
                                                Finalizar etapa
                                            </Button>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />
                                    </>
                                )}

                                {/* ETAPAS 3 a 6 - uploads + observações + lógica genérica de salvar/editar/finalizar */}
                                {index >= 2 && (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Anexos da etapa
                                        </Typography>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                            <Button
                                                variant="outlined"
                                                startIcon={<AttachFileIcon />}
                                                component="label"
                                                disabled={!editable}
                                            >
                                                Selecionar arquivos
                                                <input
                                                    hidden
                                                    multiple
                                                    type="file"
                                                    onChange={(e) => handleFilesChange(index, e.target.files)}
                                                />
                                            </Button>
                                            <Typography variant="body2" color="text.secondary">
                                                {formData[index]?.files?.length
                                                    ? `${formData[index].files!.length} arquivo(s) selecionado(s)`
                                                    : "Nenhum arquivo selecionado"}
                                            </Typography>
                                        </Stack>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            sx={{ mt: 2 }}
                                            label="Observações da etapa"
                                            value={formData[index]?.info || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            disabled={!editable}
                                        />

                                        <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
                                            {index === currentStep && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    endIcon={<DoneAllIcon />}
                                                    onClick={() => finalizeStep(index)}
                                                >
                                                    Finalizar etapa
                                                </Button>
                                            )}

                                            {editable ? (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={() => handleSave(index)}
                                                >
                                                    Salvar
                                                </Button>
                                            ) : (
                                                index > 0 && concluded && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => setEditModeStep(index)}
                                                    >
                                                        Editar
                                                    </Button>
                                                )
                                            )}
                                        </Stack>
                                    </>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>

            {isFinalized && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CheckCircleIcon color="success" fontSize="large" />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Processo finalizado!
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default PatentTimeline;
