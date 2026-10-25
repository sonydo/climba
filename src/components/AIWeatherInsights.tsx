import React, { useState, useEffect } from 'react';
import { Sparkles, Shirt, Activity, Lightbulb, MessageSquare, Send, X, Bot, User, RefreshCw, Bike, Footprints, Telescope, PartyPopper } from 'lucide-react';
import { CurrentWeather, DailyForecastItem, AIInsight, ChatMessage } from '../types/weather';

interface AIWeatherInsightsProps {
  cityName: string;
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
  units: 'metric' | 'imperial';
  isChatOpen: boolean;
  onCloseChat: () => void;
}

export const AIWeatherInsights: React.FC<AIWeatherInsightsProps> = ({
  cityName,
  current,
  todayDaily,
  units,
  isChatOpen,
  onCloseChat
}) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `¡Hola! Soy ClimaAI, tu asistente meteorológico personal para ${cityName}. ¿En qué te puedo ayudar hoy? ¿Quieres saber si lloverá más tarde, el mejor horario para hacer deporte o qué empacar?`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityName,
          current,
          forecast: {
            maxTemp: todayDaily?.maxTemp ?? current.temp + 3,
            minTemp: todayDaily?.minTemp ?? current.temp - 4
          },
          units
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInsight(data);
      }
    } catch (e) {
      console.error('Error fetching AI insights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [cityName, current.temp, current.condition]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          weatherContext: {
            city: cityName,
            temp: current.temp,
            condition: current.condition,
            humidity: current.humidity,
            windSpeed: current.windSpeed,
            uvIndex: current.uvIndex,
            aqiLabel: current.aqiLabel
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply || 'No pude obtener la respuesta en este momento.',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      console.error('Error in chat:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent rounded-3xl border border-purple-500/20 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
            <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Informe Inteligente Gemini AI</span>
            </h3>
            <p className="text-xs text-slate-400">Análisis personalizado en tiempo real para {cityName}</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-purple-300 transition-colors border border-white/10"
          title="Regenerar análisis de IA"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium animate-pulse">
            Sintetizando informe meteorológico con Gemini AI...
          </p>
        </div>
      ) : insight ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm text-slate-200 leading-relaxed">
            {insight.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clothing Advice */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Recomendación de Ropa
                </span>
                <p className="text-xs text-slate-200 leading-normal">{insight.clothing}</p>
              </div>
            </div>

            {/* Health Advisory */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Consejo de Salud
                </span>
                <p className="text-xs text-slate-200 leading-normal">{insight.healthAdvisory}</p>
              </div>
            </div>
          </div>

          {/* Activities Ratings */}
          {insight.activities && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Aptitud para Actividades al Aire Libre
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-300 mb-1">
                    <Footprints className="w-3.5 h-3.5 text-blue-400" />
                    <span>Running</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-300">
                    {insight.activities.running?.score}/10
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-300 mb-1">
                    <Bike className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ciclismo</span>
                  </div>
                  <div className="text-lg font-semibold text-emerald-300">
                    {insight.activities.cycling?.score}/10
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-300 mb-1">
                    <Telescope className="w-3.5 h-3.5 text-purple-400" />
                    <span>Estrellas</span>
                  </div>
                  <div className="text-lg font-semibold text-purple-300">
                    {insight.activities.stargazing?.score}/10
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-300 mb-1">
                    <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                    <span>Eventos</span>
                  </div>
                  <div className="text-lg font-semibold text-amber-300">
                    {insight.activities.outdoorEvent?.score}/10
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* AI Chat Modal Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl w-full max-w-lg h-[600px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-100 text-sm">ClimaAI - Asistente en Tiempo Real</h3>
                  <p className="text-xs text-slate-400">Preguntas sobre {cityName}</p>
                </div>
              </div>
              <button
                onClick={onCloseChat}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-600/30 border border-purple-400/30 text-purple-300'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200"></div>
                  <span>Generando respuesta...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu consulta (ej. ¿Qué ropa llevar mañana?)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400/50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
