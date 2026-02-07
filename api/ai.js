import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cliente, produto, origem, destino, dates } = req.body;

  // Calculando status base para ajudar a IA
  const today = new Date();
  const dateChegada = new Date(dates.chegada);
  const diffTime = dateChegada - today;
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Define status de risco simulado
  let statusRisk = "ON SCHEDULE";
  let statusColor = "#10b981"; // Green
  if(daysUntil < 0) { statusRisk = "DELAYED"; statusColor = "#ef4444"; }
  else if(daysUntil < 5) { statusRisk = "ARRIVING SOON"; statusColor = "#3b82f6"; }

  const prompt = `
    Role: You are a Senior Product Designer and Logistics Analyst specializing in "FreightTech".
    Task: Generate a single-file, responsive HTML + CSS dashboard. 
    
    Context:
    - Client: ${cliente}
    - Commodity: ${produto}
    - Route: ${origem} to ${destino}
    - Dates: Prod(${dates.producao}) -> ETD(${dates.embarque}) -> ETA(${dates.chegada})
    - Days to ETA: ${daysUntil} (if negative, it is delayed)

    DESIGN REQUIREMENTS (MANDATORY):
    1. **Style**: Dark mode (Midnight Blue/Black). References: Linear, Vercel, Stripe.
    2. **Typography**: 'Inter' or 'Poppins'. Clean, tracking-wide.
    3. **Background**: A deep radial gradient #020617 to #0f172a.
    4. **Glassmorphism**: Cards must use backdrop-filter: blur(12px) and rgba(255,255,255,0.03) backgrounds with subtle 1px borders.
    5. **Hero Section (SVG Map)**: 
       - Create an SVG inline background in the header. 
       - Draw abstract world dots (faint).
       - Draw a curved Bezier line connecting a point on the left (Origin) to the right (Dest). 
       - Animate a dash moving along the line (CSS @keyframes).
       - Add a "pulse" effect on the origin and destination dots.

    CONTENT REQUIREMENTS:
    1. **Header**: Client Name, Route, and a Status Badge (Top Right) saying "${statusRisk}" with color ${statusColor}.
    2. **Timeline (Centerpiece)**: 
       - Horizontal layout.
       - 5 Steps: Production -> Dispatched -> In Transit -> Port of Discharge -> Final Delivery.
       - Logic: Based on dates provided, highlight completed steps in Green/Blue, current step with a "Glow" effect, future steps in Gray.
       - Show the Date below each step.
    3. **Smart Grid (Cards)**:
       - 4 Cards grid layout.
       - Card 1: Live Weather at Origin (Invent realistic data based on location).
       - Card 2: Vessel Status (e.g., "Main Engines Normal", "Speed 14kn").
       - Card 3: Port Congestion Index (Low/Med/High).
       - Card 4: Estimated Delay (e.g., "+2 Days", "On Time").
    4. **AI Risk Analysis (The "Analyst" Persona)**:
       - Write a paragraph analyzing the specific route (${origem} to ${destino}).
       - Use expert terms: "TEU capacity", "Bunker Adjustment", "Customs clearance", "Typhoon risk" (if Asia), "Strike action" (if Europe/USA).
       - Be realistic about current global logistics climate.

    OUTPUT FORMAT:
    - Return ONLY valid HTML code starting with <!DOCTYPE html>.
    - CSS must be embedded in <style>.
    - Do NOT use Markdown blocks.
    - Ensure it is responsive (mobile friendly).
    - Footer: "Kaizen Intelligence System | v2.4".
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "You are a world-class UI/UX Designer who codes perfect HTML/CSS." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    let htmlContent = completion.choices[0].message.content;
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    res.status(200).json({ result: htmlContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'System Malfunction' });
  }
}
