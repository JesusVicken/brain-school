// src/services/gemini.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Função mock para desenvolvimento
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
                    correctAnswer: 0
                });
            }
            resolve({ questions });
        }, 1000);
    });
}

export async function generateQuizQuestions(theme, subject, difficulty, numberOfQuestions = 5) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'sua-chave-gemini-pro-aqui') {
        console.log('🔧 Modo Desenvolvimento: Usando quiz mock');
        console.log('💡 Dica: Configure VITE_GEMINI_API_KEY no arquivo .env');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }

    try {
        console.log('🤖 Conectando com Google Gemini Pro...');

        const prompt = `
Você é um professor especialista em criar questões educacionais para o ensino fundamental e médio no Brasil.
CRIE um quiz com ${numberOfQuestions} questões sobre: "${theme}"
DISCIPLINA: ${subject}
NÍVEL DE DIFICULDADE: ${difficulty}
PÚBLICO-ALVO: Estudantes brasileiros
REGRAS ESTRITAS:
1. Retorne APENAS JSON válido sem nenhum texto adicional ou markdown.
2. Formato exato obrigatório:
{
  "questions": [
    {
      "question": "Texto claro e objetivo da pergunta",
      "options": ["Opção A correta", "Opção B incorreta", "Opção C incorreta", "Opção D incorreta"],
      "correctAnswer": 0
    }
  ]
}
DIRETRIZES PEDAGÓGICAS:
- Questões devem ser factualmente corretas.
- Linguagem apropriada para a série escolar.
- Opções plausíveis e desafiadoras.
- Foco no conteúdo educacional brasileiro.
- Evitar ambiguidades.
`;

        // ✅ CORRIGIDO: Alterado 'gemini-1.5-pro' para 'gemini-pro' na URL
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 3000,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erro da API Gemini:', errorData);
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Resposta da API em formato inesperado ou vazia');
        }

        const content = data.candidates[0].content.parts[0].text;
        console.log('📄 Resposta bruta do Gemini:', content);

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Nenhum JSON encontrado na resposta da API.');
            }
            const parsedData = JSON.parse(jsonMatch[0]);
            if (parsedData.questions && Array.isArray(parsedData.questions)) {
                console.log('✅ Quiz gerado com sucesso pelo Gemini Pro!');
                return parsedData;
            } else {
                throw new Error('Estrutura do quiz no JSON retornado é inválida.');
            }
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON do Gemini:', parseError);
            throw new Error('Falha ao processar a resposta do Gemini.');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar questões com Gemini:', error);
        console.log('🔄 Usando fallback para quiz mock...');
        return await generateMockQuiz(theme, subject, difficulty, numberOfQuestions);
    }
}