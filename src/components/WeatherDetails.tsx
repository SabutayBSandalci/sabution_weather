import React from 'react';
import { WeatherData, ForecastData } from './types';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Bar, BarChart
} from 'recharts';

interface WeatherDetailsProps {
  weatherData: WeatherData;
  forecastData: ForecastData | null;
  theme: 'dark' | 'light';
  lang: 'en' | 'tr';
  tempUnit: 'C' | 'F';
  windUnit: 'ms' | 'knot' | 'kph';
  translations: any;
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  weatherData,
  forecastData,
  theme,
  lang,
  tempUnit,
  windUnit,
  translations
}) => {
  const t = translations[lang];
  const currentTheme = theme === 'dark' ? {
    bg: 'bg-dark-200',
    text: 'text-white',
    textMuted: 'text-white/60',
    border: 'border-white/10',
    accent: 'bg-white/5'
  } : {
    bg: 'bg-white',
    text: 'text-gray-800',
    textMuted: 'text-gray-500',
    border: 'border-gray-100',
    accent: 'bg-gray-50'
  };

  // Görüş mesafesi açıklamaları
  const getVisibilityDescription = (): string => {
    if (lang === 'tr') {
      if (weatherData.visibility >= 10000) return 'Mükemmel';
      if (weatherData.visibility >= 5000) return 'İyi';
      return 'Orta';
    } else {
      if (weatherData.visibility >= 10000) return 'Excellent';
      if (weatherData.visibility >= 5000) return 'Good';
      return 'Moderate';
    }
  };

  // Çeviriler için ek metinler
  const tExtra = {
    excellent: lang === 'tr' ? 'Mükemmel' : 'Excellent',
    good: lang === 'tr' ? 'İyi' : 'Good',
    moderate: lang === 'tr' ? 'Orta' : 'Moderate',
    visibilityInfo: lang === 'tr' ? 'Görüş Mesafesi' : 'Visibility',
    visibilityDescription: lang === 'tr' ? 'Mevcut görüş koşulları' : 'Current visibility conditions',
    visibilityDetail: lang === 'tr' ? 'Nesnelerin net görülebildiği maksimum mesafe' : 'Maximum distance at which objects can be clearly seen',
    windInfo: lang === 'tr' ? 'Rüzgar Bilgisi' : 'Wind Information',
    pressureInfo: lang === 'tr' ? 'Basınç' : 'Pressure',
    high: lang === 'tr' ? 'Yüksek' : 'High',
    low: lang === 'tr' ? 'Düşük' : 'Low',
    normal: lang === 'tr' ? 'Normal' : 'Normal',
    pressureDescription: lang === 'tr' ? 'Atmosfer basıncı hava koşullarını etkileyebilir' : 'Atmospheric pressure can affect weather conditions',
    humidityInfo: lang === 'tr' ? 'Nem ve Çiğ Noktası' : 'Humidity & Dew Point',
    clear: lang === 'tr' ? 'Açık' : 'Clear',
    fewClouds: lang === 'tr' ? 'Az Bulutlu' : 'Few Clouds',
    scatteredClouds: lang === 'tr' ? 'Parçalı Bulutlu' : 'Scattered Clouds', 
    brokenClouds: lang === 'tr' ? 'Çok Bulutlu' : 'Broken Clouds',
    overcast: lang === 'tr' ? 'Kapalı' : 'Overcast',
    cloudDescription: lang === 'tr' ? 'Gökyüzündeki bulut örtüsü yüzdesi' : 'Percentage of cloud coverage in the sky',
    change: lang === 'tr' ? 'değişim' : 'change',
    localTime: lang === 'tr' ? 'yerel saat' : 'local time',
    totalDaylight: lang === 'tr' ? 'toplam gün ışığı' : 'total daylight',
    precipitation: lang === 'tr' ? 'Yağış' : 'Precip.'
  };

  // Rüzgar yönünü dereceden yöne çeviren fonksiyon
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Basınç trendini hesaplayan fonksiyon
  const getPressureTrend = (forecastData: ForecastData) => {
    if (!forecastData || forecastData.list.length < 2) return 'stabil';
    const diff = forecastData.list[0].main.pressure - forecastData.list[1].main.pressure;
    if (diff > 1) return 'yükseliyor';
    if (diff < -1) return 'düşüyor';
    return 'stabil';
  };

  // Sıcaklık trendini hesaplayan fonksiyon
  const getTemperatureTrend = (current: number, previous: number): string => {
    const diff = current - previous;
    if (diff > 0.5) return t.rising;
    if (diff < -0.5) return t.falling;
    return t.stable;
  };

  // Rüzgar trendini hesaplayan fonksiyon
  const getWindTrend = (current: number, previous: number): string => {
    const diff = current - previous;
    if (diff > 0.5) return t.rising;
    if (diff < -0.5) return t.falling;
    return t.stable;
  };

  // Sıcaklık birimi dönüştürme
  const toF = (c: number) => Number((c * 9/5 + 32).toFixed(1));

  // Rüzgar birimi dönüştürme
  const toKnot = (ms: number) => Number((ms * 1.94384).toFixed(1));
  const toKph = (ms: number) => Number((ms * 3.6).toFixed(1));

  // Pusula yönü fonksiyonu
  const getCompassDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  // Çiğ noktası hesaplama fonksiyonu
  const getDewPoint = (temp: number, humidity: number): number => {
    // Magnus formülü
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  };

  // Grafik verisi hazırlama
  const getHourlyChartData = (forecastData: ForecastData) => {
    return forecastData.list.slice(0, 8).map((item: ForecastData['list'][0]) => ({
      hour: new Date(item.dt * 1000).getHours() + ':00',
      temp: item.main.temp,
      pop: Math.round(item.pop * 100),
      wind: item.wind.speed,
    }));
  };

  // Saatlik tahmin bileşeni
  const renderHourlyForecast = () => {
    if (!forecastData) return null;

    const next24Hours = forecastData.list.slice(0, 8);

    return (
      <div className={`p-4 rounded-xl ${currentTheme.bg} shadow-sm`}>
        <div className="flex items-center mb-3 pb-2 border-b ${currentTheme.border}">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`font-semibold ${currentTheme.text}`}>{t.nextHours}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {next24Hours.map((hour: any, index: number) => (
            <div key={index} className={`text-center p-2 rounded-lg bg-opacity-50 hover:bg-opacity-75 transition-all duration-300 ${currentTheme.accent}`}>
              <div className={`text-sm font-medium ${currentTheme.text}`}>
                {new Date(hour.dt * 1000).getHours()}:00
              </div>
              <img 
                src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                alt={hour.weather[0].description}
                className="w-12 h-12 mx-auto"
              />
              <div className="flex flex-col gap-1">
                <div className={`font-medium ${currentTheme.text}`}>
                  {tempUnit === 'C' ? `${hour.main.temp.toFixed(1)}°C` : `${toF(hour.main.temp)}°F`}
                </div>
                <div className={`text-xs ${currentTheme.textMuted}`}>
                  {tExtra.precipitation}: {Math.round(hour.pop * 100)}%
                </div>
                <div className={`text-xs ${currentTheme.textMuted}`}>
                  {t.clouds}: {hour.clouds.all}%
                </div>
                <div className={`text-xs ${currentTheme.textMuted}`}>
                  {t.windSpeed}: {windUnit === 'ms' ? `${hour.wind.speed.toFixed(1)} m/s` :
                                windUnit === 'knot' ? `${toKnot(hour.wind.speed)} knot` :
                                `${toKph(hour.wind.speed)} km/h`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Detaylı hava durumu bileşeni
  const renderDetailedWeather = () => {
    if (!weatherData) return null;

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Görüş Mesafesi */}
        <div className={`flex items-center p-3 rounded-lg ${currentTheme.accent}`}>
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <span className={`text-sm font-medium ${currentTheme.text}`}>{tExtra.visibilityInfo}</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-medium ${currentTheme.text}`}>
                {(weatherData.visibility / 1000).toFixed(1)} {t.km}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({getVisibilityDescription()})
              </span>
            </div>
            <span className={`text-xs ${currentTheme.textMuted}`}>
              {tExtra.visibilityDescription}
            </span>
            <span className={`text-xs ${currentTheme.textMuted} block mt-1`}>
              {tExtra.visibilityDetail}
            </span>
          </div>
        </div>

        {/* Rüzgar Bilgisi */}
        <div className={`flex items-center p-3 rounded-lg ${currentTheme.accent}`}>
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <div>
            <span className={`text-sm font-medium ${currentTheme.text}`}>{tExtra.windInfo}</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-medium ${currentTheme.text}`}>
                {getWindDirection(weatherData.wind.deg)}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({weatherData.wind.deg}°)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-sm ${currentTheme.text}`}>
                {windUnit === 'ms' ? `${weatherData.wind.speed.toFixed(1)} m/s` :
                 windUnit === 'knot' ? `${toKnot(weatherData.wind.speed)} knot` :
                 `${toKph(weatherData.wind.speed)} km/h`}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({t.windSpeed})
              </span>
            </div>
          </div>
        </div>

        {/* Basınç */}
        <div className={`flex items-center p-3 rounded-lg ${currentTheme.accent}`}>
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className={`text-sm font-medium ${currentTheme.text}`}>{tExtra.pressureInfo}</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-medium ${currentTheme.text}`}>
                {weatherData.main.pressure} hPa
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({weatherData.main.pressure > 1013 ? tExtra.high : weatherData.main.pressure < 1013 ? tExtra.low : tExtra.normal})
              </span>
            </div>
            <span className={`text-xs ${currentTheme.textMuted}`}>
              {tExtra.pressureDescription}
            </span>
          </div>
        </div>

        {/* Nem ve Çiğ Noktası */}
        <div className={`flex items-center p-3 rounded-lg ${currentTheme.accent}`}>
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <span className={`text-sm font-medium ${currentTheme.text}`}>{tExtra.humidityInfo}</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-medium ${currentTheme.text}`}>
                {weatherData.main.humidity}%
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({t.humidity})
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-sm ${currentTheme.text}`}>
                {tempUnit === 'C' ? `${getDewPoint(weatherData.main.temp, weatherData.main.humidity).toFixed(1)}°C` : 
                `${toF(getDewPoint(weatherData.main.temp, weatherData.main.humidity))}°F`}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({t.dewPoint})
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Güneş bilgileri bileşeni
  const renderSunInfo = () => {
    if (!weatherData?.sys?.sunrise || !weatherData?.sys?.sunset) return null;

    const sunrise = new Date(weatherData.sys.sunrise * 1000);
    const sunset = new Date(weatherData.sys.sunset * 1000);
    const dayLength = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);

    return (
      <div className={`p-4 rounded-xl ${currentTheme.bg} shadow-sm`}>
        <h3 className={`font-semibold mb-3 pb-2 border-b ${currentTheme.border} ${currentTheme.text}`}>
          {t.sunInfo}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.sunrise}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({tExtra.localTime})
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.sunset}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({tExtra.localTime})
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.dayLength}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {Math.floor(dayLength)} {t.h} {Math.round((dayLength % 1) * 60)} {t.min}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({tExtra.totalDaylight})
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hava durumu trendleri bileşeni
  const renderWeatherTrends = () => {
    if (!forecastData) return null;

    const currentTemp = forecastData.list[0].main.temp;
    const previousTemp = forecastData.list[1].main.temp;
    const currentWind = forecastData.list[0].wind.speed;
    const previousWind = forecastData.list[1].wind.speed;
    const currentPressure = forecastData.list[0].main.pressure;
    const previousPressure = forecastData.list[1].main.pressure;

    const tempDiff = tempUnit === 'C' ? 
      (currentTemp - previousTemp).toFixed(1) : 
      (toF(currentTemp) - toF(previousTemp)).toFixed(1);

    const windDiff = windUnit === 'ms' ? 
      (currentWind - previousWind).toFixed(1) :
      windUnit === 'knot' ? 
        (toKnot(currentWind) - toKnot(previousWind)).toFixed(1) :
        (toKph(currentWind) - toKph(previousWind)).toFixed(1);

    return (
      <div className={`p-4 rounded-xl ${currentTheme.bg} shadow-sm`}>
        <h3 className={`font-semibold mb-3 pb-2 border-b ${currentTheme.border} ${currentTheme.text}`}>
          {t.weatherTrend}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.temperatureTrend}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {getTemperatureTrend(currentTemp, previousTemp)}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({tempDiff}{tempUnit === 'C' ? '°C' : '°F'} {tExtra.change})
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.windTrend}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {getWindTrend(currentWind, previousWind)}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({windDiff} {windUnit === 'ms' ? 'm/s' : windUnit === 'knot' ? 'knot' : 'km/h'} {tExtra.change})
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm ${currentTheme.textMuted}`}>{t.pressureTrend}</span>
            <div className="flex items-baseline gap-2">
              <span className={`font-medium ${currentTheme.text}`}>
                {getPressureTrend(forecastData)}
              </span>
              <span className={`text-xs ${currentTheme.textMuted}`}>
                ({currentPressure - previousPressure} hPa {tExtra.change})
              </span>
            </div>
            <span className={`text-xs ${currentTheme.textMuted}`}>
              {tExtra.pressureDescription}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Bulut bilgileri bileşeni
  const renderCloudInfo = () => {
    if (!forecastData) return null;

    const cloudCover = forecastData.list[0].clouds.all;
    const getCloudDescription = (cover: number) => {
      if (cover < 10) return tExtra.clear;
      if (cover < 25) return tExtra.fewClouds;
      if (cover < 50) return tExtra.scatteredClouds;
      if (cover < 75) return tExtra.brokenClouds;
      return tExtra.overcast;
    };

    return (
      <div className={`p-4 rounded-xl ${currentTheme.bg} shadow-sm`}>
        <h3 className={`font-semibold mb-3 pb-2 border-b ${currentTheme.border} ${currentTheme.text}`}>
          {t.cloudCover}
        </h3>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-medium ${currentTheme.text}`}>
              {cloudCover}%
            </span>
            <span className={`text-xs ${currentTheme.textMuted}`}>
              ({getCloudDescription(cloudCover)})
            </span>
          </div>
          <span className={`text-sm ${currentTheme.textMuted} mt-1`}>
            {tExtra.cloudDescription}
          </span>
        </div>
      </div>
    );
  };

  // Saatlik grafikler
  const renderCharts = () => {
    if (!forecastData) return null;
    const data = getHourlyChartData(forecastData);
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sıcaklık Grafiği */}
        <div className={`${currentTheme.bg} rounded-xl p-3 shadow`}>
          <h4 className={`font-semibold mb-2 text-center ${currentTheme.text}`}>{t.hourlyTemp}</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data}>
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Yağış Olasılığı Grafiği */}
        <div className={`${currentTheme.bg} rounded-xl p-3 shadow`}>
          <h4 className={`font-semibold mb-2 text-center ${currentTheme.text}`}>{t.precipitationProb}</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data}>
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pop" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Rüzgar Hızı Grafiği */}
        <div className={`${currentTheme.bg} rounded-xl p-3 shadow`}>
          <h4 className={`font-semibold mb-2 text-center ${currentTheme.text}`}>{t.windSpeed}</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data}>
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="wind" stroke="#f59e42" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {renderDetailedWeather()}
      {renderHourlyForecast()}
      {renderSunInfo()}
      {renderWeatherTrends()}
      {renderCloudInfo()}
      {renderCharts()}
    </div>
  );
};

export default WeatherDetails; 