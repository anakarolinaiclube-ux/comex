import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cliente, produto, origem, destino, dates } = req.body;

  // Prompt projetado para gerar código HTML/CSS visualmente rico
  const prompt = `
    Aja como um Engenheiro de Software Sênior e Especialista em Comércio Exterior.
    
    OBJETIVO:
    Gere uma página HTML única, completa e responsiva que sirva como um "Dashboard de Rastreamento Logístico Premium".
    
    DADOS DO PEDIDO:
    - Cliente: ${cliente}
    - Processo/Produto: ${produto}
    - Rota: De ${origem} para ${destino}
    - Fim Produção: ${dates.producao}
    - Embarque (ETD): ${dates.embarque}
    - Chegada (ETA): ${dates.chegada}

    REQUISITOS VISUAIS E DE CONTEÚDO:
    1. **Design**: Estilo "Dark Mode Premium" (Azul Marinho profundo, Dourado ou Ciano neón). Use tipografia 'Poppins'.
    2. **Mapa Visual**: Crie uma representação abstrata de mapa múndi usando apenas CSS/SVG inline (círculos, linhas conectando origem e destino) no fundo do header.
    3. **Timeline Imponente**: Uma linha do tempo horizontal ou vertical clara mostrando os marcos (Produção, Embarque, Trânsito, Chegada). Destaque o estágio atual baseado na data de hoje.
    4. **Smart Analysis (IA)**: Baseado nas cidades de origem/destino e na época do ano (datas fornecidas), invente/simule uma análise logística realista. Ex: "Porto de Shanghai com leve congestionamento devido à alta temporada", "Rota via Canal de Suez operando normalmente", "Alertas de tufão no Pacífico". Seja convincente.
    5. **Widgets**: Inclua "cards" simulando dados em tempo real: Clima na origem, Status do Navio, Congestionamento Portuário.

    SAÍDA ESPERADA:
    Apenas o código HTML (começando com <!DOCTYPE html>). Não inclua markdown (backticks). O CSS deve estar embutido na tag <style>. O layout deve ser pronto para impressão (PDF).
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ou gpt-4-turbo, ou gpt-3.5-turbo se quiser economizar
      messages: [
        { role: "system", content: "Você é um gerador de interfaces web especializado em logística." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;

    // Limpeza básica caso a IA coloque markdown ```html
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    res.status(200).json({ result: htmlContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar dashboard.' });
  }
}