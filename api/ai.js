import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cliente, produto, origem, destino, dates } = req.body;

  // Lógica simples para determinar o "Status do Topo"
  const today = new Date();
  const eta = new Date(dates.chegada);
  const diffTime = eta - today;
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let statusBadge = "🟢 ON SCHEDULE";
  let statusColor = "#10b981"; // Green
  
  if (daysDiff < 0) {
      statusBadge = "🔴 DELAYED";
      statusColor = "#ef4444"; // Red
  } else if (daysDiff < 7) {
      statusBadge = "🟡 ARRIVING SOON";
      statusColor = "#f59e0b"; // Yellow
  }

  const prompt = `
    Aja como um Product Designer Sênior e Analista de Comércio Exterior (Logistics Expert).
    
    TAREFA:
    Gere um código HTML completo (único arquivo) para uma página de "Tracking de Pedido Premium".
    
    CONTEXTO DO PEDIDO:
    - Cliente: ${cliente}
    - Produto: ${produto}
    - Rota: ${origem} para ${destino}
    - Datas: Produção (${dates.producao}), ETD (${dates.embarque}), ETA (${dates.chegada}).
    - Status Geral: ${statusBadge}

    DIRETRIZES VISUAIS (ESTRITO):
    1. **Tipografia**: 'Poppins', sans-serif.
    2. **Paleta**: Fundo Azul Marinho Profundo (#0f172a), Texto Branco/Cinza Claro, Detalhes em Azul Neon ou Dourado.
    3. **Cards**: Use estilo "Glassmorphism" (fundo translúcido, borda fina, sombra suave).
    4. **Header Hero**: 
       - Deve ter um fundo com um SVG INLINE (código direto no HTML).
       - O SVG deve desenhar linhas curvas abstratas simulando rotas marítimas.
       - Pontos (círculos) pulsando na esquerda (origem) e direita (destino).
       - Uma linha tracejada animada conectando os dois.
    5. **Timeline Horizontal**:
       - 5 Etapas: Produção Finalizada -> Embarcado -> Em Trânsito -> Próximo ao Destino -> Entregue.
       - Use lógica de datas para marcar as etapas concluídas com uma cor sólida e a etapa atual com um efeito "Glow" (brilho).
    6. **Grid de Cards**: 
       - Clima na Origem (invente dados realistas).
       - Status do Navio (Ex: Em navegação, Velocidade 14kn).
       - Congestionamento Portuário.
       - Previsão de Atraso.

    ANÁLISE LOGÍSTICA (TEXTO):
    - Escreva um parágrafo de análise técnica como um especialista. 
    - Use termos como: "Lead time", "Port Congestion", "Customs Clearance", "Vessel Capacity", "Weather patterns".
    - Analise a rota específica (${origem} -> ${destino}) citando riscos reais (ex: Canal de Suez, Tufões na Ásia, Greves na Europa, etc).

    ESTRUTURA DA RESPOSTA:
    - Retorne APENAS o código HTML começando com <!DOCTYPE html>.
    - O CSS deve estar embutido na tag <style>.
    - Não use Markdown (sem \`\`\`).
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Recomendado para gerar o SVG e CSS complexo corretamente
      messages: [
        { role: "system", content: "Você é um especialista em UI Design e Logística Internacional." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;

    // Limpeza de segurança caso a IA insira markdown
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    res.status(200).json({ result: htmlContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar visualização.' });
  }
}
