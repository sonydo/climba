import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI SDK
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for AI Weather Insights
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { city, current, forecast, units } = req.body;
    const ai = getGeminiClient();

    // Helper function for fallback insights if API fails or rate limited
    const getFallbackInsights = () => ({
      summary: `Actualmente en ${city} la temperatura es de ${current?.temp ?? 20}°${units === 'imperial' ? 'F' : 'C'} con condición ${current?.condition || 'despejado'}. El tiempo se mantiene fresco y dentro de lo esperado para la temporada.`,
      clothing: (current?.temp ?? 20) < 15 
        ? "Te sugerimos llevar chaqueta o abrigo, bufanda ligera y calzado cómodo."
        : (current?.temp ?? 20) > 25
        ? "Recomendado usar ropa de algodón liviana, gafas de sol y protección solar."
        : "Ideal vestir en capas livianas (manga larga suave o chaqueta fina) y llevar gafas de sol.",
      activities: {
        running: { 
          score: (current?.temp ?? 20) > 30 ? 5 : 9, 
          reason: (current?.temp ?? 20) > 30 ? "Temperatura elevada, ejercitarse preferentemente temprano en la mañana." : "Condiciones térmicas óptimas para correr al aire libre." 
        },
        cycling: { 
          score: (current?.windSpeed ?? 10) > 25 ? 5 : 8, 
          reason: (current?.windSpeed ?? 10) > 25 ? "Viento moderado a fuerte, se requiere precaución extra en giros." : "Nivel de viento adecuado para ruta en bicicleta." 
        },
        stargazing: { 
          score: (current?.cloudCover ?? 20) < 30 ? 9 : 4, 
          reason: (current?.cloudCover ?? 20) < 30 ? "Cielo despejado propicio para observación de constelaciones." : "Nubosidad que puede obstruir parcialmente la visibilidad nocturna." 
        },
        outdoorEvent: { 
          score: (current?.precipitation ?? 0) > 0 ? 4 : 8, 
          reason: (current?.precipitation ?? 0) > 0 ? "Posibilidad de humedad en superficie, considerar resguardo bajo techo." : "Agradables condiciones atmosféricas para actividades comunitarias o picnic." 
        }
      },
      healthAdvisory: (current?.uvIndex ?? 4) >= 6 
        ? "Precaución con el índice UV elevado. Usa protector solar SPF 30+ y sombrero." 
        : "Índice UV moderado. Mantén una adecuada hidratación durante el día.",
      funFact: `¿Sabías que ${city} cuenta con microclimas influenciados por su topografía local e islas de calor urbana?`
    });

    if (!ai) {
      return res.json(getFallbackInsights());
    }

    const prompt = `Analiza los siguientes datos meteorológicos actuales y previsión para la ciudad de ${city}:
    - Temperatura actual: ${current.temp}°${units === 'imperial' ? 'F' : 'C'} (Sensación térmica: ${current.feelsLike}°)
    - Condición: ${current.condition}
    - Humedad: ${current.humidity}%
    - Viento: ${current.windSpeed} km/h (Dirección: ${current.windDirection || 'N/A'})
    - Índice UV: ${current.uvIndex}
    - Calidad del Aire (AQI): ${current.aqiLabel || 'Bueno'}
    - Cobertura de nubes: ${current.cloudCover}%
    - Previsión próxima: Máxima ${forecast?.maxTemp ?? current.temp + 3}°, Mínima ${forecast?.minTemp ?? current.temp - 5}°

    Genera una respuesta en JSON estructurado en ESPAÑOL con los siguientes campos:
    - summary: Resumen amigable y directo de 2 frases sobre el clima de hoy en ${city}.
    - clothing: Consejo específico de ropa (abrigos, impermeable, gafas, calzado).
    - activities: Objeto con claves "running", "cycling", "stargazing", "outdoorEvent", cada uno con "score" (número entero de 1 a 10) y "reason" (explicación breve en 1 frase).
    - healthAdvisory: Recomendación de salud (alergias, índice UV, hidratación o presión atmosférica).
    - funFact: Dato curioso o tip meteorológico breve sobre esta localidad o su clima actual.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              clothing: { type: Type.STRING },
              activities: {
                type: Type.OBJECT,
                properties: {
                  running: {
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, reason: { type: Type.STRING } },
                    required: ['score', 'reason']
                  },
                  cycling: {
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, reason: { type: Type.STRING } },
                    required: ['score', 'reason']
                  },
                  stargazing: {
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, reason: { type: Type.STRING } },
                    required: ['score', 'reason']
                  },
                  outdoorEvent: {
                    type: Type.OBJECT,
                    properties: { score: { type: Type.NUMBER }, reason: { type: Type.STRING } },
                    required: ['score', 'reason']
                  },
                },
                required: ['running', 'cycling', 'stargazing', 'outdoorEvent']
              },
              healthAdvisory: { type: Type.STRING },
              funFact: { type: Type.STRING }
            },
            required: ['summary', 'clothing', 'activities', 'healthAdvisory', 'funFact']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (genErr: any) {
      console.warn("Gemini API Rate Limit or Error, returning rich fallback insights:", genErr?.message || genErr);
      return res.json(getFallbackInsights());
    }
  } catch (err: any) {
    console.error("AI Insights Endpoint Error:", err);
    return res.json({
      summary: "Servicio meteorológico activo en tiempo real con datos de sensores locales.",
      clothing: "Vestir de acuerdo a las condiciones térmicas locales.",
      activities: {
        running: { score: 8, reason: "Condiciones favorables para actividad física." },
        cycling: { score: 8, reason: "Visibilidad buena en carreteras." },
        stargazing: { score: 7, reason: "Monitorear nivel de nubosidad." },
        outdoorEvent: { score: 8, reason: "Clima estable para exteriores." }
      },
      healthAdvisory: "Usar protección solar y mantener hidratación constante.",
      funFact: "Los modelos numéricos meteorológicos actualizan sus predicciones cada 3 horas."
    });
  }
});

// API Endpoint for AI Chat Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, weatherContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Hola, soy ClimaAI. Actualmente estoy en modo consulta básica. Si activas la clave de Gemini en Ajustes > Secrets, podré analizar de forma profunda cualquier consulta sobre viajes, clima futuro o física meteorológica."
      });
    }

    const systemInstruction = `Eres "ClimaAI", un asistente de meteorología muy amable, entusiasta y claro en español.
Tienes acceso al clima actual del usuario en tiempo real:
- Ciudad: ${weatherContext?.city || 'Desconocida'}
- Temperatura: ${weatherContext?.temp}°C
- Condición: ${weatherContext?.condition}
- Humedad: ${weatherContext?.humidity}%
- Viento: ${weatherContext?.windSpeed} km/h
- Índice UV: ${weatherContext?.uvIndex}
- Calidad del aire: ${weatherContext?.aqiLabel}

Responde de forma concisa y útil a sus preguntas. Mantén un tono natural, moderno y educativo.`;

    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      return res.json({ reply: response.text });
    } catch (chatApiErr: any) {
      console.warn("Gemini Chat API Error or Rate Limit:", chatApiErr?.message || chatApiErr);
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      return res.json({
        reply: `Actualmente en ${weatherContext?.city || 'tu ubicación'} se registran ${weatherContext?.temp || 20}°C con condición ${weatherContext?.condition || 'estable'}. (Nota: La cuota de Gemini AI alcanzó su límite temporal, pero estoy respondiendo con tus datos de sensores en tiempo real).`
      });
    }
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    return res.json({ reply: "Lo siento, hubo un problema momentáneo con la conexión. ¡Inténtalo de nuevo en unos momentos!" });
  }
});

const PORT = 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ClimaVerse Server started on http://0.0.0.0:${PORT}`);
});
