import React, { useState } from "react";
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
    Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { type Patent } from "./Patents";

interface PatentTimelineProps {
    patent: Patent;
    onUpdate: (
        info: Record<number, { info: string }>,
        status: number
    ) => void;
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
    const [formData, setFormData] = useState<Record<number, { info: string }>>(
        () => patent.info || {}
    );
    const [currentStep, setCurrentStep] = useState<number>(() => patent.status || 0);
    const [editModeStep, setEditModeStep] = useState<number | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);

    const handleInputChange = (stepIndex: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [stepIndex]: { info: value },
        }));
    };

    const handleSave = (stepIndex: number) => {
        if (stepIndex === statuses.length - 1) {
            setIsFinalized(true);
        }

        onUpdate(formData, stepIndex);

        // só avança se for a etapa atual
        if (stepIndex === currentStep && currentStep < statuses.length - 1) {
            setCurrentStep(stepIndex + 1);
        }

        setEditModeStep(null); // sai do modo de edição
    };

    return (
        <Container>
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
                    const isCurrent = index === currentStep;
                    const isEditing = index === editModeStep;
                    const isEditable = isCurrent || isEditing;

                    return (
                        <Accordion key={index} expanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography
                                    variant="h6"
                                    color={isCurrent ? "primary" : "textPrimary"}
                                >
                                    {status}
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Informações"
                                    value={formData[index]?.info || ""}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    disabled={!isEditable}
                                />

                                <Stack direction="row" spacing={2} mt={2}>
                                    {isEditable && (
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={() => handleSave(index)}
                                        >
                                            Salvar
                                        </Button>
                                    )}

                                    {!isEditable && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => setEditModeStep(index)}
                                        >
                                            Editar
                                        </Button>
                                    )}
                                </Stack>
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
