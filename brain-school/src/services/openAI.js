// src/services/openAI.js
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

console.log('🔑 API Key carregada:', OPENAI_API_KEY ? '✅ SIM' : '❌ NÃO');

// Função mock para desenvolvimento (fallback)
async function generateMockQuiz(theme, subject, difficulty, numberOfQuestions = 5) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const questions = [];

            for (let i = 0; i < numberOfQuestions; i++) {
                questions.push({
                    question: `[MOCK] Questão ${i + 1} sobre ${theme} em ${subject}: Qual é o conceito principal?`,
                    options: [
                        `Alternativa A - Conceito correto ${i + 1}`,
                        `Alternativa B - Conceito incorreto ${i + 1}`,
                        `Alternativa C - Conceito parcial ${i + 1}`,
                        `Alternativa D - Conceito irrelevante ${i + 1}`
                    ],
                    correctAnswer: 0 // Sempre a primeira para teste
                });
            }

            resolve({ questions });
        }, 1000);
    });
}

export async function generateQuizQuestions(theme, subject, difficulty, numberOfQuestions = 5) {
    // Verifica se temos uma chave válida
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sua_chave_aqui' || OPENAI_API_KEY.includes('test')) {
        console.log('🔧 Modo Desenvolvimento: Usando quiz mock');
        console.log('💡 Dica: Configure VITE_OPENAI_API_KEY no arquivo .env para usar o ChatGPT real');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }

    try {
        console.log('🤖 Conectando com ChatGPT...');

        const prompt = `
Você é um professor especialista em criar questões educacionais para o ensino fundamental e médio.

Crie ${numberOfQuestions} questões de múltipla escolha sobre "${theme}" na disciplina de ${subject}.
Nível de dificuldade: ${difficulty}.

REGRAS IMPORTANTES:
1. Retorne APENAS JSON válido sem markdown ou texto adicional
2. Formato exato requerido:
{
  "questions": [
    {
      "question": "texto da pergunta aqui",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correctAnswer": 0
    }
  ]
}
3. As questões devem ser educativas e adequadas ao nível escolar
4. As opções devem ser claras e distintas
5. A resposta correta deve ser o índice (0-3) da opção correta
6. Use linguagem apropriada para estudantes
        `;

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
                        content: 'Você é um professor especialista. Sempre retorne APENAS JSON válido sem texto adicional.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro da API OpenAI:', errorData);
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log('📄 Resposta bruta do ChatGPT:', content);

        // Tenta extrair e parsear o JSON
        try {
            // Remove possíveis markdown e extrai JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Não foi possível encontrar JSON na resposta');
            }

            const parsedData = JSON.parse(jsonMatch[0]);

            // Valida a estrutura
            if (parsedData.questions && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
                console.log('✅ Quiz gerado com sucesso pelo ChatGPT!');
                return parsedData;
            } else {
                throw new Error('Estrutura do quiz inválida');
            }
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON do ChatGPT:', parseError);
            console.log('📝 Conteúdo que causou erro:', content);
            throw new Error('Resposta do ChatGPT em formato inválido');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar questões com ChatGPT:', error);
        console.log('🔄 Usando fallback para quiz mock...');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }
}