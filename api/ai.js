import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { poNumber, origin, destination, productionDate, shippingDate } = req.body;

  try {
    const prompt = `
      Você é um Consultor Sênior de Comércio Exterior e Logística Internacional.
      Crie um DASHBOARD VISUAL em HTML puro (sem tags <html> ou <body>, apenas o conteúdo interno) para apresentar ao cliente.
      
      DADOS DO PROCESSO:
      - PO Number: ${poNumber}
      - Origem: ${origin}
      - Destino: ${destination}
      - Data Prontidão: ${productionDate}
      - Data Embarque (ETD): ${shippingDate}

      TAREFAS:
      1. Calcule uma estimativa de ETA (Chegada) baseada na rota ${origin} -> ${destination} (seja realista com tempos de trânsito marítimo).
      2. Crie uma "Barra de Progresso" visual simulando a rota.
      3. Gere "Insights de Mercado": invente dados plausíveis sobre congestionamento no porto de origem, clima ou disponibilidade de containers para dar contexto profissional.
      4. Use classes CSS que serão injetadas no frontend (padrão Tailwind ou classes semânticas simples).
      
      ESTRUTURA DO HTML DE RESPOSTA:
      - Um card de resumo com ícones (use <i> com classes font-awesome, ex: fa-ship).
      - Uma timeline horizontal com 3 pontos: Origem -> Trânsito -> Destino.
      - Uma seção de "Smart Insights" com um texto breve e profissional.
      - Uma tabela pequena com as datas chaves (ETD, ETA estimado, Deadline).

      Estilo deve ser minimalista, elegante, focado em dados. Não use Markdown, apenas HTML string.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ou gpt-4
      messages: [
        { role: "system", content: "Você é um assistente especialista em UI de Dashboards para Logística." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const htmlContent = completion.choices[0].message.content.replace(/```html|```/g, '');

    res.status(200).json({ result: htmlContent });

  } catch (error) {
    console.error(error);
    res.status(500).json({ result: "<div class='error'>Erro ao gerar dashboard. Verifique sua API Key.</div>" });
  }
}
