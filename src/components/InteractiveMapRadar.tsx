import React, { useState } from 'react';
import { Layers, MapPin, Eye, Thermometer, CloudRain, Wind } from 'lucide-react';

interface InteractiveMapRadarProps {
  lat: number;
  lon: number;
  cityName: string;
}

export const InteractiveMapRadar: React.FC<InteractiveMapRadarProps> = ({
  lat,
  lon,
  cityName
}) => {
  const [mapLayer, setMapLayer] = useState<'temp' | 'precipitation' | 'wind'>('temp');

  // OpenStreetMap embed iframe URL with bbox
  const zoom = 9;
  const bboxWidth = 1.2;
  const bbox = `${lon - bboxWidth},${lat - bboxWidth},${lon + bboxWidth},${lat + bboxWidth}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-slate-100">Radar & Mapa Interactivo</h3>
          <span className="text-xs text-slate-400 font-mono">({lat.toFixed(2)}°, {lon.toFixed(2)}°)</span>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setMapLayer('temp')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              mapLayer === 'temp'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Térmico</span>
          </button>
          <button
            onClick={() => setMapLayer('precipitation')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              mapLayer === 'precipitation'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitación</span>
          </button>
          <button
            onClick={() => setMapLayer('wind')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              mapLayer === 'wind'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Viento</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
        <iframe
          title={`Mapa de ${cityName}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmUrl}
          className="w-full h-full grayscale-[60%] invert-[90%] opacity-85 hover:grayscale-0 hover:invert-0 transition-all duration-500"
        ></iframe>

        {/* Weather Layer Simulation Overlay */}
        {mapLayer === 'temp' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-blue-500/20 pointer-events-none mix-blend-color-dodge"></div>
        )}
        {mapLayer === 'precipitation' && (
          <div className="absolute inset-0 bg-blue-600/20 pointer-events-none animate-pulse mix-blend-overlay"></div>
        )}
        {mapLayer === 'wind' && (
          <div className="absolute inset-0 bg-teal-500/15 pointer-events-none mix-blend-color-dodge"></div>
        )}

        {/* Location Marker Badge */}
        <div className="absolute bottom-3 left-3 bg-[#0d0e15]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>{cityName} - Capa {mapLayer === 'temp' ? 'Temperatura' : mapLayer === 'precipitation' ? 'Radar Lluvia' : 'Flujo de Viento'}</span>
        </div>
      </div>
    </div>
  );
};
