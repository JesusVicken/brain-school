🎓 Quizz App
Um aplicativo educacional interativo que gera quizzes personalizados usando inteligência artificial. Desenvolvido para tornar o aprendizado mais divertido e eficaz para estudantes de todos os níveis.

✨ Funcionalidades
Formulário Inteligente: Um formulário com múltiplos passos (stepper) para coletar informações do aluno e os detalhes do quiz.

Geração com IA: Utiliza a API da Groq para criar questões e alternativas relevantes com base no tema, disciplina e nível de dificuldade escolhidos.

Gameplay Interativo: Interface limpa para responder às perguntas com feedback visual imediato para respostas certas e erradas.

Resultados Detalhados: Ao final do quiz, exibe um resumo completo com pontuação, percentual de acertos e tempo total.

Design Responsivo: A interface se adapta a diferentes tamanhos de tela, de desktops a dispositivos móveis.

🚀 Tecnologias Utilizadas
Frontend: React (com Vite)

UI Kit: Material-UI (MUI)

Inteligência Artificial: Groq API (com o modelo Llama 3.1)

Ícones: MUI Icons

🛠️ Configuração e Instalação
Siga os passos abaixo para rodar o projeto localmente.

Pré-requisitos
Node.js (versão 18 ou superior)

npm ou yarn

1. Clone o Repositório
git clone [https://github.com/JesusVicken/brain-school.git](https://github.com/JesusVicken/brain-school.git)
cd brain-school

2. Instale as Dependências
npm install

3. Configure as Variáveis de Ambiente
Para que a aplicação possa se comunicar com a API da Groq, você precisa de uma chave de API.

Crie um arquivo chamado .env na raiz do projeto.

Adicione sua chave de API da Groq (que você pode obter gratuitamente em console.groq.com) ao arquivo:

VITE_GROQ_API_KEY=gsk_SUA_CHAVE_API_SECRETA_AQUI

4. Rode o Servidor de Desenvolvimento
npm run dev

Abra http://localhost:5173 (ou a porta que seu terminal indicar) no seu navegador para ver a aplicação funcionando.

📂 Estrutura de Arquivos
/
├── public/               # Arquivos estáticos (imagens, fontes)
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── StudentForm.jsx
│   │   ├── QuizGame.jsx
│   │   └── Footer.jsx
│   ├── services/         # Módulos de serviço (ex: chamadas de API)
│   │   └── gemini.js     # (Nome mantido, mas usa a API da Groq)
│   ├── App.jsx           # Componente principal da aplicação
│   └── main.jsx          # Ponto de entrada do React
├── .env                  # Arquivo para chaves de API (NÃO ENVIAR PARA O GITHUB)
├── .gitignore            # Arquivos e pastas ignorados pelo Git
└── README.md             # Esta documentação

📜 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
