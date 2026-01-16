import { Badge } from './ui/badge';
import { Shield, Droplets, Flame, Mountain, AlertTriangle, Activity, CheckCircle } from 'lucide-react';
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
      shortName: 'Inundación',
      icon: <Droplets className="size-4" />,
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      level: riskData.floodRisk,
    },
    {
      id: 'fire_risk',
      name: 'Riesgo de Incendio',
      shortName: 'Incendio',
      icon: <Flame className="size-4" />,
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      level: riskData.fireRisk,
    },
    {
      id: 'seismic_risk',
      name: 'Riesgo Sísmico',
      shortName: 'Sísmico',
      icon: <Mountain className="size-4" />,
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-yellow-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      level: riskData.seismicRisk,
    },
  ].filter(layer => activeRiskLayers.includes(layer.id));

  if (riskLayers.length === 0) return null;

  const getLevelConfig = (level: 'bajo' | 'medio' | 'alto') => {
    const configs = {
      bajo: { 
        label: 'BAJO',
        icon: <CheckCircle className="size-3" />,
        message: 'Condiciones normales',
        bgClass: 'bg-emerald-500/20',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500/30',
      },
      medio: { 
        label: 'MEDIO',
        icon: <Activity className="size-3" />,
        message: 'Monitoreo recomendado',
        bgClass: 'bg-amber-500/20',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
      },
      alto: { 
        label: 'ALTO',
        icon: <AlertTriangle className="size-3" />,
        message: 'Precaución necesaria',
        bgClass: 'bg-red-500/20',
        textClass: 'text-red-400',
        borderClass: 'border-red-500/30',
      },
    };
    return configs[level];
  };

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <Shield className="size-4 text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-white">Análisis de Riesgos</h4>
          <p className="text-[10px] text-white/40">{riskLayers.length} capa{riskLayers.length > 1 ? 's' : ''} activa{riskLayers.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      
      {/* Risk cards */}
      <div className="space-y-2">
        {riskLayers.map(layer => {
          const levelConfig = getLevelConfig(layer.level);
          
          return (
            <div 
              key={layer.id} 
              className={`p-3 rounded-xl ${layer.bgColor} border ${layer.borderColor} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${layer.gradientFrom} ${layer.gradientTo} flex items-center justify-center shadow-md`}>
                    <span className="text-white">{layer.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{layer.shortName}</span>
                </div>
                <Badge 
                  className={`${levelConfig.bgClass} ${levelConfig.textClass} ${levelConfig.borderClass} border text-[10px] font-bold px-2 py-0.5`}
                >
                  {levelConfig.label}
                </Badge>
              </div>
              
              <div className={`flex items-center gap-1.5 ${levelConfig.textClass}`}>
                {levelConfig.icon}
                <span className="text-[10px] font-medium">{levelConfig.message}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Info footer */}
      <div className="pt-2 border-t border-white/5">
        <p className="text-[10px] text-white/40 leading-relaxed">
          Los círculos en el mapa indican el área de influencia. Haz clic para más detalles.
        </p>
      </div>
    </div>
  );
}
