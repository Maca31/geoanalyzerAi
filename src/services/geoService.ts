import { UrbanData, RiskData, AirQualityData, POI } from '../types/geo';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Robust list of Overpass instances
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

// OpenAQ for air quality data (free tier, no API key required)
const OPENAQ_BASE = 'https://api.openaq.org/v2/latest';

// Simple in-memory cache
const locationCache = new Map<string, { lat: number; lon: number; display_name: string }>();
const urbanDataCache = new Map<string, UrbanData>();

// Calculate distance between two lat/lon points in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Helper to simplify Overpass elements, calculate distance
const simplifyElements = (elements: any[], centerLat: number, centerLon: number, limit: number = 20): POI[] => {
  if (!elements || elements.length === 0) return [];

  const processed = elements.map((e: any) => {
    const elLat = e.lat || (e.center && e.center.lat);
    const elLon = e.lon || (e.center && e.center.lon);
    
    let dist = 0;
    if (elLat && elLon) {
      dist = getDistanceFromLatLonInM(centerLat, centerLon, elLat, elLon);
    }

    const name = e.tags?.name || e.tags?.brand || e.tags?.operator || e.tags?.description;
    const type = e.tags?.amenity || e.tags?.shop || e.tags?.leisure || e.tags?.man_made || e.tags?.natural || e.tags?.building || e.tags?.highway || e.tags?.landuse || e.tags?.power || "Punto de Interés";

    return {
      name: name || `[${type}]`,
      type: type,
      distMeters: dist,
      lat: elLat,
      lon: elLon
    };
  })
  .filter(e => e.distMeters <= 2500)
  .sort((a, b) => a.distMeters - b.distMeters);

  return processed.slice(0, limit);
};

async function fetchOverpass(query: string, timeoutMs: number = 10000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal
      });

      if (response.ok) {
        clearTimeout(timeoutId);
        return await response.json();
      }
    } catch (e) {
      // Try next endpoint
    }
  }
  
  clearTimeout(timeoutId);
  return null;
}

export async function searchCoordinates(address: string): Promise<{ lat: number; lon: number; display_name: string }> {
  // Check cache first
  if (locationCache.has(address)) {
    return locationCache.get(address)!;
  }

  try {
    const response = await fetch(`${NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: { 'User-Agent': 'GeoAnalyzerAI/1.0' }
    });
    
    if (!response.ok) throw new Error('Fallo en API Nominatim');
    
    const data = await response.json();
    if (!data || data.length === 0) throw new Error('Ubicación no encontrada');
    
    const result = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };

    // Cache the result
    locationCache.set(address, result);
    return result;
  } catch (error: any) {
    console.error("GeoService Search Error:", error);
    throw new Error(error.message === 'Ubicación no encontrada' ? 'Ubicación no encontrada' : 'No se pudieron obtener las coordenadas');
  }
}

export async function fetchUrbanLayer(lat: number, lon: number, radius: number = 1000): Promise<UrbanData> {
  // Check cache first
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (urbanDataCache.has(cacheKey)) {
    return urbanDataCache.get(cacheKey)!;
  }

  const r = Math.min(radius, 800); 
  
  const fastQuery = `
    [out:json][timeout:8];
    (
      node["amenity"~"hospital|school|pharmacy|restaurant|cafe|fuel"](around:${r},${lat},${lon});
      node["shop"~"supermarket|convenience"](around:${r},${lat},${lon});
      node["leisure"~"park"](around:${r},${lat},${lon});
      node["highway"="bus_stop"](around:${r},${lat},${lon});
      way["landuse"="industrial"](around:1200,${lat},${lon});
    );
    out center;
  `;

  let data = await fetchOverpass(fastQuery, 8000);
  
  if (!data || !data.elements || data.elements.length === 0) {
    const emptyResult: UrbanData = { 
      hospitals: [], 
      schools: [], 
      pharmacies: [], 
      shops: [], 
      transport: [], 
      industry: [], 
      pollution: [] 
    };
    urbanDataCache.set(cacheKey, emptyResult);
    return emptyResult;
  }

  const elements = data.elements || [];

  const result: UrbanData = {
    hospitals: simplifyElements(elements.filter((e: any) => e.tags?.amenity && /hospital|clinic|pharmacy|doctors/.test(e.tags.amenity)), lat, lon, 12),
    schools: simplifyElements(elements.filter((e: any) => e.tags?.amenity && /school|university|kindergarten|college/.test(e.tags.amenity)), lat, lon, 10),
    pharmacies: simplifyElements(elements.filter((e: any) => e.tags?.amenity === 'pharmacy'), lat, lon, 8), 
    shops: simplifyElements(elements.filter((e: any) => e.tags?.shop || /cafe|restaurant|bar|fuel/.test(e.tags?.amenity)), lat, lon, 15),
    transport: simplifyElements(elements.filter((e: any) => e.tags?.highway === 'bus_stop' || e.tags?.railway), lat, lon, 10),
    industry: simplifyElements(elements.filter((e: any) => e.tags?.landuse === 'industrial'), lat, lon, 8),
    pollution: simplifyElements(elements.filter((e: any) => e.tags?.amenity === 'fuel' || e.tags?.landuse === 'industrial'), lat, lon, 12),
  };

  // Cache result
  urbanDataCache.set(cacheKey, result);
  return result;
}

export async function analyzeFloodRisk(lat: number, lon: number): Promise<RiskData> {
  // Ultra-fast flood query
  const query = `
    [out:json][timeout:6];
    node["waterway"~"river|stream"](around:800,${lat},${lon});
    out;
  `;

  try {
    const data = await fetchOverpass(query, 6000);
    if (!data || !data.elements?.length) {
      return { 
        level: 'BAJO', 
        waterBodiesCount: 0, 
        details: ['No se detectaron cuerpos de agua en 800m'],
        floodRisk: 'bajo',
        seismicRisk: 'bajo',
        fireRisk: 'bajo'
      };
    }

    const count = data.elements.length;
    let level: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
    let floodRisk: 'bajo' | 'medio' | 'alto' = 'bajo';
    
    if (count >= 5) {
      level = 'ALTO';
      floodRisk = 'alto';
    } else if (count >= 2) {
      level = 'MEDIO';
      floodRisk = 'medio';
    }

    const details = data.elements.slice(0, 5).map((e: any) => {
       const dist = (e.lat && e.lon) ? getDistanceFromLatLonInM(lat, lon, e.lat, e.lon) : 0;
       const type = e.tags?.waterway || "Agua";
       const name = e.tags?.name || "Cuerpo de agua";
       return `${name} (${type}, a ${dist}m)`;
    });

    // Evaluate seismic and fire risk (simplified)
    const seismicRisk = evaluateSeismicRisk(lat, lon);
    const fireRisk = evaluateFireRisk(lat, lon);

    return {
      level,
      waterBodiesCount: count,
      details: details.length > 0 ? details : ['Riesgo bajo de inundación'],
      floodRisk,
      seismicRisk,
      fireRisk
    };
  } catch (error) {
    console.error("Risk Analysis Error:", error);
    return { 
      level: 'BAJO', 
      waterBodiesCount: 0, 
      details: ['Análisis fallido'],
      floodRisk: 'bajo',
      seismicRisk: 'bajo',
      fireRisk: 'bajo'
    };
  }
}

function evaluateSeismicRisk(lat: number, lon: number): 'bajo' | 'medio' | 'alto' {
  // Zonas sísmicas conocidas (simplificado)
  if (lat > 36 && lat < 38 && lon > -5 && lon < 0) return 'medio';
  if (lat > 35 && lat < 45 && lon > -10 && lon < 20) return 'medio';
  return 'bajo';
}

function evaluateFireRisk(lat: number, lon: number): 'bajo' | 'medio' | 'alto' {
  // Simplified fire risk evaluation
  // Could be enhanced with climate data
  return 'medio';
}

/**
 * Fetch air quality data from OpenAQ (free, no API key required)
 */
export async function fetchAirQualityData(lat: number, lon: number): Promise<AirQualityData> {
  try {
    const response = await fetch(
      `${OPENAQ_BASE}?coordinates=${lat},${lon}&radius=10000&limit=10`,
      {
        headers: {
          'User-Agent': 'GeoAnalyzerAI/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('OpenAQ API failed');
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return {
        aqi: null,
        level: 'DESCONOCIDA',
        pollutants: null,
        source: 'No hay datos disponibles en OpenAQ para esta ubicación'
      };
    }

    const result = data.results[0];
    const aqi = result.aqi;
    
    let level: 'EXCELENTE' | 'BUENA' | 'REGULAR' | 'MALA' | 'CRÍTICA' | 'DESCONOCIDA' = 'DESCONOCIDA';
    
    if (aqi !== null) {
      if (aqi <= 50) level = 'EXCELENTE';
      else if (aqi <= 100) level = 'BUENA';
      else if (aqi <= 150) level = 'REGULAR';
      else if (aqi <= 200) level = 'MALA';
      else level = 'CRÍTICA';
    }

    return {
      aqi: aqi,
      level: level,
      pollutants: result.measurements || null,
      source: `Medición de ${result.city || 'estación cercana'} - OpenAQ`
    };
  } catch (error) {
    console.error("Air Quality Fetch Error:", error);
    return {
      aqi: null,
      level: 'DESCONOCIDA',
      pollutants: null,
      source: 'Error al obtener datos de calidad del aire'
    };
  }
}
