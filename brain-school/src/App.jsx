import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline, Container, Box, Typography, Paper, Button, Avatar,
  TextField, MenuItem, Stepper, Step, StepLabel, CircularProgress, Fade,
  ToggleButtonGroup, ToggleButton, Alert, LinearProgress, Card, CardContent,
  Chip, Stack, Grid, Divider
} from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import {
  School, Person, Assignment, Subject, CheckCircle, Star, Notes, UploadFile,
  Lightbulb, Cancel, Timer, EmojiEvents, RestartAlt, Home
} from '@mui/icons-material';
import { generateQuizQuestions } from './services/gemini.js';
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../firebaseConfig.js';
import { TweenLite, Circ } from 'gsap';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//==================================================================
// 1. TEMA E FUNÇÕES AUXILIARES
//==================================================================
const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f0f9ff', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

function shuffleOptions(options, correctAnswerIndex) {
  const correctAnswerValue = options[correctAnswerIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newCorrectAnswerIndex = shuffled.findIndex(option => option === correctAnswerValue);
  return { shuffledOptions: shuffled, newCorrectAnswerIndex };
}

//==================================================================
// 2. COMPONENTES ANINHADOS
//==================================================================

// COMPONENTE: AnimatedBackground
function AnimatedBackground() {
  const canvasRef = useRef(null);
  const headerRef = useRef(null);
  useEffect(() => {
    let width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;
    function initHeader() {
      width = window.innerWidth;
      height = window.innerHeight;
      target = { x: width / 2, y: height / 2 };
      largeHeader = headerRef.current;
      largeHeader.style.height = height + 'px';
      canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      points = [];
      for (let x = 0; x < width; x += width / 20) {
        for (let y = 0; y < height; y += height / 20) {
          const px = x + Math.random() * width / 20;
          const py = y + Math.random() * height / 20;
          points.push({ x: px, originX: px, y: py, originY: py });
        }
      }
      points.forEach(p1 => {
        const closest = [];
        points.forEach(p2 => {
          if (p1 !== p2) {
            if (closest.length < 5) closest.push(p2);
            else {
              for (let k = 0; k < 5; k++) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2; break;
                }
              }
            }
          }
        });
        p1.closest = closest;
      });
      points.forEach(p => {
        p.circle = new Circle(p, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
      });
    }
    function addListeners() {
      if (!('ontouchstart' in window)) window.addEventListener('mousemove', mouseMove);
      window.addEventListener('scroll', scrollCheck);
      window.addEventListener('resize', resize);
    }
    function mouseMove(e) {
      const posx = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      const posy = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      target.x = posx;
      target.y = posy;
    }
    function scrollCheck() { animateHeader = document.body.scrollTop <= height; }
    function resize() {
      width = window.innerWidth; height = window.innerHeight;
      largeHeader.style.height = height + 'px'; canvas.width = width; canvas.height = height;
    }
    function initAnimation() { animate(); points.forEach(p => shiftPoint(p)); }
    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        points.forEach(p => {
          if (Math.abs(getDistance(target, p)) < 4000) { p.active = 0.3; p.circle.active = 0.6; }
          else if (Math.abs(getDistance(target, p)) < 20000) { p.active = 0.1; p.circle.active = 0.3; }
          else if (Math.abs(getDistance(target, p)) < 40000) { p.active = 0.02; p.circle.active = 0.1; }
          else { p.active = 0; p.circle.active = 0; }
          drawLines(p);
          p.circle.draw();
        });
      }
      requestAnimationFrame(animate);
    }
    function shiftPoint(p) { TweenLite.to(p, 1 + Math.random(), { x: p.originX - 50 + Math.random() * 100, y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut, onComplete: () => shiftPoint(p), }); }
    function drawLines(p) {
      if (!p.active) return;
      p.closest.forEach(c => {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')'; ctx.stroke();
      });
    }
    function Circle(pos, rad, color) {
      this.pos = pos; this.radius = rad; this.color = color;
      this.draw = () => {
        if (!this.pos.active) return;
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(156,217,249,' + (this.pos.active || 0) + ')'; ctx.fill();
      };
    }
    function getDistance(p1, p2) { return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2); }
    initHeader(); addListeners(); initAnimation();
  }, []);
  return (<div ref={headerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, overflow: 'hidden', backgroundImage: 'url("https://www.marcoguglie.it/Codepen/AnimatedHeaderBg/demo-1/img/demo-1-bg.jpg")', backgroundSize: 'cover', backgroundPosition: 'center center', }}><canvas ref={canvasRef} style={{ display: 'block' }} /></div>);
}

// COMPONENTE: QuizSetup
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

function QuizSetup({ onSubmit, loading, userName }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: userName || '', school: '', grade: '9º ano EF', generationType: 'text', subject: 'História',
    theme: '', sourceText: '', difficulty: 'Médio', numberOfQuestions: 5,
  });
  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleGenerationTypeChange = (event, newType) => { if (newType !== null) { setFormData({ ...formData, generationType: newType }); } };

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
      } finally { setIsParsingPdf(false); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };
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
        return (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField fullWidth label="Nome do Aluno" name="name" value={formData.name} onChange={handleChange} required InputProps={{ startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} /> }} />
          <TextField fullWidth label="Escola" name="school" value={formData.school} onChange={handleChange} required InputProps={{ startAdornment: <School sx={{ color: 'text.secondary', mr: 1 }} /> }} />
          <TextField select fullWidth label="Série/Ano" name="grade" value={formData.grade} onChange={handleChange} InputProps={{ startAdornment: <Assignment sx={{ color: 'text.secondary', mr: 1 }} /> }}>
            {grades.map((grade) => (<MenuItem key={grade.value} value={grade.value}>{grade.label}</MenuItem>))}
          </TextField>
        </Box>);
      case 1:
        return (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" color="text.primary">Como deseja gerar as questões?</Typography>
          <ToggleButtonGroup value={formData.generationType} exclusive onChange={handleGenerationTypeChange} fullWidth>
            <ToggleButton value="text" aria-label="por texto"><Notes sx={{ mr: 1 }} />Por Texto ou PDF</ToggleButton>
            <ToggleButton value="theme" aria-label="por tema"><Lightbulb sx={{ mr: 1 }} />Por Tema</ToggleButton>
          </ToggleButtonGroup>
          <TextField select fullWidth label="Disciplina (Contexto)" name="subject" value={formData.subject} onChange={handleChange} InputProps={{ startAdornment: <Subject sx={{ color: 'text.secondary', mr: 1 }} /> }}>
            {subjects.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
          </TextField>
          {formData.generationType === 'text' ? (<Fade in>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Alert severity="info">Cole um texto ou envie um PDF para a IA criar perguntas baseadas nele.</Alert>
              <Button variant="outlined" component="label" startIcon={isParsingPdf ? <CircularProgress size={20} /> : <UploadFile />} disabled={isParsingPdf}>
                {isParsingPdf ? 'Processando PDF...' : 'Enviar arquivo PDF'}
                <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
              </Button>
              <TextField fullWidth multiline rows={8} label="Ou cole seu texto aqui" name="sourceText" value={formData.sourceText} onChange={handleChange} required disabled={isParsingPdf} placeholder="Cole o conteúdo do seu livro, artigo ou anotações..." helperText={formData.sourceText.trim().length < 51 ? `Mínimo de 50 caracteres. Atual: ${formData.sourceText.trim().length}` : "Tudo certo!"} />
            </Box>
          </Fade>) : (<Fade in>
            <Box>
              <Alert severity="info">Digite um tema e a IA criará perguntas com base no conhecimento dela.</Alert>
              <TextField fullWidth label="Tema do Quiz" name="theme" value={formData.theme} onChange={handleChange} required sx={{ mt: 3 }} placeholder="Ex: Revolução Francesa, Ciclo da Água, Modernismo" helperText={formData.theme.trim().length < 4 ? 'Digite um tema com pelo menos 4 caracteres.' : 'Tema válido!'} />
            </Box>
          </Fade>)}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select fullWidth label="Dificuldade" name="difficulty" value={formData.difficulty} onChange={handleChange}><MenuItem value="Fácil">Fácil</MenuItem><MenuItem value="Médio">Médio</MenuItem><MenuItem value="Difícil">Difícil</MenuItem></TextField>
            <TextField select fullWidth label="Nº de Questões" name="numberOfQuestions" value={formData.numberOfQuestions} onChange={handleChange}><MenuItem value={5}>5 Questões</MenuItem><MenuItem value={7}>7 Questões</MenuItem><MenuItem value={10}>10 Questões</MenuItem></TextField>
          </Box>
        </Box>);
      case 2:
        return (<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom color="primary.main"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle color="primary" /> 📋 Resumo do Quiz</Box></Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Aluno:</Typography><Typography variant="body2" fontWeight="medium">{formData.name}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Disciplina:</Typography><Typography variant="body2" fontWeight="medium">{formData.subject}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Dificuldade:</Typography><Typography variant="body2" fontWeight="medium">{formData.difficulty}</Typography></Box>
              {formData.generationType === 'theme' ? (<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Fonte:</Typography><Typography variant="body2" fontWeight="medium" color="primary.main">{formData.theme}</Typography></Box>) : (<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">Fonte:</Typography><Typography variant="body2" fontWeight="medium" color="primary.main">{`Texto com ${formData.sourceText.length} caracteres`}</Typography></Box>)}
            </Box>
          </Paper>
          <Typography component="div" variant="body2" color="text.secondary" textAlign="center"><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><Star color="primary" /> 🚀 Pronto para começar?</Box></Typography>
        </Box>);
      default: return null;
    }
  };

  return (<Fade in timeout={500}>
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
  </Fade>);
}

// COMPONENTE: QuizGame
function QuizGame({ student, quiz, onRestart, loading, error }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [quizStartTime] = useState(Date.now());

  useEffect(() => {
    if (!showResult && !loading && quiz) {
      const timer = setInterval(() => { setTimePerQuestion(prev => prev + 1); }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResult, loading, quiz, currentQuestion]);

  if (loading) {
    return (<Fade in timeout={500}>
      <Box sx={{ textAlign: 'center', p: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={80} thickness={2} sx={{ color: 'primary.main', mb: 3 }} />
        <Typography variant="h5" gutterBottom color="text.primary">Gerando seu quiz...</Typography>
        <Typography variant="body1" color="text.secondary">Preparando questões sobre <strong>{student.topic}</strong>.</Typography>
      </Box>
    </Fade>);
  }

  if (error || (!loading && (!quiz || !quiz.questions || quiz.questions.length === 0))) {
    return (<Fade in timeout={500}>
      <Box sx={{ textAlign: 'center', p: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.light', mx: 'auto', mb: 3 }}><Cancel fontSize="large" /></Avatar>
        <Typography variant="h5" gutterBottom color="error.main">{error || "Erro ao carregar o quiz"}</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>Não foi possível gerar as questões. Por favor, verifique os dados e tente novamente.</Typography>
        <Button variant="contained" onClick={onRestart} startIcon={<RestartAlt />} size="large">Tentar Novamente</Button>
      </Box>
    </Fade>);
  }

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === quiz.questions[currentQuestion].correctAnswer) { setScore(score + 1); }
    setTimeout(() => {
      if (currentQuestion + 1 < quiz.questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null); setTimePerQuestion(0);
      } else { setShowResult(true); }
    }, 1500);
  };

  if (showResult) {
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    const percentage = (score / quiz.questions.length) * 100;
    const isExcellent = percentage >= 80; const isGood = percentage >= 60 && percentage < 80;
    const getResultMessage = () => (isExcellent ? 'Excelente! Você dominou o conteúdo!' : isGood ? 'Bom Trabalho! Continue assim!' : 'Continue Estudando! Você vai conseguir!');

    return (<Fade in timeout={500}>
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
    </Fade>);
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (<Fade in timeout={300}>
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
          const isSelected = selectedAnswer === index; const isCorrect = index === question.correctAnswer;
          let cardStyle = { '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-2px)' } };
          if (selectedAnswer !== null) {
            if (isSelected) cardStyle = isCorrect ? { bgcolor: 'success.light', borderColor: 'success.main' } : { bgcolor: 'error.light', borderColor: 'error.main' };
            else if (isCorrect) cardStyle = { bgcolor: 'success.light', borderColor: 'success.main' };
            else cardStyle = { opacity: 0.7 };
          }
          return (<Grid key={index} item xs={12} sm={6}>
            <Card variant="outlined" sx={{ cursor: selectedAnswer === null ? 'pointer' : 'default', transition: 'all 0.2s', height: '100%', ...cardStyle }} onClick={() => selectedAnswer === null && handleAnswerSelect(index)}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: selectedAnswer !== null && isCorrect ? 'success.main' : 'primary.main' }}>{String.fromCharCode(65 + index)}</Avatar>
                  <Typography variant="body1">{option}</Typography>
                  {selectedAnswer !== null && isSelected && (isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>);
        })}
      </Grid>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Button onClick={onRestart} variant="text" startIcon={<RestartAlt />}>Sair</Button><Chip label={`${score} acertos`} color="primary" variant="outlined" /></Stack>
    </Box>
  </Fade>);
}

//==================================================================
// 3. COMPONENTE PRINCIPAL: App
//==================================================================
function App() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [processedQuiz, setProcessedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, provider); }
    catch (err) { console.error('Erro ao fazer login com Google:', err); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStudent(null); setQuiz(null); setProcessedQuiz(null);
    } catch (err) { console.error('Erro ao sair:', err); }
  };

  const handleQuizSetupSubmit = async setupData => {
    setLoading(true); setError(null); setQuiz(null); setProcessedQuiz(null);
    setStudent({
      name: setupData.name, subject: setupData.subject, school: setupData.school, grade: setupData.grade,
      topic: setupData.generationType === 'theme' ? setupData.theme : 'Conteúdo Personalizado',
    });
    try {
      const quizData = await generateQuizQuestions(setupData);
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      setError('Falha ao gerar o quiz. Verifique os dados fornecidos e tente novamente.');
      setStudent(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (quiz && quiz.questions) {
      const newQuestions = quiz.questions.map(q => {
        const { shuffledOptions, newCorrectAnswerIndex } = shuffleOptions(q.options, q.correctAnswer);
        return { ...q, options: shuffledOptions, correctAnswer: newCorrectAnswerIndex };
      });
      setProcessedQuiz({ questions: newQuestions });
    } else { setProcessedQuiz(null); }
  }, [quiz]);

  const handleRestart = () => {
    setStudent(null); setQuiz(null); setProcessedQuiz(null); setError(null);
  };

  // TELA DE LOGIN
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatedBackground />
        <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 3, px: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box component="img" src="/logo2.png" alt="QuizzBrAIn Logo" sx={{ width: { xs: 120, sm: 180 }, height: 'auto' }} />
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Aprender nunca foi tão divertido!
            </Typography>
          </Box>
          <Button onClick={handleGoogleLogin} sx={{ px: { xs: 4, sm: 5 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1.1rem' }, textTransform: 'none', display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #dadce0', borderRadius: 2, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
            <FcGoogle size={28} /> Entrar com Google
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  // TELA PRINCIPAL DO QUIZ
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, gap: { xs: 2, sm: 0 } }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '1.8rem', sm: '2.4rem' } }}>
              🎓 QuizzBrAIn
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
              <Avatar src={user.photoURL} alt={user.displayName} />
              <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>Sair</Button>
            </Box>
          </Box>

          <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
            {!student && !loading ? (
              <QuizSetup
                onSubmit={handleQuizSetupSubmit}
                loading={loading}
                userName={user.displayName} // <-- MÁGICA ACONTECE AQUI
              />
            ) : (
              <QuizGame
                student={student}
                quiz={processedQuiz}
                onRestart={handleRestart}
                loading={loading}
                error={error}
              />
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;