import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, Sparkles, Code2, Bookmark, BookmarkCheck, CloudSun, Smartphone } from 'lucide-react';
import { CityResult } from '../types/weather';
import { searchCities } from '../services/weatherService';

interface HeaderProps {
  currentCity: string;
  country: string;
  units: 'metric' | 'imperial';
  onToggleUnits: () => void;
  onSelectCity: (city: CityResult) => void;
  onUseCurrentLocation: () => void;
  onOpenKotlinModal: () => void;
  onOpenAIChat: () => void;
  favorites: CityResult[];
  onToggleFavorite: (city: CityResult) => void;
  isFavorite: boolean;
  selectedCityObject: CityResult;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  country,
  units,
  onToggleUnits,
  onSelectCity,
  onUseCurrentLocation,
  onOpenKotlinModal,
  onOpenAIChat,
  favorites,
  onToggleFavorite,
  isFavorite,
  selectedCityObject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFavDropdown, setShowFavDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const data = await searchCities(searchQuery);
        setResults(data);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-white/10 pb-5">
      {/* Brand & Current Location */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <CloudSun className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">ClimaVerse</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Studio Pro
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-200">{currentCity}</span>
            {country && <span>• {country}</span>}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="relative w-full md:max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            placeholder="Buscar ciudad (ej. Madrid, Buenos Aires, Tokio)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all backdrop-blur-md"
          />
          {isSearching && (
            <div className="absolute right-3.5 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#10121d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 backdrop-blur-xl">
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center justify-between text-sm transition-colors group"
              >
                <div>
                  <span className="font-medium text-slate-200 group-hover:text-blue-300">
                    {city.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {city.latitude.toFixed(1)}°, {city.longitude.toFixed(1)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
        {/* GPS Button */}
        <button
          onClick={onUseCurrentLocation}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
          title="Detectar mi ubicación GPS"
        >
          <Compass className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">GPS</span>
        </button>

        {/* Favorite Toggle Button */}
        <button
          onClick={() => onToggleFavorite(selectedCityObject)}
          className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
            isFavorite
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          {isFavorite ? (
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
          ) : (
            <Bookmark className="w-4 h-4 text-slate-400" />
          )}
          <span className="hidden sm:inline">Favoritos</span>
        </button>

        {/* Unit Switcher */}
        <button
          onClick={onToggleUnits}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          title="Cambiar unidades térmicas"
        >
          {units === 'metric' ? '°C' : '°F'}
        </button>

        {/* Gemini AI Assistant Button */}
        <button
          onClick={onOpenAIChat}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-purple-500/10 transition-all"
        >
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>ClimaAI</span>
        </button>

        {/* Kotlin & Android APK Code Button */}
        <button
          onClick={onOpenKotlinModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Android / Kotlin</span>
        </button>
      </div>
    </header>
  );
};
