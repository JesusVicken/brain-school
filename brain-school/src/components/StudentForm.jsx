// src/components/StudentForm.jsx
import { useState } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Paper,
    CircularProgress,
    Fade
} from '@mui/material';
import {
    School,
    Person,
    Assignment,
    Subject,
    MenuBook,
    TrendingUp,
    CheckCircle,
    Star
} from '@mui/icons-material';

const steps = ['Informações Pessoais', 'Detalhes do Quiz', 'Confirmação'];

// Séries do Ensino Fundamental Brasileiro
const grades = [
    { value: '1º ano EF', label: '1º ano do Ensino Fundamental' },
    { value: '2º ano EF', label: '2º ano do Ensino Fundamental' },
    { value: '3º ano EF', label: '3º ano do Ensino Fundamental' },
    { value: '4º ano EF', label: '4º ano do Ensino Fundamental' },
    { value: '5º ano EF', label: '5º ano do Ensino Fundamental' },
    { value: '6º ano EF', label: '6º ano do Ensino Fundamental' },
    { value: '7º ano EF', label: '7º ano do Ensino Fundamental' },
    { value: '8º ano EF', label: '8º ano do Ensino Fundamental' },
    { value: '9º ano EF', label: '9º ano do Ensino Fundamental' },
    { value: '1º ano EM', label: '1º ano do Ensino Médio' },
    { value: '2º ano EM', label: '2º ano do Ensino Médio' },
    { value: '3º ano EM', label: '3º ano do Ensino Médio' },
    { value: 'Pré-vestibular', label: 'Pré-vestibular' },
    { value: 'Graduação', label: 'Graduação' },
];

const subjects = [
    
    { value: 'História', label: 'História' },
    { value: 'Matemática', label: 'Matemática' },
    { value: 'Ciências', label: 'Ciências' },
    { value: 'Geografia', label: 'Geografia' },
    { value: 'Português', label: 'Português' },
    { value: 'Inglês', label: 'Inglês' },
    { value: 'Física', label: 'Física' },
    { value: 'Química', label: 'Química' },
    { value: 'Biologia', label: 'Biologia' },
    { value: 'Artes', label: 'Artes' },
    { value: 'Educação Física', label: 'Educação Física' },
    { value: 'Filosofia', label: 'Filosofia' },
    { value: 'Sociologia', label: 'Sociologia' },
];

const difficulties = [
    { value: 'easy', label: '🟢 Fácil' },
    { value: 'medium', label: '🟡 Médio' },
    { value: 'hard', label: '🔴 Difícil' },
];

export default function StudentForm({ onSubmit, loading }) {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        grade: '6º ano EF',
        subject: 'História',
        theme: '',
        difficulty: 'medium'
    });

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                return formData.name.trim() && formData.school.trim() && formData.grade.trim();
            case 1:
                return formData.subject && formData.theme.trim();
            case 2:
                return true;
            default:
                return false;
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Nome do Aluno"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                            placeholder="Digite seu nome completo"
                            helperText="Seu nome será usado no certificado do quiz"
                        />

                        <TextField
                            fullWidth
                            label="Escola"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <School sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                            placeholder="Nome da sua escola ou instituição"
                        />

                        <TextField
                            select
                            fullWidth
                            label="Série/Ano"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <Assignment sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                            helperText="Selecione sua série atual"
                        >
                            {grades.map((grade) => (
                                <MenuItem key={grade.value} value={grade.value}>
                                    {grade.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            fullWidth
                            label="Disciplina"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <Subject sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        >
                            {subjects.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Tema do Quiz"
                            name="theme"
                            value={formData.theme}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <MenuBook sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                            placeholder="Ex: Guerra Fria, Fotossíntese, Funções Quadráticas"
                            helperText="Seja específico para obter questões mais relevantes"
                        />

                        <TextField
                            select
                            fullWidth
                            label="Nível de Dificuldade"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <TrendingUp sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        >
                            {difficulties.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default' }}>
                            <Typography variant="h6" gutterBottom color="primary.main">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle color="primary" />
                                    📋 Resumo do Quiz
                                </Box>
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Aluno:</Typography>
                                    <Typography variant="body2" fontWeight="medium">{formData.name}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Escola:</Typography>
                                    <Typography variant="body2" fontWeight="medium">{formData.school}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Série:</Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {grades.find(g => g.value === formData.grade)?.label}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Disciplina:</Typography>
                                    <Typography variant="body2" fontWeight="medium">{formData.subject}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Tema:</Typography>
                                    <Typography variant="body2" fontWeight="medium" color="primary.main">
                                        {formData.theme}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Dificuldade:</Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                        {difficulties.find(d => d.value === formData.difficulty)?.label}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Star color="primary" />
                                🚀 Pronto para começar? Clique em "Criar Quiz" para gerar suas questões!
                            </Box>
                        </Typography>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Fade in timeout={500}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Conteúdo do Step */}
                <Box sx={{ mb: 4 }}>
                    {renderStepContent(activeStep)}
                </Box>

                {/* Botões de Navegação */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading}
                        variant="outlined"
                    >
                        Voltar
                    </Button>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || !isStepValid()}
                            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 4,
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {loading ? 'Gerando Quiz...' : '🎯 Criar Quiz'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            disabled={!isStepValid()}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: 600
                            }}
                        >
                            Continuar
                        </Button>
                    )}
                </Box>
            </Box>
        </Fade>
    );
}