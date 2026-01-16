import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Layers, Cloud, Mountain, BarChart3, X } from 'lucide-react';
import { MAP_LAYERS, type MapLayer } from '../lib/map-layers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';

interface MapLayersControlProps {
  activeBaseLayer: string;
  activeOverlays: string[];
  onBaseLayerChange: (layerId: string) => void;
  onOverlayToggle: (layerId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MapLayersControl({
  activeBaseLayer,
  activeOverlays,
  onBaseLayerChange,
  onOverlayToggle,
  open,
  onOpenChange,
}: MapLayersControlProps) {
  const [activeTab, setActiveTab] = useState<'base' | 'weather' | 'terrain' | 'data'>('base');
  
  const baseLayers = MAP_LAYERS.filter(l => l.category === 'base');
  const weatherLayers = MAP_LAYERS.filter(l => l.category === 'weather');
  const terrainLayers = MAP_LAYERS.filter(l => l.category === 'terrain' && l.type === 'overlay');
  const riskLayers = MAP_LAYERS.filter(l => l.category === 'risk');

  const renderLayerItem = (layer: MapLayer, isBase: boolean = false) => {
    const isActive = isBase 
      ? activeBaseLayer === layer.id 
      : activeOverlays.includes(layer.id);

    return (
      <div
        key={layer.id}
        className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
          isActive 
            ? 'bg-white/10 border-white/30 shadow-lg' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
        onClick={() => isBase ? onBaseLayerChange(layer.id) : onOverlayToggle(layer.id)}
      >
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`text-2xl p-2 rounded-lg flex-shrink-0 ${
              isActive ? 'bg-white/20' : 'bg-white/5'
            }`}>
              {layer.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-semibold text-white text-sm truncate">{layer.name}</h4>
                {isActive && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-white/20 text-white border-white/30 flex-shrink-0">
                    Activa
                  </Badge>
                )}
              </div>
              <p className="text-xs text-white/50 leading-relaxed break-words">
                {layer.description}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isBase ? (
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${
                  isActive 
                    ? 'bg-white text-black hover:bg-white/90 border-0' 
                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBaseLayerChange(layer.id);
                }}
              >
                {isActive ? 'Activo' : 'Usar'}
              </Button>
            ) : (
              <div 
                className={`w-10 h-6 rounded-full relative transition-all flex-shrink-0 ${
                  isActive ? 'bg-white' : 'bg-white/20'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOverlayToggle(layer.id);
                }}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                  isActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'base' as const, label: 'Mapa Base', icon: Layers },
    { id: 'weather' as const, label: 'Clima', icon: Cloud },
    { id: 'terrain' as const, label: 'Terreno', icon: Mountain },
    { id: 'data' as const, label: 'Datos', icon: BarChart3 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-[500px] bg-black border-white/10 p-0 overflow-hidden flex flex-col">
        <div className="flex flex-col h-full min-h-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-white text-xl font-bold truncate">Capas del Mapa</SheetTitle>
                  <SheetDescription className="text-white/50 text-sm">
                    Personaliza la visualización
                  </SheetDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Tabs */}
          <div className="px-6 pt-4 pb-4 border-b border-white/10 flex-shrink-0 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-6 py-6 space-y-4">
                {activeTab === 'base' && (
                  <div>
                    <p className="text-xs text-white/50 font-medium mb-3">Selecciona el mapa base</p>
                    <div className="space-y-2">
                      {baseLayers.map(layer => renderLayerItem(layer, true))}
                    </div>
                  </div>
                )}

                {activeTab === 'weather' && (
                  <div>
                    <p className="text-xs text-white/50 font-medium mb-3">Datos meteorológicos en tiempo real</p>
                    {weatherLayers.length > 0 ? (
                      <div className="space-y-2">
                        {weatherLayers.map(layer => renderLayerItem(layer, false))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/40">
                        <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No hay capas disponibles</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'terrain' && (
                  <div>
                    <p className="text-xs text-white/50 font-medium mb-3">Información topográfica y relieve</p>
                    {MAP_LAYERS.filter(l => l.id === 'terrain').map(layer => 
                      renderLayerItem(layer, true)
                    )}
                    <Separator className="my-4 bg-white/10" />
                    {terrainLayers.length > 0 ? (
                      <div className="space-y-2">
                        {terrainLayers.map(layer => renderLayerItem(layer, false))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/40">
                        <p className="text-xs">No hay capas adicionales disponibles</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'data' && (
                  <div>
                    <p className="text-xs text-white/50 font-medium mb-3">Capas de riesgo generadas automáticamente</p>
                    <div className="space-y-2">
                      {riskLayers.map(layer => renderLayerItem(layer, false))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
