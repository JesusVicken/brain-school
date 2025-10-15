import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, LinearProgress, Card, CardContent,
    Chip, Avatar, Stack, Grid, Fade, CircularProgress, Divider,
} from '@mui/material';
import {
    CheckCircle, Cancel, Timer, EmojiEvents, School, RestartAlt, Home
} from '@mui/icons-material';

export default function QuizGame({ student, quiz, onRestart, loading, error }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timePerQuestion, setTimePerQuestion] = useState(0);
    const [quizStartTime] = useState(Date.now());

    useEffect(() => {
        if (!showResult && !loading && quiz) {
            const timer = setInterval(() => {
                setTimePerQuestion(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showResult, loading, quiz, currentQuestion]);

    if (loading) {
        return (
            <Fade in timeout={500}>
                <Box sx={{ textAlign: 'center', p: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress size={80} thickness={2} sx={{ color: 'primary.main', mb: 3 }} />
                    <Typography variant="h5" gutterBottom color="text.primary">Gerando seu quiz...</Typography>
                    <Typography variant="body1" color="text.secondary">Preparando questões sobre <strong>{student.topic}</strong>.</Typography>
                </Box>
            </Fade>
        );
    }

    if (error || (!loading && (!quiz || !quiz.questions || quiz.questions.length === 0))) {
        return (
            <Fade in timeout={500}>
                <Box sx={{ textAlign: 'center', p: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.light', mx: 'auto', mb: 3 }}><Cancel fontSize="large" /></Avatar>
                    <Typography variant="h5" gutterBottom color="error.main">{error || "Erro ao carregar o quiz"}</Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>Não foi possível gerar as questões. Por favor, verifique os dados e tente novamente.</Typography>
                    <Button variant="contained" onClick={onRestart} startIcon={<RestartAlt />} size="large">Tentar Novamente</Button>
                </Box>
            </Fade>
        );
    }

    const handleAnswerSelect = (answerIndex) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answerIndex);
        if (answerIndex === quiz.questions[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
        setTimeout(() => {
            if (currentQuestion + 1 < quiz.questions.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setTimePerQuestion(0);
            } else {
                setShowResult(true);
            }
        }, 1500);
    };

    if (showResult) {
        const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
        const percentage = (score / quiz.questions.length) * 100;
        const isExcellent = percentage >= 80;
        const isGood = percentage >= 60 && percentage < 80;
        const getResultMessage = () => (isExcellent ? 'Excelente! Você dominou o conteúdo!' : isGood ? 'Bom Trabalho! Continue assim!' : 'Continue Estudando! Você vai conseguir!');

        return (
            <Fade in timeout={500}>
                <Box sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h2" component="div" sx={{ fontSize: '4rem', mb: 2 }}>{isExcellent ? '🎉' : isGood ? '👍' : '💪'}</Typography>
                        <Typography variant="h4" gutterBottom color={isExcellent ? 'success.main' : isGood ? 'warning.main' : 'error.main'} fontWeight="bold">{getResultMessage()}</Typography>
                    </Box>
                    <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.default' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <School color="primary" />
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{student.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{student.school} • {student.grade}</Typography>
                                    <Chip label={`${student.subject} - ${student.topic}`} size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
                        <Grid item xs={4}><Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}><Typography variant="h3" fontWeight="bold" color="primary.main">{score}</Typography><Typography variant="body2">Acertos</Typography></Paper></Grid>
                        <Grid item xs={4}><Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}><Typography variant="h3" fontWeight="bold" color="text.secondary">{quiz.questions.length}</Typography><Typography variant="body2">Total</Typography></Paper></Grid>
                        <Grid item xs={4}><Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}><Typography variant="h3" fontWeight="bold" color="secondary.main">{Math.round(percentage)}%</Typography><Typography variant="body2">Desempenho</Typography></Paper></Grid>
                    </Grid>
                    <Box textAlign="center" mb={4}><Chip icon={<Timer />} label={`Tempo total: ${Math.floor(totalTime / 60)}min ${totalTime % 60}s`} variant="outlined" /></Box>
                    <Divider sx={{ my: 3 }} />
                    <Stack spacing={2}><Button variant="contained" onClick={onRestart} startIcon={<EmojiEvents />} size="large" fullWidth>Fazer Outro Quiz</Button><Button variant="outlined" onClick={onRestart} startIcon={<Home />} size="large" fullWidth>Voltar ao Início</Button></Stack>
                </Box>
            </Fade>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <Fade in timeout={300}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box><Typography variant="h5" fontWeight="bold">{student.subject}: {student.topic}</Typography><Typography variant="body2" color="text.secondary">Aluno: <strong>{student.name}</strong></Typography></Box>
                        <Box textAlign="right"><Typography variant="h6" fontWeight="bold" color="primary.main">{currentQuestion + 1}/{quiz.questions.length}</Typography><Chip icon={<Timer />} label={`${timePerQuestion}s`} size="small" variant="outlined" /></Box>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} /><Typography variant="body2" color="text.secondary">{Math.round(progress)}%</Typography></Box>
                </Box>
                <Card variant="outlined" sx={{ mb: 3 }}><CardContent sx={{ p: 3 }}><Typography variant="h6" component="div">{question.question}</Typography></CardContent></Card>
                <Grid container spacing={2} mb={3}>
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.correctAnswer;
                        let cardStyle = { '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' } };
                        if (selectedAnswer !== null) {
                            if (isSelected) cardStyle = isCorrect ? { bgcolor: 'success.light', borderColor: 'success.main' } : { bgcolor: 'error.light', borderColor: 'error.main' };
                            else if (isCorrect) cardStyle = { bgcolor: 'success.light', borderColor: 'success.main' };
                            else cardStyle = { opacity: 0.7 };
                        }
                        return (
                            <Grid key={index} item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ cursor: selectedAnswer === null ? 'pointer' : 'default', transition: 'all 0.2s', height: '100%', ...cardStyle }} onClick={() => selectedAnswer === null && handleAnswerSelect(index)}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ bgcolor: selectedAnswer !== null && isCorrect ? 'success.main' : 'primary.main' }}>{String.fromCharCode(65 + index)}</Avatar>
                                            <Typography variant="body1">{option}</Typography>
                                            {selectedAnswer !== null && isSelected && (isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />)}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                <Stack direction="row" justifyContent="space-between" alignItems="center"><Button onClick={onRestart} variant="text" startIcon={<RestartAlt />}>Sair</Button><Chip label={`${score} acertos`} color="primary" variant="outlined" /></Stack>
            </Box>
        </Fade>
    );
}