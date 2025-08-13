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
    onUpdateStatus: (status: number) => Promise<void> | void; // apenas status
}

type StageLocal = { description: string; file?: File | null; url?: string };

const statuses = [
    "1ª Etapa: Cadastrada com sucesso",
    "2ª Etapa: Busca de patentes similares",
    "3ª Etapa: Guia de pagamento",
    "4ª Etapa: Exame Formal",
    "5ª Etapa: Exame de Mérito",
    "6ª Etapa: Concessão",
];

const PatentTimeline: React.FC<PatentTimelineProps> = ({ patent, onUpdateStatus }) => {
    const [currentStep, setCurrentStep] = useState<number>(patent.status ?? 0);

    // etapas 3..6 => indexes 2..5 (estado local de descrição/arquivo/url)
    const [stageLocal, setStageLocal] = useState<Record<number, StageLocal>>({});

    // —— estados que faltavam e causavam os erros:
    const [isFinalized, setIsFinalized] = useState(false);
    const [editModeStep, setEditModeStep] = useState<number | null>(null);

    // etapa 2 (busca INPI)
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [related, setRelated] = useState<RelatedPatent[]>(() => patent.patents ?? []);
    const [expandRelated, setExpandRelated] = useState<Record<number, boolean>>({});

    const role = (JSON.parse(localStorage.getItem("user") || "{}")?.role || "").toLowerCase();
    const isViewer = role === "viewer" || role === "read_only" || role === "leitor";

    useEffect(() => {
        setCurrentStep(patent.status ?? 0);
        setRelated(patent.patents ?? []);

        // buscar URLs existentes para 3..6 (se houver arquivo no back)
        [3, 4, 5, 6].forEach(async (stage) => {
            try {
                const { data } = await api.get<{ url: string }>(
                    `/patents/stages/${patent.id}/${stage}/url`,
                    { headers: { "X-Skip-Error-Toast": "1" } }   // 🔕 silencia 404 esperado
                );
                setStageLocal((prev) => ({
                    ...prev,
                    [stage - 1]: { ...(prev[stage - 1] || {}), url: data.url },
                }));
            } catch {
                // sem arquivo ainda — silencioso
            }
        });
    }, [patent]);

    // regra: etapa 1 é leitura; etapa atual é editável; etapas anteriores só ao entrar em modo edição
    const isEditable = (index: number) => {
        if (isViewer) return false;        // <- trava tudo para viewer
        if (index === 0) return false;
        if (index === currentStep) return true;
        if (index < currentStep) return index === editModeStep;
        return false;
    };

    const handleDescChange = (idx: number, value: string) =>
        setStageLocal((p) => ({ ...p, [idx]: { ...(p[idx] || {}), description: value } }));

    const handleFileChange = (idx: number, list: FileList | null) =>
        setStageLocal((p) => ({ ...p, [idx]: { ...(p[idx] || {}), file: list?.[0] || null } }));

    const saveStage = async (idx: number) => {
        // idx 2..5 => stage 3..6
        const stage = idx + 1; // 3..6
        const form = new FormData();
        form.append("stage", String(stage));
        if (stageLocal[idx]?.description) form.append("description", stageLocal[idx].description);
        if (stageLocal[idx]?.file) form.append("file", stageLocal[idx].file as Blob);

        await api.post(`/patents/stages/${patent.id}`, form);

        // recarrega URL assinada
        try {
            const { data: u } = await api.get<{ url: string }>(`/patents/stages/${patent.id}/${stage}/url`);
            setStageLocal((prev) => ({ ...prev, [idx]: { ...(prev[idx] || {}), url: u.url, file: null } }));
        } catch {
            // sem arquivo
        }

        // saiu do modo edição (se estava em etapa concluída)
        if (editModeStep === idx) setEditModeStep(null);
    };

    const finalizeStep = async (idx: number) => {
        const next = idx + 1; // avança (0..5)
        await onUpdateStatus(next);
        setCurrentStep(next);
        if (next >= statuses.length - 1) setIsFinalized(true);
    };

    // etapa 2: busca INPI
    const runINPISearch = async () => {
        if (!searchTerm.trim()) return;
        try {
            setSearchLoading(true);
            await api.get("/patents/search", {
                params: { termo: searchTerm, quantidade: 3, user_patent_id: patent.id },
            });
            const { data } = await api.get<UserPatent>(`/patents/${patent.id}`);
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

                                {/* ETAPA 2 - busca + relacionados + finalizar */}
                                {index === 1 && (
                                    <>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="subtitle1">Patentes relacionadas</Typography>
                                            <Tooltip
                                                title={showSearch ? "Ocultar busca" : "Buscar/Adicionar patentes relacionadas"}
                                            >
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

                                        {index === currentStep && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                endIcon={<DoneAllIcon />}
                                                disabled={isViewer}
                                                onClick={() => finalizeStep(index)}
                                            >
                                                Finalizar etapa
                                            </Button>
                                        )}
                                        {editable && (
                                            <Button variant="contained" startIcon={<SaveIcon />} disabled={isViewer} onClick={() => saveStage(index)}>
                                                Salvar
                                            </Button>
                                        )}
                                        <Divider sx={{ my: 2 }} />
                                    </>
                                )}

                                {/* ETAPAS 3 a 6 - upload + descrição + salvar/finalizar */}
                                {index >= 2 && (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Arquivo da etapa
                                        </Typography>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                            <Button
                                                variant="outlined"
                                                startIcon={<AttachFileIcon />}
                                                component="label"
                                                disabled={!editable}
                                            >
                                                Selecionar arquivo
                                                <input
                                                    hidden
                                                    type="file"
                                                    onChange={(e) => handleFileChange(index, e.target.files)}
                                                />
                                            </Button>
                                            <Typography variant="body2" color="text.secondary">
                                                {stageLocal[index]?.file?.name ?? "Nenhum arquivo selecionado"}
                                            </Typography>
                                            {!!stageLocal[index]?.url && (
                                                <Button href={stageLocal[index].url} target="_blank" rel="noreferrer">
                                                    Abrir arquivo atual
                                                </Button>
                                            )}
                                        </Stack>

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            sx={{ mt: 2 }}
                                            label="Descrição/observações da etapa"
                                            value={stageLocal[index]?.description ?? ""}
                                            onChange={(e) => handleDescChange(index, e.target.value)}
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
                                            {editable && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SaveIcon />}
                                                    onClick={() => saveStage(index)}
                                                >
                                                    Salvar
                                                </Button>
                                            )}
                                            {!editable && index > 0 && index < currentStep && (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => setEditModeStep(index)}
                                                >
                                                    Editar
                                                </Button>
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
