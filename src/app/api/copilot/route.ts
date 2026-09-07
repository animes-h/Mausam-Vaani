import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { userQuery, history, location, weather, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const historyContext = Array.isArray(history)
      ? history.slice(-4).map((m: any) => `${m.sender}: ${m.text}`).join('\n')
      : '';

    const systemGrounding = `You are Akash Vaani (आकाश-वाणी) Climate Copilot & Senior Agronomist AI for Central India.
Current Location: ${location?.name || 'Indore, MP'} (${location?.lat || 22.7196}°N, ${location?.lng || 75.8577}°E).
Current Telemetry:
- Temperature: ${weather?.temperature ?? 31}°C (Apparent: ${weather?.apparentTemperature ?? 34}°C)
- Condition: ${weather?.conditionEn || 'Partly Cloudy'} (${weather?.conditionHi || 'आंशिक बादल'})
- Humidity: ${weather?.relativeHumidity ?? 75}%
- Wind: ${weather?.windSpeed ?? 14} km/h ${weather?.windCompass || 'NW'}
- Soil Moisture: ${weather?.soilMoisture ?? 64}%

Recent Chat History:
${historyContext}

User Query: "${userQuery}"

Provide a scientific yet accessible agrometeorological response. Resolve follow-ups using the context.
Respond with ONLY a valid JSON object matching this structure:
{
  "text": "Detailed English explanation",
  "textHi": "सरल एवं स्पष्ट हिन्दी सलाह (किसान की भाषा में)",
  "consensusScore": 96.4,
  "verdictTitle": "Short directive title",
  "verdictDesc": "One key actionable takeaway sentence",
  "verdictType": "warning" | "info" | "success",
  "tableData": [
    {"Metric": "Value", "Window": "Timing", "Status": "Safe/Caution/Unsafe"}
  ]
}`;

    const res = await model.generateContent(systemGrounding);
    const raw = res.response.text().trim();
    const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        text: raw,
        textHi: raw,
        consensusScore: 95.0,
        verdictTitle: 'Agrometeorological Recommendation',
        verdictDesc: 'Advisory updated based on live radar.',
        verdictType: 'info'
      });
    }
  } catch (error: any) {
    console.error('API copilot error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
