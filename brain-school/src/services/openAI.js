// src/services/openAI.js
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Função mock melhorada para desenvolvimento
async function generateMockQuiz(theme, subject, difficulty, numberOfQuestions = 5) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const questions = [];

            for (let i = 0; i < numberOfQuestions; i++) {
                questions.push({
                    question: `Questão ${i + 1} sobre ${theme} em ${subject} (${difficulty}): Qual é a característica principal?`,
                    options: [
                        `Alternativa A - Característica principal ${i + 1}`,
                        `Alternativa B - Aspecto secundário ${i + 1}`,
                        `Alternativa C - Elemento complementar ${i + 1}`,
                        `Alternativa D - Fator irrelevante ${i + 1}`
                    ],
                    correctAnswer: Math.floor(Math.random() * 4) // Resposta aleatória para teste
                });
            }

            resolve({ questions });
        }, 2000);
    });
}

export async function generateQuizQuestions(theme, subject, difficulty, numberOfQuestions = 5) {
    // Modo desenvolvimento - sempre usa mock por enquanto
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('test') || OPENAI_API_KEY === 'sua_chave_aqui') {
        console.log('🔧 Modo Desenvolvimento: Usando quiz mock');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }

    try {
        console.log('🤖 Gerando quiz com IA...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Você é um professor especialista em criar questões educacionais. 
                     Crie questões de múltipla escolha com 4 opções cada.
                     Retorne APENAS JSON válido sem markdown.
                     Formato exigido: {
                       "questions": [
                         {
                           "question": "texto da pergunta",
                           "options": ["opção A", "opção B", "opção C", "opção D"],
                           "correctAnswer": 0
                         }
                       ]
                     }`
                    },
                    {
                        role: 'user',
                        content: `Crie ${numberOfQuestions} questões sobre "${theme}" na matéria de ${subject}. 
                     Dificuldade: ${difficulty}.
                     As questões devem ser educativas e desafiadoras.
                     A resposta correta deve ser o índice (0-3) da opção correta.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log('📄 Resposta da IA:', content);

        // Tenta extrair JSON
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

            // Valida a estrutura
            if (parsedData.questions && Array.isArray(parsedData.questions)) {
                return parsedData;
            } else {
                throw new Error('Estrutura inválida do quiz');
            }
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON da IA:', parseError);
            throw new Error('Resposta da IA em formato inválido');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar questões com IA:', error);
        console.log('🔄 Usando fallback para quiz mock...');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }
}