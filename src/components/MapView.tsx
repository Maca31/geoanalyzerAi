import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getLayerById } from '../lib/map-layers';
import type { RiskData } from '../types/geo';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  onMapClick?: (lat: number, lon: number) => void;
  marker?: { lat: number; lon: number } | null;
  baseLayer?: string;
  activeOverlays?: string[];
  riskData?: RiskData | null;
}

export function MapView({ 
  center, 
  zoom, 
  onMapClick, 
  marker,
  baseLayer = 'osm',
  activeOverlays = [],
  riskData = null,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayersRef = useRef<Map<string, L.Layer>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);

    const layerConfig = getLayerById(baseLayer);
    if (layerConfig?.url) {
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution || '',
        maxZoom: 19
      }).addTo(map);
      baseLayerRef.current = tileLayer;
    }

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (baseLayerRef.current) {
      mapRef.current.removeLayer(baseLayerRef.current);
    }

    const layerConfig = getLayerById(baseLayer);
    if (layerConfig?.url) {
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution || '',
        maxZoom: 19
      }).addTo(mapRef.current);
      baseLayerRef.current = tileLayer;
    }
  }, [baseLayer]);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentLayers = overlayLayersRef.current;
    const newOverlays = new Set(activeOverlays);

    currentLayers.forEach((layer, layerId) => {
      if (!newOverlays.has(layerId)) {
        try {
          mapRef.current!.removeLayer(layer);
        } catch (error) {
          console.warn(`Error removiendo capa ${layerId}:`, error);
        }
        currentLayers.delete(layerId);
      }
    });

    activeOverlays.forEach((layerId) => {
      const layerConfig = getLayerById(layerId);
      
      if (layerConfig?.category === 'risk') {
        if (currentLayers.has(layerId)) {
          try {
            mapRef.current!.removeLayer(currentLayers.get(layerId)!);
            currentLayers.delete(layerId);
          } catch (error) {
            console.warn(`Error removiendo círculo de riesgo ${layerId}:`, error);
          }
        }
        
        if (marker && riskData) {
          const circle = createRiskCircle(layerId, marker, riskData);
          if (circle) {
            circle.addTo(mapRef.current!);
            currentLayers.set(layerId, circle);
          }
        }
        return;
      }

      if (!currentLayers.has(layerId) && layerConfig?.url && layerConfig.type === 'overlay') {
        const tileLayer = L.tileLayer(layerConfig.url, {
          attribution: layerConfig.attribution || '',
          opacity: layerConfig.opacity || 1,
          maxZoom: 19,
        }).addTo(mapRef.current!);
        currentLayers.set(layerId, tileLayer);
      }
    });
  }, [activeOverlays, marker, riskData, zoom]);

  useEffect(() => {
    if (!mapRef.current || !marker || !riskData) return;

    const currentLayers = overlayLayersRef.current;
    const riskLayerIds = activeOverlays.filter(id => {
      const layer = getLayerById(id);
      return layer?.category === 'risk';
    });

    riskLayerIds.forEach(layerId => {
      if (currentLayers.has(layerId)) {
        try {
          mapRef.current!.removeLayer(currentLayers.get(layerId)!);
          currentLayers.delete(layerId);
          
          const circle = createRiskCircle(layerId, marker, riskData);
          if (circle) {
            circle.addTo(mapRef.current!);
            currentLayers.set(layerId, circle);
          }
        } catch (error) {
          console.warn(`Error actualizando círculo ${layerId}:`, error);
        }
      }
    });
  }, [zoom, marker, riskData, activeOverlays]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (marker) {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6));
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Outer shadow circle -->
              <circle cx="12" cy="12" r="11" fill="#000000" opacity="0.3"/>
              <!-- Main pin shape with vibrant red -->
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5"/>
              <!-- Inner white circle for contrast -->
              <circle cx="12" cy="9" r="3.5" fill="#FFFFFF" stroke="#EF4444" stroke-width="1"/>
              <!-- Center dot -->
              <circle cx="12" cy="9" r="1.5" fill="#EF4444"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      markerRef.current = L.marker([marker.lat, marker.lon], {
        icon: customIcon
      }).addTo(mapRef.current);

      markerRef.current.bindPopup(`
        <div style="
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 10px 12px;
          max-width: 280px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          ">
            <span style="font-size: 16px;">📍</span>
            <strong style="
              color: #ffffff;
              font-size: 13px;
              font-weight: 500;
              letter-spacing: -0.01em;
            ">Ubicación seleccionada</strong>
          </div>
          <div style="
            color: rgba(255, 255, 255, 0.6);
            font-size: 11px;
            font-family: 'Monaco', 'Menlo', monospace;
            line-height: 1.6;
            letter-spacing: 0.02em;
          ">
            Lat: ${marker.lat.toFixed(6)}<br/>
            Lon: ${marker.lon.toFixed(6)}
          </div>
        </div>
      `, {
        maxWidth: 300,
        offset: [0, -30],
        autoPan: true,
        autoPanPadding: [80, 80],
        closeOnClick: false,
        className: 'custom-popup'
      }).openPopup();
    }
  }, [marker]);

  const createRiskCircle = (
    layerId: string,
    marker: { lat: number; lon: number },
    risk: RiskData,
  ): L.Circle | null => {
    if (!mapRef.current) return null;
    
    const currentZoom = mapRef.current.getZoom();
    const zoomFactor = Math.max(0.3, Math.min(1.2, 18 / currentZoom));
    const baseRadius = 800 * zoomFactor;

    const levelToRadius = (level: 'bajo' | 'medio' | 'alto') => {
      if (level === 'alto') return baseRadius * 1.5;
      if (level === 'medio') return baseRadius * 1.2;
      return baseRadius;
    };

    let color = '#ffffff';
    let fillColor = '#cccccc';
    let radius = baseRadius;
    let tooltip = 'Riesgo';

    if (layerId === 'flood_risk') {
      radius = levelToRadius(risk.floodRisk);
      color = '#ffffff';
      fillColor = risk.floodRisk === 'alto' ? '#ffffff' : risk.floodRisk === 'medio' ? '#cccccc' : '#999999';
      tooltip = `Riesgo de inundación: ${risk.floodRisk.toUpperCase()}`;
    } else if (layerId === 'fire_risk') {
      radius = levelToRadius(risk.fireRisk);
      color = '#ffffff';
      fillColor = risk.fireRisk === 'alto' ? '#ffffff' : risk.fireRisk === 'medio' ? '#cccccc' : '#999999';
      tooltip = `Riesgo de incendio: ${risk.fireRisk.toUpperCase()}`;
    } else if (layerId === 'seismic_risk') {
      radius = levelToRadius(risk.seismicRisk);
      color = '#ffffff';
      fillColor = risk.seismicRisk === 'alto' ? '#ffffff' : risk.seismicRisk === 'medio' ? '#cccccc' : '#999999';
      tooltip = `Riesgo sísmico: ${risk.seismicRisk.toUpperCase()}`;
    }

    const circle = L.circle([marker.lat, marker.lon], {
      radius,
      color,
      fillColor,
      fillOpacity: 0.35,
      weight: 2.5,
      interactive: true,
      bubblingMouseEvents: false,
    });

    const riskLevel = layerId === 'flood_risk' ? risk.floodRisk 
      : layerId === 'fire_risk' ? risk.fireRisk 
      : risk.seismicRisk;
    
    const riskDescription = riskLevel === 'alto' ? '⚠️ RIESGO ALTO - Precaución necesaria'
      : riskLevel === 'medio' ? '⚡ RIESGO MEDIO - Monitoreo recomendado'
      : '✓ RIESGO BAJO - Condiciones normales';

    circle.bindTooltip(
      `<div style="font-family: system-ui; padding: 4px; text-align: center;">
        <strong>${tooltip}</strong><br/>
        ${riskDescription}<br/>
        <small>Radio: ${Math.round(radius)}m | Basado en datos de elevación y clima</small>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        className: 'risk-tooltip',
      },
    );

    circle.bindPopup(
      `<div style="font-family: system-ui; padding: 8px; max-width: 250px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${tooltip}</h4>
        <p style="margin: 4px 0; font-size: 12px;">${riskDescription}</p>
        <p style="margin: 4px 0; font-size: 11px; color: #666;">
          Esta visualización muestra el área de influencia del riesgo basado en:
          <ul style="margin: 4px 0; padding-left: 16px; font-size: 11px;">
            <li>Elevación del terreno</li>
            <li>Datos climáticos recientes</li>
            <li>Análisis geográfico de la zona</li>
          </ul>
        </p>
        <p style="margin: 4px 0; font-size: 10px; color: #999;">
          Radio de análisis: ${Math.round(radius)} metros
        </p>
      </div>`,
      {
        maxWidth: 300,
      }
    );

    return circle;
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden border-2 border-border relative z-0"
      style={{ minHeight: '400px' }}
    />
  );
}
