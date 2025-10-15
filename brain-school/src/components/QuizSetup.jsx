import { useState } from 'react';
import {
    Box, TextField, MenuItem, Button, Typography, Stepper,
    Step, StepLabel, Paper, CircularProgress, Fade,
    ToggleButtonGroup, ToggleButton, Alert
} from '@mui/material';
import {
    School, Person, Assignment, Subject, CheckCircle, Star, Notes,
    UploadFile, Lightbulb
} from '@mui/icons-material';
import * as pdfjsLib from 'pdfjs-dist';

// ►►► CORREÇÃO FINAL AQUI: Alterado para a extensão .mjs para a v5+ da biblioteca ◄◄◄
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;


const steps = ['Dados do Aluno', 'Fonte do Quiz', 'Confirmação'];

const grades = [
    { value: '1º ano EF', label: '1º ano do Ensino Fundamental' }, { value: '2º ano EF', label: '2º ano do Ensino Fundamental' }, { value: '3º ano EF', label: '3º ano do Ensino Fundamental' },
    { value: '4º ano EF', label: '4º ano do Ensino Fundamental' }, { value: '5º ano EF', label: '5º ano do Ensino Fundamental' }, { value: '6º ano EF', label: '6º ano do Ensino Fundamental' },
    { value: '7º ano EF', label: '7º ano do Ensino Fundamental' }, { value: '8º ano EF', label: '8º ano do Ensino Fundamental' }, { value: '9º ano EF', label: '9º ano do Ensino Fundamental' },
    { value: '1º ano EM', label: '1º ano do Ensino Médio' }, { value: '2º ano EM', label: '2º ano do Ensino Médio' }, { value: '3º ano EM', label: '3º ano do Ensino Médio' },
    { value: 'Pré-vestibular', label: 'Pré-vestibular' }, { value: 'Graduação', label: 'Graduação' },
];

const subjects = [
    { value: 'História', label: 'História' }, { value: 'Geografia', label: 'Geografia' }, { value: 'Filosofia', label: 'Filosofia' },
    { value: 'Sociologia', label: 'Sociologia' }, { value: 'Português', label: 'Português' }, { value: 'Biologia', label: 'Biologia' },
    { value: 'Ciências', label: 'Ciências' }, { value: 'Outro', label: 'Outro' }
];

export default function QuizSetup({ onSubmit, loading }) {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '', school: '', grade: '9º ano EF', generationType: 'text', subject: 'História',
        theme: '', sourceText: '', difficulty: 'Médio', numberOfQuestions: 5,
    });
    const [isParsingPdf, setIsParsingPdf] = useState(false);

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerationTypeChange = (event, newType) => {
        if (newType !== null) {
            setFormData({ ...formData, generationType: newType });
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') return;
        setIsParsingPdf(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                setFormData({ ...formData, sourceText: fullText });
            } catch (error) {
                console.error("Erro ao processar PDF:", error);
                alert("Não foi possível ler o arquivo PDF. Tente novamente.");
            } finally {
                setIsParsingPdf(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0: return formData.name.trim() && formData.school.trim();
            case 1:
                if (formData.generationType === 'text') return formData.sourceText.trim().length > 50;
                if (formData.generationType === 'theme') return formData.theme.trim().length > 3;
                return false;
            case 2: return true;
            default: return false;
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField fullWidth label="Nome do Aluno" name="name" value={formData.name} onChange={handleChange} required InputProps={{ startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} /> }} />
                        <TextField fullWidth label="Escola" name="school" value={formData.school} onChange={handleChange} required InputProps={{ startAdornment: <School sx={{ color: 'text.secondary', mr: 1 }} /> }} />
                        <TextField select fullWidth label="Série/Ano" name="grade" value={formData.grade} onChange={handleChange} InputProps={{ startAdornment: <Assignment sx={{ color: 'text.secondary', mr: 1 }} /> }}>
                            {grades.map((grade) => (<MenuItem key={grade.value} value={grade.value}>{grade.label}</MenuItem>))}
                        </TextField>
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="h6" color="text.primary">Como deseja gerar as questões?</Typography>
                        <ToggleButtonGroup value={formData.generationType} exclusive onChange={handleGenerationTypeChange} fullWidth>
                            <ToggleButton value="text" aria-label="por texto"><Notes sx={{ mr: 1 }} />Por Texto ou PDF</ToggleButton>
                            <ToggleButton value="theme" aria-label="por tema"><Lightbulb sx={{ mr: 1 }} />Por Tema</ToggleButton>
                        </ToggleButtonGroup>
                        <TextField select fullWidth label="Disciplina (Contexto)" name="subject" value={formData.subject} onChange={handleChange} InputProps={{ startAdornment: <Subject sx={{ color: 'text.secondary', mr: 1 }} /> }}>
                            {subjects.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                        </TextField>
                        {formData.generationType === 'text' ? (
                            <Fade in>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Alert severity="info">Cole um texto ou envie um PDF para a IA criar perguntas baseadas nele.</Alert>
                                    <Button variant="outlined" component="label" startIcon={isParsingPdf ? <CircularProgress size={20} /> : <UploadFile />} disabled={isParsingPdf}>
                                        {isParsingPdf ? 'Processando PDF...' : 'Enviar arquivo PDF'}
                                        <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
                                    </Button>
                                    <TextField fullWidth multiline rows={8} label="Ou cole seu texto aqui" name="sourceText" value={formData.sourceText} onChange={handleChange} required disabled={isParsingPdf} placeholder="Cole o conteúdo do seu livro, artigo ou anotações..." helperText={formData.sourceText.trim().length < 51 ? `Mínimo de 50 caracteres. Atual: ${formData.sourceText.trim().length}` : "Tudo certo!"} />
                                </Box>
                            </Fade>
                        ) : (
                            <Fade in>
                                <Box>
                                    <Alert severity="info">Digite um tema e a IA criará perguntas com base no conhecimento dela.</Alert>
                                    <TextField fullWidth label="Tema do Quiz" name="theme" value={formData.theme} onChange={handleChange} required sx={{ mt: 3 }} placeholder="Ex: Revolução Francesa, Ciclo da Água, Modernismo" helperText={formData.theme.trim().length < 4 ? 'Digite um tema com pelo menos 4 caracteres.' : 'Tema válido!'} />
                                </Box>
                            </Fade>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField select fullWidth label="Dificuldade" name="difficulty" value={formData.difficulty} onChange={handleChange}><MenuItem value="Fácil">Fácil</MenuItem><MenuItem value="Médio">Médio</MenuItem><MenuItem value="Difícil">Difícil</MenuItem></TextField>
                            <TextField select fullWidth label="Nº de Questões" name="numberOfQuestions" value={formData.numberOfQuestions} onChange={handleChange}><MenuItem value={5}>5 Questões</MenuItem><MenuItem value={7}>7 Questões</MenuItem><MenuItem value={10}>10 Questões</MenuItem></TextField>
                        </Box>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom color="primary.main"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle color="primary" /> 📋 Resumo do Quiz</Box></Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Aluno:</Typography><Typography variant="body2" fontWeight="medium">{formData.name}</Typography></Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Disciplina:</Typography><Typography variant="body2" fontWeight="medium">{formData.subject}</Typography></Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Dificuldade:</Typography><Typography variant="body2" fontWeight="medium">{formData.difficulty}</Typography></Box>
                                {formData.generationType === 'theme' ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Fonte:</Typography><Typography variant="body2" fontWeight="medium" color="primary.main">{formData.theme}</Typography></Box>
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Fonte:</Typography><Typography variant="body2" fontWeight="medium" color="primary.main">{`Texto com ${formData.sourceText.length} caracteres`}</Typography></Box>
                                )}
                            </Box>
                        </Paper>
                        <Typography component="div" variant="body2" color="text.secondary" textAlign="center"><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><Star color="primary" /> 🚀 Pronto para começar?</Box></Typography>
                    </Box>
                );
            default: return null;
        }
    };

    return (
        <Fade in timeout={500}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 4 } }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
                </Stepper>
                <Box sx={{ mb: 4, minHeight: 300 }}>{renderStepContent(activeStep)}</Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={handleBack} disabled={activeStep === 0 || loading} variant="outlined">Voltar</Button>
                    {activeStep === steps.length - 1 ? (
                        <Button type="submit" variant="contained" disabled={loading || !isStepValid()} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />} sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 600, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                            {loading ? 'Gerando...' : '🎯 Criar Quiz'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} variant="contained" disabled={!isStepValid()} sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 600 }}>
                            Continuar
                        </Button>
                    )}
                </Box>
            </Box>
        </Fade>
    );
}