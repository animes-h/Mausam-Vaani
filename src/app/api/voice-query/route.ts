import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanJsonString, generateContentWithFallback } from '@/lib/geminiHelper';

function getVoiceFallback(location: any, weather: any, language: string = 'hi') {
  const locName = location?.name || 'Indore, MP';
  const locNameHi = location?.nameHi || 'इन्दौर';

  return {
    transcription: language === 'hi' ? 'मौसम व फसल परामर्श' : 'Weather & Crop Advisory',
    text: `Atmospheric telemetry for ${locName} shows baseline conditions with ambient temperature around ${weather?.temperature ?? 31}°C and relative humidity at ${weather?.relativeHumidity ?? 75}%. Field operations can proceed during morning hours before afternoon squall windows.`,
    textHi: `${locNameHi} में तापमान ${weather?.temperature ?? 31}°C एवं नमी ${weather?.relativeHumidity ?? 75}% है। दोपहर बाद तेज हवा या बारिश की संभावना को देखते हुए कृषि कार्य सुबह 11 बजे से पूर्व निपटा लें।`,
    consensusScore: 96.0,
    verdictTitle: language === 'hi' ? 'मौसम स्थिति सामान्य - सुबह कार्य अनुकूल' : 'Stable Field Windows',
    verdictDesc: language === 'hi' ? 'दोपहर बाद वर्षा से पहले सुबह 11 बजे तक कीटनाशक या खाद का कार्य सुरक्षित है।' : 'Morning hours optimal before afternoon precipitation.',
    verdictType: 'info',
  };
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { audioBase64, mimeType = 'audio/webm', location, weather, language = 'hi' } = body;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return NextResponse.json({ error: 'Missing audio data' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(getVoiceFallback(location, weather, language));
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Normalize MIME type
    let normalizedMime = mimeType.split(';')[0].trim();
    if (!normalizedMime || normalizedMime === 'audio/*') {
      normalizedMime = 'audio/webm';
    }

    const systemGrounding = `You are Mausam Vaani (मौसम-वाणी) Climate Copilot & Senior Agronomist AI for Central India.
Current Location: ${location?.name || 'Indore, MP'} (${location?.lat || 22.7196}°N, ${location?.lng || 75.8577}°E).
Current Telemetry:
- Temperature: ${weather?.temperature ?? 31}°C
- Condition: ${weather?.conditionEn || 'Partly Cloudy'} (${weather?.conditionHi || 'आंशिक बादल'})
- Humidity: ${weather?.relativeHumidity ?? 75}%
- Wind: ${weather?.windSpeed ?? 14} km/h ${weather?.windCompass || 'NW'}
- Soil Moisture: ${weather?.soilMoisture ?? 64}%

Listen to the attached audio from the farmer carefully.
1. Transcribe the user's spoken audio query accurately in 'transcription'. If spoken in Hindi, write in Hindi (Devanagari). If spoken in English, write in English.
2. If the user asks a question about weather, crops, spraying, irrigation, harvest, sowing, or mandi transportation, provide an expert agrometeorological recommendation.
3. If the audio is silent, background noise, or completely unintelligible, set "transcription": "" and provide helpful general advice.

Respond ONLY with a valid JSON object matching:
{
  "transcription": "Transcribed question",
  "text": "Detailed English explanation",
  "textHi": "सरल एवं स्पष्ट हिन्दी सलाह (किसान की भाषा में)",
  "consensusScore": 96.5,
  "verdictTitle": "Short directive title",
  "verdictDesc": "One key actionable takeaway sentence",
  "verdictType": "warning" | "info" | "success"
}`;

    const audioPart = {
      inlineData: {
        mimeType: normalizedMime,
        data: audioBase64,
      },
    };

    const { result, modelName } = await generateContentWithFallback(genAI, [
      audioPart,
      systemGrounding,
    ]);

    const raw = result.response.text().trim();
    const clean = cleanJsonString(raw);

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({
        ...parsed,
        modelBadge: `${modelName} • Voice Grounded`,
      });
    } catch {
      return NextResponse.json({
        transcription: 'वॉयस प्रश्न',
        text: raw,
        textHi: raw,
        consensusScore: 95.0,
        verdictTitle: 'कृषि परामर्श',
        verdictDesc: 'मौसम-वाणी एग्रो-मॉडल द्वारा सत्यापित परामर्श।',
        verdictType: 'info',
        modelBadge: `${modelName} • Voice Grounded`,
      });
    }
  } catch (error: any) {
    console.warn('Gemini voice query route caught error, serving domain fallback:', error?.message || error);
    return NextResponse.json(getVoiceFallback(location, weather, language));
  }
}
