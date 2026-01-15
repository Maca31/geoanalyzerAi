import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Info, Droplets, Flame, Mountain } from 'lucide-react';
import type { RiskData } from '../types/geo';

interface RiskLegendProps {
  activeRiskLayers: string[];
  riskData: RiskData | null;
}

export function RiskLegend({ activeRiskLayers, riskData }: RiskLegendProps) {
  if (activeRiskLayers.length === 0 || !riskData) return null;

  const riskLayers = [
    {
      id: 'flood_risk',
      name: 'Riesgo de Inundación',
      icon: <Droplets className="size-4" />,
      color: '#ffffff',
      level: riskData.floodRisk,
    },
    {
      id: 'fire_risk',
      name: 'Riesgo de Incendio',
      icon: <Flame className="size-4" />,
      color: '#cccccc',
      level: riskData.fireRisk,
    },
    {
      id: 'seismic_risk',
      name: 'Riesgo Sísmico',
      icon: <Mountain className="size-4" />,
      color: '#999999',
      level: riskData.seismicRisk,
    },
  ].filter(layer => activeRiskLayers.includes(layer.id));

  if (riskLayers.length === 0) return null;

  const getLevelBadge = (level: 'bajo' | 'medio' | 'alto') => {
    const variants = {
      bajo: { variant: 'default' as const, label: 'BAJO', className: 'bg-white/20 text-white border-white/30' },
      medio: { variant: 'secondary' as const, label: 'MEDIO', className: 'bg-white/30 text-white border-white/40' },
      alto: { variant: 'destructive' as const, label: 'ALTO', className: 'bg-white text-black border-white' },
    };
    const config = variants[level];
    return (
      <Badge variant={config.variant} className={`text-xs font-bold ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      <div className="text-xs text-white/60 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="size-4 text-white/60" />
          <span className="font-medium text-white">Leyenda de Riesgos Activos</span>
          <Badge variant="secondary" className="ml-auto text-xs bg-white/10 text-white border-white/20">
            {riskLayers.length} activa{riskLayers.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {riskLayers.map(layer => (
            <div key={layer.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="size-3 rounded-full border-2 border-white/30 shadow-sm"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-xs font-medium flex-1 text-white">{layer.name}</span>
                {getLevelBadge(layer.level)}
              </div>
              <div className="pl-5">
                <p className="text-[10px] text-white/50">
                  {layer.level === 'alto' && '⚠️ Precaución necesaria'}
                  {layer.level === 'medio' && '⚡ Monitoreo recomendado'}
                  {layer.level === 'bajo' && '✓ Condiciones normales'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-[10px] text-white/50 mt-3 pt-3 border-t border-white/10">
          Los círculos de color en el mapa muestran el área de influencia del riesgo. Haz clic en ellos para más detalles.
        </p>
      </div>
    </div>
  );
}
