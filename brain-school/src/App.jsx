// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper, Button, Avatar } from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import QuizSetup from './components/QuizSetup.jsx';
import QuizGame from './components/QuizGame.jsx';
import { generateQuizQuestions } from './services/gemini.js';
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../firebaseConfig.js';
import { TweenLite, Circ } from 'gsap'; // lembre-se de instalar gsap: npm i gsap

// Tema
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
                  closest[k] = p2;
                  break;
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

    function scrollCheck() {
      animateHeader = document.body.scrollTop <= height;
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      largeHeader.style.height = height + 'px';
      canvas.width = width;
      canvas.height = height;
    }

    function initAnimation() {
      animate();
      points.forEach(p => shiftPoint(p));
    }

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        points.forEach(p => {
          if (Math.abs(getDistance(target, p)) < 4000) {
            p.active = 0.3;
            p.circle.active = 0.6;
          } else if (Math.abs(getDistance(target, p)) < 20000) {
            p.active = 0.1;
            p.circle.active = 0.3;
          } else if (Math.abs(getDistance(target, p)) < 40000) {
            p.active = 0.02;
            p.circle.active = 0.1;
          } else {
            p.active = 0;
            p.circle.active = 0;
          }
          drawLines(p);
          p.circle.draw();
        });
      }
      requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
      TweenLite.to(p, 1 + Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: () => shiftPoint(p),
      });
    }

    function drawLines(p) {
      if (!p.active) return;
      p.closest.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
        ctx.stroke();
      });
    }

    function Circle(pos, rad, color) {
      this.pos = pos;
      this.radius = rad;
      this.color = color;
      this.draw = () => {
        if (!this.pos.active) return;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(156,217,249,' + (this.pos.active || 0) + ')';
        ctx.fill();
      };
    }

    function getDistance(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }

    initHeader();
    addListeners();
    initAnimation();
  }, []);

  return (
    <div
      ref={headerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        backgroundImage: 'url("https://www.marcoguglie.it/Codepen/AnimatedHeaderBg/demo-1/img/demo-1-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

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
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStudent(null);
      setQuiz(null);
      setProcessedQuiz(null);
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleQuizSetupSubmit = async setupData => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setProcessedQuiz(null);
    setStudent({
      name: setupData.name,
      subject: setupData.subject,
      school: setupData.school,
      grade: setupData.grade,
      topic: setupData.generationType === 'theme' ? setupData.theme : 'Conteúdo Personalizado',
    });
    try {
      const quizData = await generateQuizQuestions(setupData);
      setQuiz(quizData);
    } catch (error) {
      console.error(error);
      setError('Falha ao gerar o quiz. Verifique os dados fornecidos e tente novamente.');
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quiz && quiz.questions) {
      const newQuestions = quiz.questions.map(q => {
        const { shuffledOptions, newCorrectAnswerIndex } = shuffleOptions(q.options, q.correctAnswer);
        return { ...q, options: shuffledOptions, correctAnswer: newCorrectAnswerIndex };
      });
      setProcessedQuiz({ questions: newQuestions });
    } else {
      setProcessedQuiz(null);
    }
  }, [quiz]);

  const handleRestart = () => {
    setStudent(null);
    setQuiz(null);
    setProcessedQuiz(null);
    setError(null);
  };

  // Tela de login
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatedBackground />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 3,
            px: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo + frase */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="QuizzBrAIn Logo"
              sx={{ width: { xs: 120, sm: 180 }, height: 'auto' }}
            />
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Aprender nunca foi tão divertido!
            </Typography>
          </Box>

          {/* Botão Google */}
          <Button
            onClick={handleGoogleLogin}
            sx={{
              px: { xs: 4, sm: 5 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid #dadce0',
              borderRadius: 2,
              backgroundColor: '#fff',
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <FcGoogle size={28} /> Entrar com Google
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  // Tela do quiz
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
              <QuizSetup onSubmit={handleQuizSetupSubmit} loading={loading} />
            ) : (
              <QuizGame student={student} quiz={processedQuiz} onRestart={handleRestart} loading={loading} error={error} />
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
