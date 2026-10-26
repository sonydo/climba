import React, { useState, useEffect } from 'react';
import { CityResult, CurrentWeather, HourlyForecastItem, DailyForecastItem } from './types/weather';
import { fetchFullWeatherData } from './services/weatherService';
import { Header } from './components/Header';
import { HeroWeatherCard } from './components/HeroWeatherCard';
import { SevenDayForecast } from './components/SevenDayForecast';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { AIWeatherInsights } from './components/AIWeatherInsights';
import { InteractiveMapRadar } from './components/InteractiveMapRadar';
import { KotlinCodeViewerModal } from './components/KotlinCodeViewerModal';
import { AlertTriangle, X, Smartphone, Download, CheckCircle2 } from 'lucide-react';

const DEFAULT_CITY: CityResult = {
  id: 3117735,
  name: 'Madrid',
  latitude: 40.4168,
  longitude: -3.7038,
  country: 'España',
  country_code: 'ES',
  admin1: 'Comunidad de Madrid'
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityResult>(DEFAULT_CITY);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);

  // Modals
  const [isKotlinModalOpen, setIsKotlinModalOpen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  // Saved Favorites in LocalStorage
  const [favorites, setFavorites] = useState<CityResult[]>(() => {
    try {
      const saved = localStorage.getItem('climaverse_favorites');
      return saved ? JSON.parse(saved) : [DEFAULT_CITY];
    } catch {
      return [DEFAULT_CITY];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('climaverse_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }, [favorites]);

  const loadWeatherForLocation = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFullWeatherData(lat, lon);
      setCurrentWeather(data.current);
      setHourlyForecast(data.hourly);
      setDailyForecast(data.daily);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error cargando datos meteorológicos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherForLocation(selectedCity.latitude, selectedCity.longitude);
  }, [selectedCity]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const gpsCity: CityResult = {
          id: Date.now(),
          name: 'Mi Ubicación',
          latitude,
          longitude,
          country: 'GPS',
          country_code: 'GPS'
        };
        setSelectedCity(gpsCity);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('No se pudo acceder a tu ubicación GPS. Usando Madrid por defecto.');
        setSelectedCity(DEFAULT_CITY);
      },
      { timeout: 10000 }
    );
  };

  const isFavorite = favorites.some(
    (f) =>
      f.id === selectedCity.id ||
      (f.latitude === selectedCity.latitude && f.longitude === selectedCity.longitude)
  );

  const toggleFavorite = (city: CityResult) => {
    if (isFavorite) {
      setFavorites(
        favorites.filter(
          (f) =>
            f.id !== city.id &&
            !(f.latitude === city.latitude && f.longitude === city.longitude)
        )
      );
    } else {
      setFavorites([...favorites, city]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050507] text-slate-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col gap-6 selection:bg-blue-500 selection:text-white">
      {/* Header Bar */}
      <Header
        currentCity={selectedCity.name}
        country={selectedCity.country}
        units={units}
        onToggleUnits={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
        onSelectCity={(city) => setSelectedCity(city)}
        onUseCurrentLocation={handleUseCurrentLocation}
        onOpenKotlinModal={() => setIsKotlinModalOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        selectedCityObject={selectedCity}
      />

      {/* Android APK GitHub Actions Banner info */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shadow-lg shadow-orange-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping"></span>
          </div>
          <span>
            <strong className="text-orange-400">Android APK con Gráficos Completos &amp; Icono de Sol:</strong> Tu aplicación móvil ahora incluye tema visual oscuro, pantalla de inicio con sol naranja, radar en vivo y navegación nativa.
          </span>
        </div>
        <button
          onClick={() => setIsKotlinModalOpen(true)}
          className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2 flex items-center gap-1.5"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ver / Descargar archivos Android</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400 animate-pulse tracking-wide">
            Cargando condiciones atmosféricas para {selectedCity.name}...
          </p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3 p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400" />
          <h2 className="text-xl font-medium text-slate-200">No se pudieron obtener los datos</h2>
          <p className="text-sm text-slate-400 max-w-md">{error}</p>
          <button
            onClick={() => loadWeatherForLocation(selectedCity.latitude, selectedCity.longitude)}
            className="mt-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : currentWeather ? (
        <main className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-x-hidden">
          {/* Main Left Weather Dashboard */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Hero Main Weather Card */}
            <HeroWeatherCard
              current={currentWeather}
              hourly={hourlyForecast}
              todayDaily={dailyForecast[0]}
              units={units}
            />

            {/* AI Insights Panel */}
            <AIWeatherInsights
              cityName={selectedCity.name}
              current={currentWeather}
              todayDaily={dailyForecast[0]}
              units={units}
              isChatOpen={isAIChatOpen}
              onCloseChat={() => setIsAIChatOpen(false)}
            />

            {/* Weather Metrics Grid */}
            <WeatherMetricsGrid
              current={currentWeather}
              todayDaily={dailyForecast[0]}
              units={units}
            />

            {/* Interactive Weather Radar Map */}
            <InteractiveMapRadar
              lat={selectedCity.latitude}
              lon={selectedCity.longitude}
              cityName={selectedCity.name}
            />
          </div>

          {/* Right Sidebar: 7-Day Forecast */}
          <SevenDayForecast
            daily={dailyForecast}
            units={units}
            onShowAlertModal={() => setShowAlertModal(true)}
            uvMaxToday={dailyForecast[0]?.uvMax ?? currentWeather.uvIndex}
          />
        </main>
      ) : null}

      {/* Severe Weather Alert Detail Modal */}
      {showAlertModal && currentWeather && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold text-slate-100 text-base">Informe Meteorológico de Protección</h3>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 block font-semibold uppercase mb-1">Ubicación</span>
                <span className="text-slate-100 font-medium">{selectedCity.name}, {selectedCity.country}</span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 block font-semibold uppercase mb-1">Índice UV & Sol</span>
                <span className="text-slate-100">Máximo estimado de {dailyForecast[0]?.uvMax ?? currentWeather.uvIndex} (Índice UV). Se recomienda hidratación constante y protector solar SPF 30+.</span>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 block font-semibold uppercase mb-1">Viento & Lluvia</span>
                <span className="text-slate-100">Vientos sostenidos de {currentWeather.windSpeed} km/h con ráfagas de {currentWeather.windGusts} km/h. Probabilidad de lluvia del {dailyForecast[0]?.pop ?? 0}%.</span>
              </div>
            </div>

            <button
              onClick={() => setShowAlertModal(false)}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Kotlin Code Drawer Modal */}
      <KotlinCodeViewerModal
        cityName={selectedCity.name}
        currentTemp={currentWeather ? currentWeather.temp : 24}
        isOpen={isKotlinModalOpen}
        onClose={() => setIsKotlinModalOpen(false)}
      />
    </div>
  );
}
