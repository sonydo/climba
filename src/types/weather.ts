export interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  population?: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  dewPoint: number;
  cloudCover: number;
  precipitation: number;
  isDay: boolean;
  time: string;
  aqi: number;
  aqiLabel: string;
}

export interface HourlyForecastItem {
  time: string;
  temp: number;
  condition: string;
  conditionCode: number;
  pop: number; // probability of precipitation
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  conditionCode: number;
  pop: number;
  precipitationSum: number;
  windSpeedMax: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
}

export interface AIInsight {
  summary: string;
  clothing: string;
  activities: {
    running: { score: number; reason: string };
    cycling: { score: number; reason: string };
    stargazing: { score: number; reason: string };
    outdoorEvent: { score: number; reason: string };
  };
  healthAdvisory: string;
  funFact: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
