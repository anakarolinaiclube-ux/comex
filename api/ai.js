import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const prompt = `
      Você é um Consultor Sênior de Comércio Exterior e Logística Internacional.
      
      DADOS DO PROCESSO:
      ${JSON.stringify(data)}

      OBJETIVO:
      Gere um código HTML completo (apenas o conteúdo dentro da tag <body>, sem <html> ou <head> pois eu já tenho) para um Dashboard de Follow-up Executivo.
      O design deve ser moderno, clean, usando classes do Tailwind CSS (que já está instalado).
      
      ESTRUTURA DO DASHBOARD (HTML):
      1. **Cabeçalho**: Resumo do PO, Cliente e Status Geral (Visualmente impactante).
      2. **Timeline Visual**: Uma barra de progresso horizontal mostrando as etapas (Produção -> Booking -> Embarque -> Trânsito -> Chegada). Marque a etapa atual.
      3. **Análise de Inteligência (AI Insights)**:
         - Crie um texto profissional sobre a situação atual nos portos citados (invente dados plausíveis baseados em conhecimento geral de logística para os portos de origem/destino informados).
         - Mencione riscos de congestionamento ou tendências de frete.
      4. **Tabela Detalhada**: Organize os dados técnicos (Container, Navio, Pesos, Volumes) em uma tabela elegante.
      5. **Gráficos (Charts)**:
         - Inclua 2 elementos <canvas> com IDs únicos.
         - Inclua uma tag <script> logo após os canvas que renderize dois gráficos usando Chart.js:
           a) Um gráfico de "Breakdown de Tempo" (Dias em Produção vs Dias em Trânsito Estimado vs Dias Desembaraço).
           b) Um gráfico de "Tendência de Custos/Frete" (Simulado para a rota específica nos últimos 3 meses).
      
      REGRAS DE FORMATAÇÃO:
      - Use tipografia sans-serif.
      - Cores: Azul Marinho (#1e293b), Verde Esmeralda para sucessos, Laranja para alertas.
      - NÃO use markdown. Retorne apenas a string HTML crua.
      - O script do Chart.js deve ser auto-executável.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Modelo mais capaz para gerar código e layout
      messages: [
        { role: "system", content: "Você é um especialista em frontend e logística. Você gera HTMLs ricos com Tailwind CSS e Scripts Chart.js embutidos." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;

    // Limpeza básica caso a IA coloque markdown
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    return res.status(200).json({ result: htmlContent });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar follow-up.' });
  }
}
