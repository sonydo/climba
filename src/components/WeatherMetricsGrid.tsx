import React from 'react';
import { Wind, Compass, Droplets, Gauge, Eye, Cloud, Activity, SunMedium } from 'lucide-react';
import { CurrentWeather, DailyForecastItem } from '../types/weather';

interface WeatherMetricsGridProps {
  current: CurrentWeather;
  todayDaily?: DailyForecastItem;
  units: 'metric' | 'imperial';
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  current,
  todayDaily,
  units
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* UV Index */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Índice UV</span>
          <SunMedium className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">{current.uvIndex}</span>
          <span className="text-xs text-slate-400 ml-1">/ 11</span>
        </div>
        <div className="mt-2 text-xs text-slate-300">
          {current.uvIndex <= 2
            ? 'Bajo: No requiere protección especial.'
            : current.uvIndex <= 5
            ? 'Moderado: Usa gafas y protector solar.'
            : 'Muy alto: Evita exposición en horas centrales.'}
        </div>
      </div>

      {/* Wind & Gusts */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Viento</span>
          <Wind className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">{current.windSpeed}</span>
          <span className="text-xs text-slate-400 ml-1">km/h</span>
        </div>
        <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
          <Compass
            className="w-3.5 h-3.5 text-blue-400"
            style={{ transform: `rotate(${current.windDirection}deg)` }}
          />
          <span>Ráfagas: {current.windGusts} km/h</span>
        </div>
      </div>

      {/* Humidity & Dew Point */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Humedad</span>
          <Droplets className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">{current.humidity}%</span>
        </div>
        <div className="mt-2 text-xs text-slate-300">
          Punto de rocío estimado: {current.dewPoint}°C
        </div>
      </div>

      {/* Pressure */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-xl flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Presión</span>
          <Gauge className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">{current.pressure}</span>
          <span className="text-xs text-slate-400 ml-1">hPa</span>
        </div>
        <div className="mt-2 text-xs text-slate-300">
          {current.pressure > 1013 ? 'Alta presión barométrica (estable)' : 'Baja presión (posible inestabilidad)'}
        </div>
      </div>
    </div>
  );
};
