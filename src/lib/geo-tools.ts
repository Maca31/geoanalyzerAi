import { Coordinates, InfrastructureData, RiskData, UrbanismData } from '../types/geo';

/**
 * Busca coordenadas a partir de una dirección usando Nominatim (OpenStreetMap)
 */
export async function buscarCoordenadas(direccion: string): Promise<{ lat: number; lon: number; display_name: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`,
      {
        headers: {
          'User-Agent': 'GeoAnalysisApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error buscando coordenadas:', error);
    return null;
  }
}

/**
 * Obtiene información de infraestructura cercana usando Overpass API
 */
export async function capasUrbanismo(lat: number, lon: number): Promise<InfrastructureData & UrbanismData> {
  try {
    // Radio de búsqueda en metros
    const radius = 1000;
    
    // Query Overpass para obtener infraestructura
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="school"](around:${radius},${lat},${lon});
        node["leisure"="park"](around:${radius},${lat},${lon});
        node["shop"](around:${radius},${lat},${lon});
        node["public_transport"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="school"](around:${radius},${lat},${lon});
        way["leisure"="park"](around:${radius},${lat},${lon});
        way["shop"](around:${radius},${lat},${lon});
        way["public_transport"](around:${radius},${lat},${lon});
      );
      out count;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    
    const data = await response.json();
    
    // Contar elementos por tipo
    let hospitals = 0;
    let schools = 0;
    let parks = 0;
    let commerce = 0;
    let transport = 0;
    
    if (data.elements) {
      data.elements.forEach((element: any) => {
        if (element.tags) {
          if (element.tags.amenity === 'hospital') hospitals++;
          if (element.tags.amenity === 'school') schools++;
          if (element.tags.leisure === 'park') parks++;
          if (element.tags.shop) commerce++;
          if (element.tags.public_transport) transport++;
        }
      });
    }
    
    // Obtener información de uso del suelo
    const reverseGeocode = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GeoAnalysisApp/1.0'
        }
      }
    );
    
    const geoData = await reverseGeocode.json();
    
    const landUse: string[] = [];
    if (geoData.address) {
      if (geoData.address.residential) landUse.push('Residencial');
      if (geoData.address.commercial) landUse.push('Comercial');
      if (geoData.address.industrial) landUse.push('Industrial');
      if (geoData.address.retail) landUse.push('Comercio minorista');
    }
    
    if (landUse.length === 0) {
      landUse.push('Mixto');
    }
    
    return {
      hospitals,
      schools,
      parks,
      commerce,
      transport,
      landUse,
      zoning: determineZoning(hospitals, schools, parks, commerce),
      population: 'Estimada según densidad urbana',
      density: commerce > 10 ? 'Alta' : commerce > 5 ? 'Media' : 'Baja'
    };
  } catch (error) {
    console.error('Error obteniendo capas de urbanismo:', error);
    return {
      hospitals: 0,
      schools: 0,
      parks: 0,
      commerce: 0,
      transport: 0,
      landUse: ['Desconocido'],
      zoning: 'Sin clasificar',
      population: 'No disponible',
      density: 'No disponible'
    };
  }
}

/**
 * Evalúa el riesgo de inundación basado en datos topográficos y climáticos
 */
export async function riesgoInundacion(lat: number, lon: number): Promise<RiskData> {
  try {
    // Obtener elevación usando Open-Elevation API
    const elevationResponse = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
    );
    
    const elevationData = await elevationResponse.json();
    const elevation = elevationData.results?.[0]?.elevation || 0;
    
    // Obtener datos climáticos
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&past_days=30`
    );
    
    const weatherData = await weatherResponse.json();
    const precipitation = weatherData.current?.precipitation || 0;
    
    // Evaluar riesgos
    const floodRisk = evaluateFloodRisk(elevation, precipitation);
    const seismicRisk = evaluateSeismicRisk(lat, lon);
    const fireRisk = evaluateFireRisk(precipitation);
    
    let details = `Evaluación basada en:\n`;
    details += `- Elevación: ${elevation.toFixed(1)}m sobre el nivel del mar\n`;
    details += `- Precipitación reciente: ${precipitation}mm\n`;
    details += `- Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}\n\n`;
    
    if (floodRisk === 'alto') {
      details += '⚠️ Zona baja con potencial riesgo de inundación.\n';
    }
    if (seismicRisk === 'alto' || seismicRisk === 'medio') {
      details += '⚠️ Zona con actividad sísmica registrada.\n';
    }
    if (fireRisk === 'alto') {
      details += '⚠️ Condiciones secas que incrementan riesgo de incendio.\n';
    }
    
    return {
      level: floodRisk === 'alto' ? 'ALTO' : floodRisk === 'medio' ? 'MEDIO' : 'BAJO',
      waterBodiesCount: 0,
      details: [details],
      floodRisk,
      seismicRisk,
      fireRisk
    };
  } catch (error) {
    console.error('Error evaluando riesgos:', error);
    return {
      level: 'BAJO',
      waterBodiesCount: 0,
      details: ['Error al obtener datos de riesgo. Se asume riesgo medio por precaución.'],
      floodRisk: 'medio',
      seismicRisk: 'bajo',
      fireRisk: 'bajo'
    };
  }
}

// Funciones auxiliares
function determineZoning(hospitals: number, schools: number, parks: number, commerce: number): string {
  if (commerce > 15) return 'Zona comercial';
  if (schools > 5) return 'Zona educativa';
  if (hospitals > 2) return 'Zona sanitaria';
  if (parks > 5) return 'Zona verde/recreativa';
  return 'Zona residencial mixta';
}

function evaluateFloodRisk(elevation: number, precipitation: number): 'bajo' | 'medio' | 'alto' {
  if (elevation < 10 && precipitation > 50) return 'alto';
  if (elevation < 50 || precipitation > 30) return 'medio';
  return 'bajo';
}

function evaluateSeismicRisk(lat: number, lon: number): 'bajo' | 'medio' | 'alto' {
  // Zonas sísmicas conocidas (simplificado)
  // España: Sur (Granada, Murcia) tiene más riesgo
  if (lat > 36 && lat < 38 && lon > -5 && lon < 0) return 'medio';
  // Zona mediterránea
  if (lat > 35 && lat < 45 && lon > -10 && lon < 20) return 'medio';
  return 'bajo';
}

function evaluateFireRisk(precipitation: number): 'bajo' | 'medio' | 'alto' {
  if (precipitation < 5) return 'alto';
  if (precipitation < 20) return 'medio';
  return 'bajo';
}
