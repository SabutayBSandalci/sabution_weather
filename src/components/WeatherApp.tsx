import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WeatherDetails from './WeatherDetails';
import { ForecastData } from './types';

// Tema renkleri
const themes = {
  dark: {
    primary: 'bg-dark-100',
    secondary: 'bg-dark-200',
    tertiary: 'bg-dark-300',
    accent: 'bg-white/5',
    text: 'text-white',
    border: 'border-white/10',
    hover: 'hover:bg-white/10',
    buttonBg: 'bg-dark-200',
    buttonHover: 'hover:bg-dark-300',
    card: 'bg-white/5',
    cardHover: 'hover:bg-white/10',
    inputBg: 'bg-dark-200',
    mapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  light: {
    primary: 'bg-gray-100',
    secondary: 'bg-white',
    tertiary: 'bg-gray-50',
    accent: 'bg-blue-50',
    text: 'text-gray-800',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-200/30',
    buttonBg: 'bg-white',
    buttonHover: 'hover:bg-gray-100',
    card: 'bg-white',
    cardHover: 'hover:bg-blue-50',
    inputBg: 'bg-white',
    mapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    secondaryText: 'text-gray-600',
    mutedText: 'text-gray-500'
  }
};

// Leaflet marker icon ayarları
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Leaflet CSS stillerini geçersiz kılmak için bir stil elementi ekleyelim
const leafletStyles = `
  .leaflet-control-attribution {
    display: none !important;
  }
  
  .leaflet-light .leaflet-container {
    background-color: #f8fafc;
  }
  
  .leaflet-light .leaflet-popup-content-wrapper,
  .leaflet-light .leaflet-popup-tip {
    background-color: #ffffff;
    color: #1f2937;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  .leaflet-popup-content {
    margin: 0;
    padding: 0;
    width: 100% !important;
  }
  
  .leaflet-popup-close-button {
    top: 8px !important;
    right: 8px !important;
    font-size: 18px !important;
    color: #555 !important;
  }
  
  .leaflet-popup-close-button:hover {
    color: #000 !important;
  }
  
  .leaflet-popup-tip-container {
    left: 50%;
    margin-left: -10px;
  }
`;

// API Bilgileri
const API_KEY = 'f1597843ba87abcd6a54811b66ad719f';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// Türkçe-İngilizce çeviriler
const translations = {
  en: {
    weather: 'Weather',
    selectLocation: 'Please select a location on the map or search',
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    pressure: 'Pressure',
    wind: 'Wind',
    condition: 'Condition',
    searchPlaceholder: 'Search city...',
    windLayer: 'Winds',
    findMe: 'Find Me',
    language: 'Language',
    english: 'English',
    turkish: 'Turkish',
    windButton: '{name} Winds',
    searchPlaceholderShort: 'Search city...',
    showDetails: 'Show Details',
    nextHours: 'Next 24 Hours',
    forecast: 'Detailed Weather',
    visibility: 'Visibility',
    windDirection: 'Wind Direction',
    dewPoint: 'Dew Point',
    sunInfo: 'Sun Information',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    dayLength: 'Day Length',
    h: 'h',
    min: 'min',
    weatherTrend: 'Weather Trends',
    temperatureTrend: 'Temperature Trend',
    windTrend: 'Wind Trend',
    pressureTrend: 'Pressure Trend',
    rising: 'Rising',
    falling: 'Falling',
    stable: 'Stable',
    cloudCover: 'Cloud Cover',
    cloudLevel: 'Cloud Level',
    km: 'km',
    hourlyTemp: 'Hourly Temperature',
    precipitationProb: 'Precipitation Probability',
    windSpeed: 'Wind Speed'
  },
  tr: {
    weather: 'Hava Durumu',
    selectLocation: 'Lütfen haritada bir konum seçin veya arama yapın',
    temperature: 'Sıcaklık',
    feelsLike: 'Hissedilen',
    humidity: 'Nem',
    pressure: 'Basınç',
    wind: 'Rüzgar',
    condition: 'Durum',
    searchPlaceholder: 'Şehir ara...',
    windLayer: 'Rüzgarlar',
    findMe: 'Konumumu Bul',
    language: 'Dil',
    english: 'İngilizce',
    turkish: 'Türkçe',
    windButton: '{name} Rüzgarları',
    searchPlaceholderShort: 'Şehir ara...',
    showDetails: 'Detayları Göster',
    nextHours: 'Sonraki 24 Saat',
    forecast: 'Detaylı Hava Durumu',
    visibility: 'Görüş Mesafesi',
    windDirection: 'Rüzgar Yönü',
    dewPoint: 'Çiğ Noktası',
    sunInfo: 'Güneş Bilgileri',
    sunrise: 'Gün Doğumu',
    sunset: 'Gün Batımı',
    dayLength: 'Gün Uzunluğu',
    h: 'sa',
    min: 'dk',
    weatherTrend: 'Hava Durumu Trendleri',
    temperatureTrend: 'Sıcaklık Trendi',
    windTrend: 'Rüzgar Trendi',
    pressureTrend: 'Basınç Trendi',
    rising: 'Yükseliyor',
    falling: 'Düşüyor',
    stable: 'Stabil',
    cloudCover: 'Bulut Örtüsü',
    cloudLevel: 'Bulut Seviyesi',
    km: 'km',
    hourlyTemp: 'Saatlik Sıcaklık',
    precipitationProb: 'Yağış Olasılığı',
    windSpeed: 'Rüzgar Hızı'
  }
};

// Mega Şehirler
const MEGA_CITIES = [
  // Türkiye
  { name: { en: "Istanbul", tr: "İstanbul" }, coords: [41.0082, 28.9784], country: "TR" },
  // Asya
  { name: { en: "Tokyo", tr: "Tokyo" }, coords: [35.6762, 139.6503], country: "JP" },
  { name: { en: "Shanghai", tr: "Şanghay" }, coords: [31.2304, 121.4737], country: "CN" },
  // Avrupa
  { name: { en: "London", tr: "Londra" }, coords: [51.5074, -0.1278], country: "GB" },
  { name: { en: "Paris", tr: "Paris" }, coords: [48.8566, 2.3522], country: "FR" },
  // Amerika
  { name: { en: "New York", tr: "New York" }, coords: [40.7128, -74.0060], country: "US" },
  { name: { en: "Los Angeles", tr: "Los Angeles" }, coords: [34.0522, -118.2437], country: "US" },
];

// Arayüz Tanımlamaları
export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
}

export interface SearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface LocationData {
  lat: number;
  lng: number;
}

export interface MapEventsProps {
  onMapClick: (lat: number, lon: number) => void;
}

export type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// Harita olaylarını yöneten bileşen
const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
};

// Harita denetleyicisi bileşeni
const MapController: React.FC<{ 
  center: [number, number], 
  zoom: number, 
  isMarkerSelected: boolean,
  showPopupCentered: boolean
}> = ({ center, zoom, isMarkerSelected, showPopupCentered }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isMarkerSelected) {
      // Önce merkeze odaklan - konuma tıklandığında
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5 // Daha yavaş zoom animasyonu
      });
      
      if (showPopupCentered) {
        // Popup'ı ekranın tam ortasına hizalamak için haritayı kaydır
        setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          
          // Popup'ın ekranın tam ortasında görünmesi için gereken kaydırma miktarı
          // Sabit piksel değeri kullanmak yerine ekran yüksekliğine göre hesaplama yapalım
          const yOffset = isMobile ? window.innerHeight / 4 : window.innerHeight / 5; 
          
          // Merkezi yukarı kaydır
          const newPoint = map.project(center).add([0, -yOffset]);
          const newCenter = map.unproject(newPoint);
          
          map.panTo(newCenter, { 
            animate: true,
            duration: 1.5,
            easeLinearity: 0.15 // Çok daha yumuşak hareket
          });
        }, 600); // Zoom animasyonu biraz tamamlansın
      }
    } else {
      // Konum seçili değilse normal davranış
      map.setView(center, zoom, {
        animate: true,
        duration: 0.8
      });
    }
  }, [map, center, zoom, isMarkerSelected, showPopupCentered]);
  
  return null;
};

// Hava durumu ikonu oluşturucu
const createWeatherIcon = (iconCode: string) => {
  // Hava durumu koduna göre renk belirleme
  // İlk iki karakter hava durumu tipini belirtir (01: açık, 02-04: parçalı bulutlu, 09-10: yağmurlu, 11: fırtınalı, 13: karlı, 50: sisli)
  const weatherType = iconCode.substring(0, 2);
  const isDay = iconCode.charAt(2) === 'd'; // Gündüz ('d') veya gece ('n')
  
  let gradientColors = '';
  let bgColor = 'bg-white/90';
  
  switch(weatherType) {
    case '01': // Açık
      gradientColors = isDay ? 'from-yellow-400 to-orange-500' : 'from-indigo-800 to-blue-900';
      bgColor = isDay ? 'bg-yellow-50/90' : 'bg-indigo-50/90';
      break;
    case '02': // Az bulutlu
      gradientColors = isDay ? 'from-blue-300 to-blue-400' : 'from-indigo-700 to-blue-800';
      bgColor = isDay ? 'bg-blue-50/90' : 'bg-indigo-50/90';
      break;
    case '03': // Parçalı bulutlu
    case '04': // Çok bulutlu
      gradientColors = isDay ? 'from-blue-400 to-blue-500' : 'from-indigo-600 to-blue-700';
      bgColor = isDay ? 'bg-blue-50/90' : 'bg-indigo-50/90';
      break;
    case '09': // Sağanak yağışlı
      gradientColors = 'from-blue-500 to-blue-600';
      bgColor = 'bg-blue-50/90';
      break;
    case '10': // Yağmurlu
      gradientColors = 'from-blue-400 to-cyan-600';
      bgColor = 'bg-blue-50/90';
      break;
    case '11': // Fırtına
      gradientColors = 'from-purple-500 to-indigo-700';
      bgColor = 'bg-purple-50/90';
      break;
    case '13': // Kar
      gradientColors = 'from-blue-200 to-blue-300';
      bgColor = 'bg-white/95';
      break;
    case '50': // Sis
      gradientColors = 'from-gray-400 to-gray-600';
      bgColor = 'bg-gray-100/95';
      break;
    default:
      gradientColors = 'from-blue-400 to-blue-600';
  }
  
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradientColors} rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 border-2 border-white">
        <div class="w-12 h-12 rounded-full ${bgColor} flex items-center justify-center">
          <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="weather" class="w-full h-full object-contain" />
        </div>
      </div>
    `,
    className: 'weather-icon',
    iconSize: [64, 64],
    iconAnchor: [32, 32]
  });
};

// Mega şehirler için özel ikon oluşturucu
const createCityIcon = (city: { name: { en: string, tr: string }, country: string }) => {
  // Şehir ve ülke için farklı renkler
  const cityColors: Record<string, string> = {
    'TR': 'from-red-500 to-red-700',  // Türkiye
    'JP': 'from-red-400 to-pink-600', // Japonya
    'CN': 'from-red-600 to-yellow-500', // Çin
    'GB': 'from-blue-600 to-red-600', // Birleşik Krallık
    'FR': 'from-blue-500 via-white to-red-500', // Fransa
    'US': 'from-blue-700 to-red-600' // ABD
  };
  
  const colorClass = cityColors[city.country] || 'from-blue-500 to-indigo-600';
  
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-br ${colorClass} rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200 border-2 border-white cursor-pointer">
        <span class="text-xs font-bold text-white">${city.name.en.slice(0, 2).toUpperCase()}</span>
      </div>
    `,
    className: 'city-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// İki nokta arasındaki mesafeyi hesaplayan fonksiyon
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

const WeatherApp: React.FC = () => {
  // State tanımlamaları
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'ms' | 'knot' | 'kph'>('ms');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9334, 32.8597]); // Ankara
  const [zoom, setZoom] = useState(6);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMarkerSelected, setIsMarkerSelected] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distanceToSelected, setDistanceToSelected] = useState<number | null>(null);
  const [showPopupCentered, setShowPopupCentered] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const currentTheme = themes[theme];

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Ekran boyutunu kontrol eden fonksiyon
  useEffect(() => {
    const checkMobile = () => {
      // Bu fonksiyon bir state'i güncellemek için kullanılıyordu
      // Artık kullanılmıyor, responsive tasarım Tailwind ile yapılıyor
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Kullanıcı konumunu belirleyen fonksiyon
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setZoom(10);
        },
        (error) => {
          setError('Konum alınamadı: ' + error.message);
        }
      );
    } else {
      setError('Tarayıcınız konum hizmetini desteklemiyor');
    }
  };

  // Uygulama yüklendiğinde otomatik olarak konum izni iste
  useEffect(() => {
    handleLocationClick();
  }, []);

  // Harita tıklama işleyicisi
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setMapCenter([lat, lng]);
    setIsMarkerSelected(true);
    
    // Kullanıcı konumu varsa mesafeyi hesapla
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        lat, 
        lng
      );
      setDistanceToSelected(distance);
    }
    
    // Seçilen konumun daha iyi görünmesi için zoom seviyesini ayarla
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setZoom(8); // Mobil için daha az zoom
    } else {
      setZoom(10);
    }
  };

  // Hava durumu ikonuna tıklama işleyicisi
  const handleWeatherIconClick = () => {
    if (selectedLocation) {
      setShowPopupCentered(true);
      // Popup için ideal zoom seviyesi - görüntüyü daha da ortala
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setZoom(10); // Mobil için biraz daha fazla zoom
      } else {
        setZoom(12); // Masaüstü için daha yakın zoom
      }
    }
  };

  // Şehir arama işleyicisi
  const searchCity = async () => {
    if (searchQuery.trim() === '') return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<SearchResult[]>(GEO_API_URL, {
        params: {
          q: searchQuery,
          limit: 5,
          appid: API_KEY
        }
      });
      
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      setError('Arama başarısız oldu');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Şehir seçme işleyicisi
  const handleCitySelect = (result: SearchResult) => {
    setSelectedLocation({ lat: result.lat, lng: result.lon });
    setMapCenter([result.lat, result.lon]);
    setIsMarkerSelected(true);
    setShowDetails(false); // Yeni bir konum seçildiğinde detayları kapat
    
    // Kullanıcı konumu varsa mesafeyi hesapla
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        result.lat, 
        result.lon
      );
      setDistanceToSelected(distance);
    }
    
    // Mobil ekranda popup'ın daha iyi görünmesi için zoom seviyesini ayarla
    if (window.innerWidth < 768) {
      setZoom(8); // Mobil için optimum zoom seviyesi
    } else {
      setZoom(10);
    }
    
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Sıcaklık birimi dönüştürme fonksiyonları
  const toF = (c: number) => (c * 9/5 + 32).toFixed(1);
  
  // Rüzgar birimi dönüştürme fonksiyonları
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toKnot = (ms: number) => (ms * 1.94384).toFixed(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toKph = (ms: number) => (ms * 3.6).toFixed(1);

  // Hava durumu verilerini çeken fonksiyon
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedLocation) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<WeatherData>(API_URL, {
          params: {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
            appid: API_KEY,
            units: 'metric',
            lang: lang
          }
        });
        
        setWeatherData(response.data);
        // Forecast verisi
        const forecastRes = await axios.get<ForecastData>('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
            appid: API_KEY,
            units: 'metric',
            lang: lang
          }
        });
        setForecastData(forecastRes.data);
      } catch (err) {
        setError('Hava durumu verisi alınamadı');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, [selectedLocation, lang]);

  // Ayarlar menüsü dışında bir yere tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Detayları göster/gizle
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Detay paneli animasyonu için stil sınıfları
  const detailsPanelClass = showDetails
    ? "transform translate-y-0 opacity-100 pointer-events-auto"
    : "transform translate-y-full opacity-0 pointer-events-none";

  return (
    <div className={`flex h-screen ${currentTheme.primary} ${currentTheme.text}`}>
      {/* Haritadaki atıf yazısını gizleyecek stil */}
      <style>{leafletStyles}</style>
      
      {/* Harita Bölümü (Tam Ekran) */}
      <div className="relative w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          className={`h-full w-full z-0 map-container ${theme === 'light' ? 'leaflet-light' : ''}`}
          zoomControl={false}
        >
          <TileLayer
            attribution=''
            url={currentTheme.mapUrl}
          />
          
          <MapController 
            center={mapCenter} 
            zoom={zoom} 
            isMarkerSelected={isMarkerSelected} 
            showPopupCentered={showPopupCentered}
          />
          <MapEvents onMapClick={handleMapClick} />
          
          {/* Seçili Konum İşaretçisi */}
          {selectedLocation && weatherData && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={createWeatherIcon(weatherData.weather[0].icon)}
              eventHandlers={{
                click: () => {
                  handleWeatherIconClick();
                }
              }}
            >
              <Popup 
                className="rounded-2xl shadow-xl"
                autoClose={false}
                autoPan={false}
                closeButton={true}
                maxWidth={280}
                offset={[0, -10]}
              >
                <div className="flex flex-col w-full bg-white rounded-2xl overflow-hidden text-gray-800">
                  {/* Konum Başlığı */}
                  <div className="px-4 pt-4 pb-3 text-center">
                    <h3 className="text-xl font-bold mb-1">
                      {weatherData.name}, {weatherData.sys.country}
                    </h3>
                    <p className="text-lg font-medium capitalize">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                  
                  {/* Sadeleştirilmiş Hava Durumu Bilgileri */}
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">{t.temperature}:</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-md font-semibold">
                        {tempUnit === 'C' ? `${weatherData.main.temp.toFixed(1)}°C` : `${toF(weatherData.main.temp)}°F`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">{t.feelsLike}:</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-md font-semibold">
                        {tempUnit === 'C' ? `${weatherData.main.feels_like.toFixed(1)}°C` : `${toF(weatherData.main.feels_like)}°F`}
                      </span>
                    </div>

                    {/* Mesafe Bilgisi (kullanıcı konumu varsa) */}
                    {distanceToSelected !== null && userLocation && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-medium text-gray-600">{lang === 'tr' ? 'Mesafe' : 'Distance'}:</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-md font-semibold">
                          {distanceToSelected < 1 
                            ? `${(distanceToSelected * 1000).toFixed(0)} m` 
                            : `${distanceToSelected.toFixed(1)} km`}
                        </span>
                      </div>
                    )}
                    
                    {/* Detay Göster Butonu */}
                    <div 
                      className="mt-2 py-2 px-4 bg-gray-100 text-center cursor-pointer hover:bg-gray-200 transition-colors rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDetails();
                      }}
                    >
                      <span className="text-sm font-medium text-gray-700 flex items-center justify-center">
                        {lang === 'tr' ? 'Detayları Göster' : 'Show Details'}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Mega Şehir İşaretçileri */}
          {MEGA_CITIES.map((city, i) => (
            <Marker
              key={i}
              position={city.coords as [number, number]}
              icon={createCityIcon(city)}
              eventHandlers={{
                click: () => {
                  handleMapClick(city.coords[0], city.coords[1]);
                  // Hava durumu verisi yüklendikten sonra detay panelini aç
                  setTimeout(() => setShowDetails(true), 1000);
                },
              }}
            >
              <Popup 
                className="rounded-xl shadow-xl"
                autoClose={false}
                maxWidth={180}
                offset={[0, -10]}
              >
                <div className={`p-3 text-center ${theme === 'dark' ? 'bg-dark-200 text-white' : 'bg-white text-gray-800'} rounded-xl flex flex-col items-center`}>
                  <h3 className="text-base font-semibold">
                    {lang === 'tr' ? city.name.tr : city.name.en}
                  </h3>
                  <span className="text-xs mt-1 opacity-70">{city.country}</span>
                  <button 
                    onClick={() => {
                      handleMapClick(city.coords[0], city.coords[1]);
                      setTimeout(() => setShowDetails(true), 1000); // 1 saniye bekleyip detayları göster
                    }}
                    className={`mt-2 px-2 py-1 text-xs rounded-md ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-blue-50 hover:bg-blue-100'} transition-colors`}
                  >
                    {lang === 'tr' ? 'Hava Durumunu Gör' : 'View Weather'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Konum Bul Butonu */}
        <div className="absolute bottom-5 right-5 z-[1000]">
          <button 
            className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} p-3 rounded-full shadow-button transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95`}
            onClick={handleLocationClick}
            aria-label={t.findMe}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        {/* Yakınlaştırma Kontrolleri */}
        <div className="absolute bottom-5 left-5 z-[1000] flex flex-col space-y-2">
          <button 
            className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} p-2 rounded-md shadow-button transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95`}
            onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} p-2 rounded-md shadow-button transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95`}
            onClick={() => setZoom(prev => Math.max(prev - 1, 3))}
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
        
        {/* Arama ve Ayarlar Bölümü */}
        <div className="absolute top-5 left-0 right-0 mx-4 z-[1000] flex items-center gap-2">
          {/* Arama Çubuğu */}
          <div 
            ref={searchRef}
            className="flex-1 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCity()}
              onFocus={() => setShowSearchResults(false)}
              placeholder={t.searchPlaceholderShort}
              className={`w-full px-4 py-2.5 ${currentTheme.inputBg} backdrop-blur-xl ${currentTheme.border} rounded-full ${currentTheme.text} shadow-button outline-none focus:border-gold-light focus:shadow-button-hover transition-all duration-300 ${theme === 'light' ? 'border border-gray-200 shadow' : ''}`}
              aria-label={t.searchPlaceholder}
            />
            
            <button
              onClick={searchCity}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} p-2 focus:outline-none rounded-full hover:bg-white/5 active:scale-95`}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Arama Sonuçları */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${currentTheme.secondary} backdrop-blur-xl ${currentTheme.border} rounded-2xl shadow-menu overflow-hidden max-h-60 overflow-y-auto scrollbar-custom animate-[fadeIn_0.3s]`}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`px-5 py-3 ${currentTheme.hover} cursor-pointer transition-colors duration-200 focus:${currentTheme.hover.replace('hover:', '')} focus:outline-none`}
                    onClick={() => handleCitySelect(result)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${result.name}, ${result.country}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySelect(result)}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>
                      {result.state ? `${result.state}, ` : ''}{result.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tema değiştirme butonu */}
          <button
            onClick={toggleTheme}
            className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} px-3 py-2.5 rounded-md shadow-button transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95`}
            aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Ayarlar Butonu */}
          <div ref={settingsMenuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.text} px-3 py-2.5 rounded-md shadow-button transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 active:scale-95`}
              aria-label="Settings"
              aria-expanded={showSettingsMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {/* Ayarlar Menüsü */}
            {showSettingsMenu && (
              <div className={`absolute top-full right-0 mt-2 ${currentTheme.secondary} backdrop-blur-xl ${currentTheme.border} rounded-lg shadow-menu overflow-hidden w-64 animate-[fadeIn_0.3s] ${currentTheme.text}`}>
                <div className={`p-3 border-b ${currentTheme.border}`}>
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{lang === 'tr' ? 'Ayarlar' : 'Settings'}</h3>
                </div>
                
                {/* Dil Ayarları */}
                <div className={`p-4 border-b ${currentTheme.border}`}>
                  <div className="mb-2 text-sm font-medium">{lang === 'tr' ? 'Dil' : 'Language'}</div>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 text-sm rounded ${lang === 'en' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setLang('en')}
                    >
                      English
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${lang === 'tr' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setLang('tr')}
                    >
                      Türkçe
                    </button>
                  </div>
                </div>
                
                {/* Sıcaklık Birimi Ayarları */}
                <div className={`p-4 border-b ${currentTheme.border}`}>
                  <div className="mb-2 text-sm font-medium">{t.temperature}</div>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1 text-sm rounded ${tempUnit === 'C' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setTempUnit('C')}
                    >
                      °C
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${tempUnit === 'F' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setTempUnit('F')}
                    >
                      °F
                    </button>
                  </div>
                </div>
                
                {/* Rüzgar Hızı Birimi Ayarları */}
                <div className={`p-4 border-b ${currentTheme.border}`}>
                  <div className="mb-2 text-sm font-medium">{t.wind}</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 text-sm rounded ${windUnit === 'ms' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setWindUnit('ms')}
                    >
                      m/s
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${windUnit === 'kph' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setWindUnit('kph')}
                    >
                      km/h
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${windUnit === 'knot' ? (theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-white/20') : (theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-dark-300 hover:bg-white/10')} transition-colors duration-200 focus:outline-none focus:bg-white/15`}
                      onClick={() => setWindUnit('knot')}
                    >
                      knot
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detay Overlay Paneli */}
      {selectedLocation && weatherData && (
        <div 
          className={`fixed bottom-0 left-0 right-0 z-[2000] transition-all duration-500 ease-in-out ${detailsPanelClass}`}
        >
          <div 
            className={`${currentTheme.secondary} backdrop-blur-md max-h-[80vh] overflow-y-auto shadow-2xl rounded-t-2xl`}
          >
            {/* Panel Başlığı */}
            <div className={`px-4 py-3 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} border-b flex items-center justify-between sticky top-0 ${currentTheme.secondary} backdrop-blur-xl z-10`}>
              <h2 className={`text-lg font-bold ${currentTheme.text}`}>
                {weatherData.name}, {weatherData.sys.country} {lang === 'tr' ? 'Detayları' : 'Details'}
              </h2>
              <button 
                onClick={toggleDetails}
                className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${theme === 'dark' ? 'text-white/80' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* WeatherDetails Bileşeni */}
            <WeatherDetails
              weatherData={weatherData}
              forecastData={forecastData}
              theme={theme}
              lang={lang}
              tempUnit={tempUnit}
              windUnit={windUnit}
              translations={translations}
            />
          </div>
          
          {/* Karartma Overlay - Dışarıya tıklanarak kapatılabilir */}
          <div 
            className="fixed inset-0 bg-black/50 z-[-1]" 
            onClick={toggleDetails}
          ></div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp; 