// src/services/gemini.js

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Função Mock para desenvolvimento sem chave de API
async function generateMockQuiz(numberOfQuestions = 5) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const questions = Array.from({ length: numberOfQuestions }, (_, i) => ({
                question: `[MOCK] Esta é a pergunta de teste número ${i + 1}?`,
                options: [`Alternativa Correta ${i + 1}`, `Alternativa Incorreta B`, `Alternativa Incorreta C`, `Alternativa Incorreta D`],
                correctAnswer: 0,
            }));
            resolve({ questions });
        }, 1000);
    });
}


export async function generateQuizQuestions(options) {
    const {
        generationType, // 'theme' ou 'text'
        theme,
        sourceText,
        subject,
        difficulty,
        numberOfQuestions = 5
    } = options;

    if (!GROQ_API_KEY) {
        console.log('🔧 Modo Desenvolvimento: Usando quiz mock (Chave da API Groq não encontrada)');
        return await generateMockQuiz(numberOfQuestions);
    }

    try {
        console.log(`🤖 Conectando com a API da Groq (Modo: ${generationType})...`);

        let systemPrompt = '';
        let userPrompt = '';

        const jsonFormat = `{
  "questions": [
    {
      "question": "Texto da pergunta.",
      "options": ["Opção Correta", "Opção Incorreta", "Opção Incorreta", "Opção Incorreta"],
      "correctAnswer": 0
    }
  ]
}`;

        // Lógica para escolher o prompt correto
        if (generationType === 'text') {
            // Prompt para gerar quiz baseado em um texto específico
            systemPrompt = `
Você é um especialista em criar questões educacionais a partir de um texto-fonte.
Sua única tarefa é criar um quiz em formato JSON a partir do TEXTO-FONTE fornecido.
REGRAS ESTRITAS:
1. Sua resposta deve ser APENAS um objeto JSON válido, sem nenhum texto fora dele.
2. O formato do JSON deve ser exatamente: ${jsonFormat}
3. Crie questões que sejam DIRETAMENTE baseadas no conteúdo do TEXTO-FONTE. Não invente informações.
4. A primeira opção ("options"[0]) deve ser SEMPRE a resposta correta ("correctAnswer": 0).`;

            userPrompt = `
Disciplina de Contexto: ${subject}
Nível de Dificuldade: ${difficulty}
Número de Questões: ${numberOfQuestions}

TEXTO-FONTE:
---
${sourceText}
---

Gere o quiz em JSON com base no TEXTO-FONTE acima.`;
        } else { // generationType === 'theme'
            // Prompt para gerar quiz baseado em um tema geral
            systemPrompt = `
Você é um professor especialista em criar questões educacionais para estudantes brasileiros.
Sua única tarefa é criar um quiz em formato JSON sobre um TEMA específico.
REGRAS ESTRITAS:
1. Sua resposta deve ser APENAS um objeto JSON válido, sem nenhum texto fora dele.
2. O formato do JSON deve ser exatamente: ${jsonFormat}
3. Crie questões relevantes e precisas sobre o TEMA solicitado.
4. A primeira opção ("options"[0]) deve ser SEMPRE a resposta correta ("correctAnswer": 0).`;

            userPrompt = `
Disciplina de Contexto: ${subject}
Nível de Dificuldade: ${difficulty}
Número de Questões: ${numberOfQuestions}

TEMA:
---
${theme}
---

Gere o quiz em JSON sobre o TEMA acima.`;
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
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
        if (!content) { throw new Error('Resposta da API em formato inválido ou vazia.'); }

        console.log('📄 Resposta bruta da Groq:', content);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { throw new Error('Nenhum JSON encontrado na resposta da API.'); }

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
        return await generateMockQuiz(numberOfQuestions);
    }
}