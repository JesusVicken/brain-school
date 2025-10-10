// src/App.jsx
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography, Paper } from '@mui/material';
import StudentForm from './components/StudentForm';
import QuizGame from './components/QuizGame';
import { generateQuizQuestions } from './services/gemini'; // ✅ CORRIGIDO - Agora usa Gemini

// Tema personalizado do Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f0f9ff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [student, setStudent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStudentSubmit = async (studentData) => {
    setLoading(true);

    try {
      console.log('🎯 Iniciando geração de quiz para:', studentData);
      const quizData = await generateQuizQuestions(
        studentData.theme,
        studentData.subject,
        studentData.difficulty,
        5
      );

      console.log('✅ Quiz gerado com sucesso:', quizData);
      setStudent(studentData);
      setQuiz(quizData);
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      alert('Erro ao gerar quiz. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStudent(null);
    setQuiz(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          py: 4
        }}
      >
        <Container maxWidth="md">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h3"
              component="h1"
              color="primary.main"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🎓 Quizz
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Crie quizzes personalizados e estude de forma divertida!
            </Typography>
          </Box>

          {/* Conteúdo Principal */}
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            {!student ? (
              <StudentForm onSubmit={handleStudentSubmit} loading={loading} />
            ) : (
              <QuizGame
                student={student}
                quiz={quiz}
                onRestart={handleRestart}
                loading={loading}
              />
            )}
          </Paper>

          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Desenvolvido para ajudar nos estudos • Quizz School 🚀
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;