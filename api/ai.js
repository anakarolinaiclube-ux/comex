import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const prompt = `
      ATUE COMO: Um Analista Sênior de Logística Internacional e Inteligência de Mercado.
      
      CONTEXTO:
      Recebi os seguintes dados de um processo de importação/exportação:
      ${JSON.stringify(data)}

      OBJETIVO:
      Gere um componente HTML (apenas o conteúdo do <body>) visualmente rico e moderno usando Tailwind CSS.
      
      ESTRUTURA OBRIGATÓRIA DO LAYOUT:
      
      1. **Barra de Progresso (Status Visual)**:
         - Crie um "Stepper" horizontal visualmente atraente.
         - Etapas: Booking -> Produção -> Embarque -> Trânsito Int. -> Chegada -> Desembaraço.
         - Analise as datas fornecidas (${data.date_ready}, ${data.date_etd}, ${data.date_eta}) para determinar em qual etapa estamos HOJE e destaque-a com uma cor vibrante (ex: azul ou verde). As etapas passadas devem parecer "concluídas" e as futuras "pendentes".
      
      2. **Grid de Análise de Cenário (3 Colunas)**:
         Crie 3 cartões (Cards) elegantes lado a lado (responsivo):
         
         - **CARD 1: Cenário de Trânsito Internacional**:
           Invente uma análise plausível sobre a rota marítima/aérea entre ${data.port_origin} e ${data.port_dest}. Mencione rotas, taxas de frete atuais (tendência) ou riscos geopolíticos (ex: Mar Vermelho, Canal do Panamá) se aplicável à rota.
         
         - **CARD 2: Situação na Origem (${data.port_origin})**:
           Invente uma análise baseada na data de prontidão/embarque. Mencione feriados locais (ex: Golden Week se for China, Carnaval se for Brasil), clima (tufões/tempestades) ou disponibilidade de containers vazios e trucks.
         
         - **CARD 3: Situação no Destino (${data.port_dest})**:
           Invente uma análise sobre a previsão de chegada. Mencione congestionamento de berço, greves de fiscais, tempo médio de liberação ou clima esperado para a data de ETA.

      DESIGN & TOM DE VOZ:
      - Use ícones do FontAwesome (<i class="fa-solid fa-..."></i>) para ilustrar cada card.
      - Tom profissional, executivo e tranquilizador, mas realista.
      - Design "Clean", fundo branco ou cinza muito claro, sombras suaves.
      - Tipografia Poppins (já carregada).
      - NÃO retorne Markdown ou \`\`\`html. Apenas o código HTML cru.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "Você é um especialista em UI/UX e Logística. Você gera HTML limpo com Tailwind CSS." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;
    
    // Limpeza de segurança
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    return res.status(200).json({ result: htmlContent });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar análise.' });
  }
}
