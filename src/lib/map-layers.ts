import { MapLayer } from '../types/geo';

// OpenWeatherMap API key (optional)
const OPENWEATHER_API_KEY =
  (import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined) || '';

export const MAP_LAYERS: MapLayer[] = [
  // Mapas base
  {
    id: 'osm',
    name: 'OpenStreetMap',
    description: 'Mapa estándar de calles',
    type: 'tile',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    category: 'base',
    icon: '🗺️',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'satellite',
    name: 'Satélite',
    description: 'Vista satelital de alta resolución',
    type: 'tile',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    category: 'base',
    icon: '🛰️',
    attribution: '© ESRI World Imagery'
  },
  {
    id: 'terrain',
    name: 'Terreno',
    description: 'Mapa topográfico con relieve',
    type: 'tile',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    category: 'base',
    icon: '⛰️',
    attribution: '© OpenTopoMap'
  },
  {
    id: 'dark',
    name: 'Modo Oscuro',
    description: 'Mapa con estilo oscuro',
    type: 'tile',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    category: 'base',
    icon: '🌙',
    attribution: '© CartoDB Dark'
  },
  
  // Capas meteorológicas (OpenWeatherMap) - solo si hay API key
  ...(OPENWEATHER_API_KEY ? [
    {
      id: 'precipitation',
      name: 'Precipitación',
      description: 'Lluvia en tiempo real',
      type: 'overlay' as const,
      url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.6,
      category: 'weather' as const,
      icon: '🌧️',
      attribution: '© OpenWeatherMap'
    },
    {
      id: 'clouds',
      name: 'Nubes',
      description: 'Cobertura de nubes',
      type: 'overlay' as const,
      url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.5,
      category: 'weather' as const,
      icon: '☁️',
      attribution: '© OpenWeatherMap'
    },
    {
      id: 'temperature',
      name: 'Temperatura',
      description: 'Temperatura en superficie',
      type: 'overlay' as const,
      url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.6,
      category: 'weather' as const,
      icon: '🌡️',
      attribution: '© OpenWeatherMap'
    },
    {
      id: 'wind',
      name: 'Viento',
      description: 'Velocidad del viento',
      type: 'overlay' as const,
      url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.5,
      category: 'weather' as const,
      icon: '💨',
      attribution: '© OpenWeatherMap'
    },
    {
      id: 'pressure',
      name: 'Presión',
      description: 'Presión atmosférica',
      type: 'overlay' as const,
      url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
      opacity: 0.6,
      category: 'weather' as const,
      icon: '🔽',
      attribution: '© OpenWeatherMap'
    }
  ] : []),
  
  // Capas de terreno y relieve
  {
    id: 'hillshade',
    name: 'Sombreado de Relieve',
    description: 'Visualización 3D del terreno',
    type: 'overlay',
    url: 'https://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
    opacity: 0.8,
    category: 'terrain',
    icon: '🏔️',
    attribution: '© Wikimedia hillshading'
  },
  {
    id: 'landcover',
    name: 'Uso del Suelo (OSM HOT)',
    description: 'Mapa humanitario de OpenStreetMap con énfasis en urbanismo',
    type: 'overlay',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    opacity: 0.6,
    category: 'terrain',
    icon: '🏙️',
    attribution: '© OpenStreetMap France, Humanitarian OSM Team'
  },
  
  // Capas de riesgo
  {
    id: 'flood_risk',
    name: 'Riesgo de Inundación',
    description: 'Zonas propensas a inundaciones',
    type: 'data',
    category: 'risk',
    icon: '🌊',
    attribution: 'Datos estimados'
  },
  {
    id: 'fire_risk',
    name: 'Riesgo de Incendio',
    description: 'Áreas vulnerables a incendios',
    type: 'data',
    category: 'risk',
    icon: '🔥',
    attribution: 'Datos estimados'
  },
  {
    id: 'seismic_risk',
    name: 'Riesgo Sísmico',
    description: 'Zonas de actividad sísmica',
    type: 'data',
    category: 'risk',
    icon: '🌋',
    attribution: 'Datos estimados'
  },
  
  // Capas de datos geográficos
  {
    id: 'air_quality',
    name: 'Calidad del Aire',
    description: 'Índice de calidad del aire',
    type: 'data',
    category: 'data',
    icon: '💨',
    attribution: 'OpenAQ'
  },
  {
    id: 'land_use',
    name: 'Uso del Suelo',
    description: 'Clasificación de zonas',
    type: 'data',
    category: 'data',
    icon: '🏘️',
    attribution: 'OSM'
  }
];

export const getLayersByCategory = (category: string) => {
  return MAP_LAYERS.filter(layer => layer.category === category);
};

export const getLayerById = (id: string) => {
  return MAP_LAYERS.find(layer => layer.id === id);
};
