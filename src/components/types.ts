export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    country: string;
    sunrise?: number;
    sunset?: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
}

export interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
      temp_min: number;
      temp_max: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    dt_txt: string;
    clouds: {
      all: number;
    };
  }[];
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
  onMapClick: (lat: number, lng: number) => void;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
} 