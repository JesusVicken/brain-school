import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    LinearProgress,
    Card,
    CardContent,
    Chip,
    Avatar,
    Stack,
    Grid,
    Fade,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Timer,
    EmojiEvents,
    School,
    RestartAlt,
    Home
} from '@mui/icons-material';


export default function QuizGame({ student, quiz, onRestart, loading }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timePerQuestion, setTimePerQuestion] = useState(0);
    const [quizStartTime] = useState(Date.now());

    // ... (lógica do componente permanece a mesma)
    useEffect(() => {
        if (!showResult && !loading) {
            const timer = setInterval(() => {
                setTimePerQuestion(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showResult, loading]);

    if (loading) { /* ... tela de loading ... */ return <Fade in timeout={500}><Box sx={{ textAlign: 'center', p: 8 }}><CircularProgress size={80} thickness={2} sx={{ color: 'primary.main', mb: 3 }} /><Typography variant="h5" gutterBottom color="text.primary">Gerando seu quiz...</Typography><Typography variant="body1" color="text.secondary" component="div">Preparando questões sobre <strong>{student.theme}</strong> em <strong>{student.subject}</strong></Typography></Box></Fade>; }
    if (!quiz || !quiz.questions || quiz.questions.length === 0) { /* ... tela de erro ... */ return <Fade in timeout={500}><Box sx={{ textAlign: 'center', p: 6 }}><Avatar sx={{ width: 80, height: 80, bgcolor: 'error.light', mx: 'auto', mb: 3 }}><Cancel fontSize="large" /></Avatar><Typography variant="h5" gutterBottom color="error.main">Erro ao carregar o quiz</Typography><Typography variant="body1" color="text.secondary" paragraph>Não foi possível gerar questões. Verifique sua chave de API e tente novamente.</Typography><Button variant="contained" onClick={onRestart} startIcon={<RestartAlt />} size="large">Tentar Novamente</Button></Box></Fade>; }

    const handleAnswerSelect = (answerIndex) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answerIndex);
        const isCorrect = answerIndex === quiz.questions[currentQuestion].correctAnswer;
        if (isCorrect) {
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
        // ... (lógica da tela de resultado permanece a mesma)
        const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
        const percentage = (score / quiz.questions.length) * 100;
        const isExcellent = percentage >= 80;
        const isGood = percentage >= 60;
        const getResultColor = () => (isExcellent ? 'success.main' : isGood ? 'warning.main' : 'error.main');
        const getResultIcon = () => (isExcellent ? '🎉' : isGood ? '👍' : '💪');
        const getResultMessage = () => (isExcellent ? 'Excelente! Você dominou o conteúdo!' : isGood ? 'Bom Trabalho! Continue assim!' : 'Continue Estudando! Você vai conseguir!');

        return (
            <Fade in timeout={500}>
                <Box sx={{ p: 4 }}>
                    {/* ... (cabeçalho da tela de resultado) ... */}
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h2" component="div" sx={{ fontSize: '4rem', mb: 2 }}>{getResultIcon()}</Typography>
                        <Typography variant="h4" gutterBottom color={getResultColor()} fontWeight="bold">{getResultMessage()}</Typography>
                    </Box>
                    <Card variant="outlined" sx={{ mb: 4, bgcolor: 'background.default' }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                <School color="primary" />
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{student.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{student.school} • {student.grade}</Typography>
                                    <Chip label={`${student.subject} - ${student.theme}`} size="small" color="primary" variant="outlined" sx={{ mt: 1 }} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
                        {/* ✅ REATORADO: Usando a prop 'sx' para layout responsivo */}
                        <Grid sx={{ width: { xs: '100%', sm: '33.33%' } }}>
                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">{score}</Typography>
                                <Typography variant="body2" color="primary.600">Acertos</Typography>
                            </Paper>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', sm: '33.33%' } }}>
                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50', border: 1, borderColor: 'success.100' }}>
                                <Typography variant="h3" fontWeight="bold" color="success.main">{quiz.questions.length}</Typography>
                                <Typography variant="body2" color="success.600">Total</Typography>
                            </Paper>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', sm: '33.33%' } }}>
                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'secondary.50', border: 1, borderColor: 'secondary.100' }}>
                                <Typography variant="h3" fontWeight="bold" color="secondary.main">{Math.round(percentage)}%</Typography>
                                <Typography variant="body2" color="secondary.600">Desempenho</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* ... (resto da tela de resultado) ... */}
                    <Box textAlign="center" mb={4}><Chip icon={<Timer />} label={`Tempo total: ${Math.floor(totalTime / 60)}min ${totalTime % 60}s`} variant="outlined" color="info" /></Box>
                    <Divider sx={{ my: 3 }} />
                    <Stack spacing={2}>
                        <Button variant="contained" onClick={onRestart} startIcon={<EmojiEvents />} size="large" sx={{ py: 1.5, borderRadius: 3, fontWeight: 600, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, }, transition: 'all 0.2s ease-in-out' }}>Fazer Outro Quiz</Button>
                        <Button variant="outlined" onClick={onRestart} startIcon={<Home />} size="large" sx={{ py: 1.5, borderRadius: 3 }}>Voltar ao Início</Button>
                    </Stack>
                </Box>
            </Fade>
        );
    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <Fade in timeout={300}>
            <Box sx={{ p: 3 }}>
                {/* ... (cabeçalho da tela de questão) ... */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>{student.subject}: {student.theme}</Typography>
                            <Typography variant="body2" color="text.secondary">Aluno: <strong>{student.name}</strong></Typography>
                        </Box>
                        <Box textAlign="right">
                            <Typography variant="h6" fontWeight="bold" color="primary.main">{currentQuestion + 1} / {quiz.questions.length}</Typography>
                            <Chip icon={<Timer />} label={`${timePerQuestion}s`} size="small" variant="outlined" color="info" />
                        </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                        <Typography variant="body2" color="text.secondary" minWidth={40}>{Math.round(progress)}%</Typography>
                    </Box>
                </Box>

                <Card variant="outlined" sx={{ mb: 3, borderColor: 'primary.100', bgcolor: 'primary.50' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" component="div" fontWeight="medium">{question.question}</Typography>
                    </CardContent>
                </Card>

                <Grid container spacing={2} mb={3}>
                    {question.options.map((option, index) => {
                        // ... (lógica de estilo da opção)
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.correctAnswer;
                        let cardStyle = {};
                        if (selectedAnswer !== null) {
                            if (isSelected) {
                                cardStyle = isCorrect ? { bgcolor: 'success.50', borderColor: 'success.main', transform: 'scale(1.02)' } : { bgcolor: 'error.50', borderColor: 'error.main', transform: 'scale(1.02)' };
                            } else if (isCorrect) {
                                cardStyle = { bgcolor: 'success.50', borderColor: 'success.main' };
                            }
                        } else {
                            cardStyle = { '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)', boxShadow: 2 } };
                        }

                        return (
                            // ✅ REATORADO: Usando a prop 'sx' para layout responsivo
                            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%' } }}>
                                <Card
                                    variant="outlined"
                                    sx={{ cursor: selectedAnswer === null ? 'pointer' : 'default', transition: 'all 0.2s ease-in-out', height: '100%', ...cardStyle }}
                                    onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: selectedAnswer === null ? 'primary.main' : isSelected ? (isCorrect ? 'success.main' : 'error.main') : (isCorrect ? 'success.main' : 'grey.400'), fontSize: '0.875rem', fontWeight: 'bold' }}>
                                                {String.fromCharCode(65 + index)}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ flex: 1 }}>{option}</Typography>
                                            {selectedAnswer !== null && isCorrect && <CheckCircle color="success" />}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* ... (resto da tela de questão) ... */}
                {selectedAnswer !== null && (<Fade in timeout={500}><Paper sx={{ p: 2, mb: 3, bgcolor: selectedAnswer === question.correctAnswer ? 'success.50' : 'error.50', border: 1, borderColor: selectedAnswer === question.correctAnswer ? 'success.main' : 'error.main' }}><Stack direction="row" alignItems="center" spacing={1}>{selectedAnswer === question.correctAnswer ? (<><CheckCircle color="success" /><Typography variant="body1" color="success.main" fontWeight="medium">Resposta correta! Parabéns! 🎉</Typography></>) : (<><Cancel color="error" /><Typography variant="body1" color="error.main" fontWeight="medium">Resposta incorreta. Continue estudando! 📚</Typography></>)}</Stack></Paper></Fade>)}
                <Stack direction="row" justifyContent="space-between" alignItems="center"><Button onClick={onRestart} variant="text" startIcon={<RestartAlt />} color="inherit">Voltar ao Início</Button><Chip label={`${score} acertos`} color="primary" variant="outlined" /></Stack>
            </Box>
        </Fade>
    );
}