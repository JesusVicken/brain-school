// src/services/gemini.js (usando Groq, com o modelo de produção final)

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function generateMockQuiz(theme, subject, difficulty, numberOfQuestions = 5) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const questions = Array.from({ length: numberOfQuestions }, (_, i) => ({
                question: `[MOCK] Questão ${i + 1} sobre ${theme} (${subject}): Qual é o conceito principal?`,
                options: [
                    `Alternativa Correta ${i + 1}`,
                    `Alternativa Incorreta B`,
                    `Alternativa Incorreta C`,
                    `Alternativa Incorreta D`,
                ],
                correctAnswer: 0,
            }));
            resolve({ questions });
        }, 1000);
    });
}

export async function generateQuizQuestions(theme, subject, difficulty, numberOfQuestions = 5) {
    if (!GROQ_API_KEY) {
        console.log('🔧 Modo Desenvolvimento: Usando quiz mock (Chave da API Groq não encontrada)');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }

    try {
        console.log('🤖 Conectando com a API da Groq...');

        const systemPrompt = `
Você é um professor especialista em criar questões educacionais para estudantes brasileiros.
Sua única saída DEVE SER um objeto JSON válido. Não inclua a palavra "json", markdown, explicações ou qualquer outro texto fora do objeto JSON.
O formato do JSON deve ser exatamente:
{
  "questions": [
    {
      "question": "Texto da pergunta.",
      "options": ["Opção Correta", "Opção Incorreta", "Opção Incorreta", "Opção Incorreta"],
      "correctAnswer": 0
    }
  ]
}
`;

        const userPrompt = `Crie um quiz com ${numberOfQuestions} questões sobre o tema: "${theme}" para a disciplina de ${subject}, com dificuldade ${difficulty}.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // ✅ CORREÇÃO FINAL: Usando um modelo de produção da lista oficial.
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 2048,
                top_p: 1,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro da API Groq:', errorData);
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Resposta da API em formato inválido ou vazia.');
        }

        console.log('📄 Resposta bruta da Groq:', content);

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Nenhum JSON encontrado na resposta da API.');
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        if (parsedData.questions && Array.isArray(parsedData.questions)) {
            console.log('✅ Quiz gerado com sucesso pela Groq!');
            return parsedData;
        } else {
            throw new Error('Estrutura do JSON retornado é inválida.');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar questões com a Groq:', error);
        console.log('🔄 Usando fallback para quiz mock...');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }
}