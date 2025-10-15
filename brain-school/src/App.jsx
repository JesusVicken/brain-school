// src/App.jsx
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper, Button, Avatar } from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import QuizSetup from './components/QuizSetup.jsx';
import QuizGame from './components/QuizGame.jsx';
import { generateQuizQuestions } from './services/gemini.js';

import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from '../firebaseConfig.js';

// Definição do tema do Material-UI
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

// Função para embaralhar opções
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

function App() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [processedQuiz, setProcessedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detecta alterações de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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

  const handleQuizSetupSubmit = async (setupData) => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setProcessedQuiz(null);

    setStudent({
      name: setupData.name,
      subject: setupData.subject,
      school: setupData.school,
      grade: setupData.grade,
      topic: setupData.generationType === 'theme'
        ? setupData.theme
        : 'Conteúdo Personalizado'
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

  // Se usuário não logado, mostra botão oficial do Google
  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          flexDirection: 'column',
          gap: 3
        }}>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
            Faça login para jogar o QuizzBrAIn 🎓
          </Typography>
          <Button
            onClick={handleGoogleLogin}
            sx={{
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid #dadce0',
              borderRadius: 2,
              backgroundColor: '#fff',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <FcGoogle size={28} />
            Entrar com Google
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  // Usuário logado
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎓 QuizzBrAIn
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={user.photoURL} alt={user.displayName} />
              <Button variant="outlined" color="secondary" onClick={handleLogout}>Sair</Button>
            </Box>
          </Box>

          <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
