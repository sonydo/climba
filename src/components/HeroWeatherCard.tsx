import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer, ArrowUp, ArrowDown } from 'lucide-react';
import { CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../types/weather';
import { interpretWmoCode } from '../utils/weatherInterpreter';

interface HeroWeatherCardProps {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  todayDaily?: DailyForecastItem;
  units: 'metric' | 'imperial';
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({
  current,
  hourly,
  todayDaily,
  units
}) => {
  const displayTemp = (tempC: number) => {
    if (units === 'imperial') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return tempC;
  };

  const unitSymbol = units === 'imperial' ? '°F' : '°C';
  const interp = interpretWmoCode(current.conditionCode, current.isDay);

  const getWeatherIcon = (name: string, className: string = 'w-10 h-10') => {
    switch (name) {
      case 'sun':
        return <Sun className={`${className} text-amber-300 animate-spin-slow`} />;
      case 'cloud-sun':
        return <Cloud className={`${className} text-sky-200`} />;
      case 'cloud':
        return <Cloud className={`${className} text-slate-300`} />;
      case 'cloud-rain':
      case 'cloud-drizzle':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'cloud-snow':
        return <CloudSnow className={`${className} text-sky-200`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-amber-400`} />;
      default:
        return <Sun className={`${className} text-amber-300`} />;
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${interp.bgGradient} text-white shadow-2xl border border-white/10 overflow-hidden backdrop-blur-md`}
    >
      {/* Ambient glowing radial effects */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/15">
        {/* Main Temperature and Condition */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white/90 border border-white/10">
              {current.isDay ? 'Tiempo Actual' : 'Condiciones Nocturnas'}
            </span>
            <span className="text-xs text-white/70 font-mono">
              Calidad de Aire: <strong className="text-emerald-300">{current.aqiLabel}</strong>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-7xl sm:text-8xl font-black tracking-tighter drop-shadow-md">
              {displayTemp(current.temp)}
            </h2>
            <span className="text-3xl sm:text-4xl font-light text-white/80">{unitSymbol}</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <p className="text-xl sm:text-2xl font-medium tracking-tight text-white/95">
              {current.condition}
            </p>
            {getWeatherIcon(interp.iconName, 'w-8 h-8')}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-white/60" />
              Sensación: <strong>{displayTemp(current.feelsLike)}{unitSymbol}</strong>
            </span>
            {todayDaily && (
              <>
                <span className="flex items-center gap-0.5 text-emerald-300">
                  <ArrowUp className="w-3.5 h-3.5" />
                  {displayTemp(todayDaily.maxTemp)}{unitSymbol}
                </span>
                <span className="flex items-center gap-0.5 text-sky-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                  {displayTemp(todayDaily.minTemp)}{unitSymbol}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Highlights Pill Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" />
            <div>
              <span className="block text-[10px] text-white/60 uppercase font-semibold">Humedad</span>
              <span className="text-xs font-semibold">{current.humidity}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-teal-300" />
            <div>
              <span className="block text-[10px] text-white/60 uppercase font-semibold">Viento</span>
              <span className="text-xs font-semibold">{current.windSpeed} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <Sun className="w-4 h-4 text-amber-300" />
            <div>
              <span className="block text-[10px] text-white/60 uppercase font-semibold">Índice UV</span>
              <span className="text-xs font-semibold">{current.uvIndex} / 11</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Horizontal Track */}
      <div className="relative z-10 pt-5">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
          Previsión para las Próximas 24 Horas
        </h4>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
          {hourly.map((hour, idx) => {
            const hInterp = interpretWmoCode(hour.conditionCode, hour.isDay);
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-between min-w-[72px] py-2.5 px-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5 backdrop-blur-md shrink-0"
              >
                <span className="text-xs font-mono text-white/80">{hour.time}</span>
                <div className="my-2">{getWeatherIcon(hInterp.iconName, 'w-6 h-6')}</div>
                <span className="text-sm font-bold">
                  {displayTemp(hour.temp)}°
                </span>
                {hour.pop > 0 ? (
                  <span className="text-[10px] text-sky-300 font-semibold mt-1">
                    {hour.pop}%
                  </span>
                ) : (
                  <span className="text-[10px] text-white/40 mt-1">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
