import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Cloud, Droplets, Thermometer, Wind, Gauge } from 'lucide-react';
import { getLayerById } from '../lib/map-layers';

interface WeatherLegendProps {
  activeOverlays: string[];
}

export function WeatherLegend({ activeOverlays }: WeatherLegendProps) {
  if (activeOverlays.length === 0) return null;

  const legends: Record<string, { 
    icon: React.ReactNode; 
    title: string; 
    colors: { label: string; color: string }[] 
  }> = {
    precipitation: {
      icon: <Droplets className="size-4" />,
      title: 'Precipitación',
      colors: [
        { label: '0 mm', color: 'transparent' },
        { label: '0.1-0.5 mm', color: '#B3E5FF' },
        { label: '0.5-1 mm', color: '#4DB8FF' },
        { label: '1-2 mm', color: '#0099FF' },
        { label: '2-5 mm', color: '#0066CC' },
        { label: '>5 mm', color: '#003399' }
      ]
    },
    temperature: {
      icon: <Thermometer className="size-4" />,
      title: 'Temperatura',
      colors: [
        { label: '<-20°C', color: '#8B00FF' },
        { label: '-10°C', color: '#0000FF' },
        { label: '0°C', color: '#00FFFF' },
        { label: '10°C', color: '#00FF00' },
        { label: '20°C', color: '#FFFF00' },
        { label: '30°C', color: '#FF7F00' },
        { label: '>40°C', color: '#FF0000' }
      ]
    },
    wind: {
      icon: <Wind className="size-4" />,
      title: 'Viento',
      colors: [
        { label: '0-5 km/h', color: '#E0E0E0' },
        { label: '5-10 km/h', color: '#B3D9FF' },
        { label: '10-20 km/h', color: '#66B3FF' },
        { label: '20-40 km/h', color: '#3399FF' },
        { label: '>40 km/h', color: '#0066CC' }
      ]
    },
    clouds: {
      icon: <Cloud className="size-4" />,
      title: 'Cobertura de Nubes',
      colors: [
        { label: '0% (Despejado)', color: '#87CEEB' },
        { label: '25% (Poco nublado)', color: '#B0E0E6' },
        { label: '50% (Parcialmente nublado)', color: '#D3D3D3' },
        { label: '75% (Muy nublado)', color: '#A9A9A9' },
        { label: '100% (Cubierto)', color: '#696969' }
      ]
    },
    pressure: {
      icon: <Gauge className="size-4" />,
      title: 'Presión',
      colors: [
        { label: '<990 hPa', color: '#FF0000' },
        { label: '1000 hPa', color: '#FFFF00' },
        { label: '1013 hPa', color: '#00FF00' },
        { label: '>1030 hPa', color: '#0000FF' }
      ]
    }
  };

  const weatherOverlays = activeOverlays.filter(id => {
    const layer = getLayerById(id);
    return layer?.category === 'weather';
  });

  if (weatherOverlays.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 md:bottom-4 right-2 sm:right-4 z-30 space-y-2 max-w-[160px] sm:max-w-[180px] md:max-w-[200px] pointer-events-none hidden lg:block">
      {weatherOverlays.map(overlay => {
        const legend = legends[overlay];
        if (!legend) return null;

        return (
          <Card key={overlay} className="shadow-lg bg-black/95 backdrop-blur border-white/20 pointer-events-auto">
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                <div className="text-white">{legend.icon}</div>
                <span className="font-medium text-[10px] sm:text-xs text-white truncate">{legend.title}</span>
                <Badge variant="secondary" className="ml-auto text-[9px] sm:text-[10px] px-1 py-0 bg-white/10 text-white border-white/20 flex-shrink-0">
                  Activa
                </Badge>
              </div>
              <div className="space-y-0.5">
                {legend.colors.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]">
                    <div 
                      className="size-2.5 sm:size-3 rounded border border-white/20 flex-shrink-0"
                      style={{ 
                        backgroundColor: item.color,
                        border: item.color === 'transparent' ? '1px dashed rgba(255,255,255,0.3)' : undefined
                      }}
                    />
                    <span className="text-white/60 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
