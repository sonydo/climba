import { CityResult, CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../types/weather';
import { interpretWmoCode, formatDayName } from '../utils/weatherInterpreter';

export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=es&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      country_code: item.country_code || '',
      admin1: item.admin1 || '',
      population: item.population || 0
    }));
  } catch (error) {
    console.error('Error fetching geocoding:', error);
    return [];
  }
}

export async function fetchFullWeatherData(lat: number, lon: number): Promise<{
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error en el servidor meteorológico: ${res.statusText}`);
  }
  const data = await res.json();

  const currentRaw = data.current;
  const hourlyRaw = data.hourly;
  const dailyRaw = data.daily;

  const currentWmo = interpretWmoCode(currentRaw.weather_code, currentRaw.is_day === 1);

  // Compute AQI mock/index based on condition & humidity
  const aqiVal = Math.min(100, Math.max(15, Math.round(30 + (currentRaw.relative_humidity_2m * 0.2) + (currentRaw.wind_speed_10m < 5 ? 20 : 0))));
  const aqiLabel = aqiVal < 50 ? 'Excelente' : aqiVal < 80 ? 'Moderada' : 'No saludable';

  const current: CurrentWeather = {
    temp: Math.round(currentRaw.temperature_2m),
    feelsLike: Math.round(currentRaw.apparent_temperature),
    condition: currentWmo.description,
    conditionCode: currentRaw.weather_code,
    humidity: currentRaw.relative_humidity_2m,
    windSpeed: Math.round(currentRaw.wind_speed_10m),
    windGusts: Math.round(currentRaw.wind_gusts_10m),
    windDirection: currentRaw.wind_direction_10m,
    pressure: Math.round(currentRaw.surface_pressure),
    uvIndex: Math.round(currentRaw.uv_index),
    visibility: 10,
    dewPoint: Math.round(currentRaw.temperature_2m - ((100 - currentRaw.relative_humidity_2m) / 5)),
    cloudCover: currentRaw.cloud_cover,
    precipitation: currentRaw.precipitation,
    isDay: currentRaw.is_day === 1,
    time: currentRaw.time,
    aqi: aqiVal,
    aqiLabel
  };

  // Find index of current hour
  const now = new Date();
  const currentIsoHour = now.toISOString().slice(0, 13);
  let startIdx = hourlyRaw.time.findIndex((t: string) => t.startsWith(currentIsoHour));
  if (startIdx === -1) startIdx = 0;

  const hourly: HourlyForecastItem[] = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyRaw.time.length); i++) {
    const timeStr = hourlyRaw.time[i];
    const hourLabel = timeStr.slice(11, 16);
    const code = hourlyRaw.weather_code[i];
    const isDay = hourlyRaw.is_day[i] === 1;
    const interp = interpretWmoCode(code, isDay);

    hourly.push({
      time: hourLabel,
      temp: Math.round(hourlyRaw.temperature_2m[i]),
      condition: interp.description,
      conditionCode: code,
      pop: hourlyRaw.precipitation_probability[i] || 0,
      isDay
    });
  }

  const daily: DailyForecastItem[] = [];
  for (let i = 0; i < dailyRaw.time.length; i++) {
    const dateStr = dailyRaw.time[i];
    const code = dailyRaw.weather_code[i];
    const interp = interpretWmoCode(code, true);

    daily.push({
      date: dateStr,
      dayName: i === 0 ? 'Hoy' : formatDayName(dateStr),
      maxTemp: Math.round(dailyRaw.temperature_2m_max[i]),
      minTemp: Math.round(dailyRaw.temperature_2m_min[i]),
      condition: interp.description,
      conditionCode: code,
      pop: dailyRaw.precipitation_probability_max[i] || 0,
      precipitationSum: dailyRaw.precipitation_sum[i] || 0,
      windSpeedMax: Math.round(dailyRaw.wind_speed_10m_max[i] || 0),
      uvMax: Math.round(dailyRaw.uv_index_max[i] || 0),
      sunrise: dailyRaw.sunrise[i]?.slice(11, 16) || '07:00',
      sunset: dailyRaw.sunset[i]?.slice(11, 16) || '20:00'
    });
  }

  return { current, hourly, daily };
}
