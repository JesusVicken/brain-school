import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import QuizSetup from './components/QuizSetup.jsx';
import QuizGame from './components/QuizGame.jsx';
// import Footer from './components/Footer.jsx';
import { generateQuizQuestions } from './services/gemini.js';

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

// Função para embaralhar as opções de resposta
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
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [processedQuiz, setProcessedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      console.log('🎯 Iniciando geração de quiz para:', setupData);
      const quizData = await generateQuizQuestions(setupData);
      console.log('✅ Quiz gerado com sucesso (bruto):', quizData);
      setQuiz(quizData);
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
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
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswerIndex,
        };
      });
      console.log('🔀 Quiz com opções embaralhadas:', { questions: newQuestions });
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" color="primary.main" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎓 QuizzBrAIn
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Estude de forma divertida com seu material de estudo.
            </Typography>
          </Box>
          <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {!student && !loading ? (
              <QuizSetup onSubmit={handleQuizSetupSubmit} loading={loading} />
            ) : (
              <QuizGame student={student} quiz={processedQuiz} onRestart={handleRestart} loading={loading} error={error} />
            )}
          </Paper>
          {/* <Footer /> */}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;