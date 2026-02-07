import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cliente, produto, origem, destino, dates } = req.body;

  // Cálculo simples de dias para ajudar a IA na análise
  const today = new Date();
  const eta = new Date(dates.chegada);
  const diffDays = Math.ceil((eta - today) / (1000 * 60 * 60 * 24));
  let statusClass = diffDays < 0 ? "ATRASADO" : (diffDays < 7 ? "CHEGANDO" : "EM TRÂNSITO");

  const prompt = `
    Aja como um Senior Frontend Developer e Especialista em Logística.
    
    OBJETIVO:
    Gere um arquivo HTML único contendo um Dashboard Logístico Premium.
    Você DEVE usar estritamente o estilo visual "Kaizen Dark Premium" (Fundo preto azulado, Neon Ciano #38bdf8, Dourado #fbbf24, Glassmorphism).
    
    DADOS DO PROCESSO:
    - Cliente: ${cliente}
    - Produto: ${produto}
    - Rota: ${origem} para ${destino}
    - Datas: Produção (${dates.producao}) -> ETD (${dates.embarque}) -> ETA (${dates.chegada})
    - Status Tempo Real: ${statusClass} (${diffDays} dias para ETA).

    REGRAS DE LAYOUT (Baseado no "Kaizen Design System"):
    1. **Background**: Use um fundo animado com SVG (linhas de rotas marítimas e pontos pulsando) sobre um fundo gradiente radial escuro (#0b0e14).
    2. **Tipografia**: Use 'Poppins'.
    3. **Estrutura**:
       - Header: Título "KAIZEN MONITOR", subtítulo com o nome do cliente.
       - **Analysis Card (Topo)**: Um card largo glassmorphism contendo uma "Análise de Inteligência Artificial". Escreva um texto técnico e convincente sobre a rota, clima e riscos geopolíticos (invente dados realistas baseados na rota ${origem}-${destino}).
       - **Timeline Vertical**: Use uma linha do tempo VERTICAL (igual ao design de referência).
         - Crie 5 cards (Produção, Embarque, Trânsito, Chegada, Entrega).
         - Logica de Cores: Eventos passados = Ciano (Neon). Evento atual = Dourado (Pulsando). Eventos futuros = Cinza translúcido.
       - **Grid de Dados**: 3 pequenos cards abaixo com ícones FontAwesome: "Status Navio", "Clima Destino", "Lead Time Estimado".

    REGRAS DE CÓDIGO:
    - Retorne APENAS o HTML (com CSS e JS embutidos).
    - Use FontAwesome via CDN.
    - O CSS deve incluir animações: @keyframes pulse, @keyframes float, @keyframes slideIn.
    - Os cards devem ter efeito de vidro: background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08).
    
    TEXTO DA ANÁLISE (IMPORTANTE):
    Escreva como um consultor sênior. Exemplo: "A rota via Oceano Índico apresenta estabilidade, porém o porto de destino reporta congestionamento de 2 dias..."
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é uma engine de renderização de UI focada em design system dark/neon." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    res.status(200).json({ result: htmlContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no processamento.' });
  }
}
