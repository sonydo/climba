import React from 'react';
import { Calendar, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, AlertTriangle, Sunrise, Sunset } from 'lucide-react';
import { DailyForecastItem } from '../types/weather';
import { interpretWmoCode } from '../utils/weatherInterpreter';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  units: 'metric' | 'imperial';
  onShowAlertModal: () => void;
  uvMaxToday?: number;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  daily,
  units,
  onShowAlertModal,
  uvMaxToday = 5
}) => {
  const displayTemp = (tempC: number) => {
    if (units === 'imperial') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return tempC;
  };

  const unitSymbol = units === 'imperial' ? '°F' : '°C';

  // Compute min and max across all 7 days for temperature bar normalization
  const allMax = Math.max(...daily.map((d) => d.maxTemp), 30);
  const allMin = Math.min(...daily.map((d) => d.minTemp), 0);
  const tempRange = Math.max(1, allMax - allMin);

  const getWeatherIcon = (name: string) => {
    switch (name) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'cloud-sun':
        return <Cloud className="w-5 h-5 text-sky-300" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-slate-400" />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'cloud-snow':
        return <CloudSnow className="w-5 h-5 text-sky-200" />;
      case 'cloud-lightning':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      default:
        return <Sun className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col gap-5">
      {/* Weather Safety / Alert Banner */}
      <div
        onClick={onShowAlertModal}
        className="cursor-pointer bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl p-4 flex items-center justify-between hover:border-amber-500/50 transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Alerta de Prevención</h4>
            <p className="text-xs text-slate-400">
              {uvMaxToday >= 7 ? 'Índice UV muy alto en las horas pico.' : 'Condiciones atmosféricas bajo vigilancia.'}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-amber-400 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          Ver detalles
        </span>
      </div>

      {/* 7-Day Outlook Card */}
      <div className="bg-white/5 rounded-3xl border border-white/10 p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Pronóstico de 7 Días
          </h3>
        </div>

        <div className="divide-y divide-white/5 space-y-1">
          {daily.map((item, idx) => {
            const interp = interpretWmoCode(item.conditionCode, true);
            const leftOffsetPercent = ((item.minTemp - allMin) / tempRange) * 100;
            const barWidthPercent = ((item.maxTemp - item.minTemp) / tempRange) * 100;

            return (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-white/5 px-2 rounded-xl transition-colors"
              >
                <div className="w-20">
                  <span className={`text-sm ${idx === 0 ? 'font-bold text-blue-400' : 'font-medium text-slate-200'}`}>
                    {item.dayName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 w-16">
                  {getWeatherIcon(interp.iconName)}
                  {item.pop > 10 && (
                    <span className="text-[10px] text-sky-400 font-mono font-medium">
                      {item.pop}%
                    </span>
                  )}
                </div>

                {/* Min / Max Temperature Bar */}
                <div className="flex-1 flex items-center gap-2 max-w-[130px]">
                  <span className="text-xs text-slate-400 w-7 text-right">
                    {displayTemp(item.minTemp)}°
                  </span>

                  <div className="flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${Math.max(0, leftOffsetPercent)}%`,
                        width: `${Math.max(15, Math.min(100, barWidthPercent))}%`
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-100 w-7">
                    {displayTemp(item.maxTemp)}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sun cycle footer summary */}
        {daily[0] && (
          <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] uppercase block text-slate-500 font-semibold">Amanecer</span>
                <span className="text-slate-200 font-medium">{daily[0].sunrise}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
              <Sunset className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] uppercase block text-slate-500 font-semibold">Atardecer</span>
                <span className="text-slate-200 font-medium">{daily[0].sunset}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
