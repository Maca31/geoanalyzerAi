import { useState } from 'react';
import { MapView } from './components/MapView';
import { SearchBar } from './components/SearchBar';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { WelcomePanel } from './components/WelcomePanel';
import { SavedLocations } from './components/SavedLocations';
import { MapLayersControl } from './components/MapLayersControl';
import { WeatherLegend } from './components/WeatherLegend';
import { RiskLegend } from './components/RiskLegend';
import { LandingPage } from './components/LandingPage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { MapPin, Sparkles, History, Layers, Globe, Menu, X, Search } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './components/ui/sheet';
import { Separator } from './components/ui/separator';
import { analyzeLocation as performAnalysis } from './lib/ai-analyzer';
import { riesgoInundacion } from './lib/geo-tools';
import { getLayerById } from './lib/map-layers';
import type { RiskData } from './types/geo';

interface AnalysisResult {
  report: string;
  coordinates: { lat: number; lon: number };
  address?: string;
  timestamp: string;
}

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]);
  const [mapZoom, setMapZoom] = useState(6);
  const [marker, setMarker] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<AnalysisResult | null>(null);
  const [savedLocationsSheetOpen, setSavedLocationsSheetOpen] = useState(false);
  const [layersSheetOpen, setLayersSheetOpen] = useState(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para el sistema de capas
  const [baseLayer, setBaseLayer] = useState<string>('osm');
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);

  // Función para buscar coordenadas desde una dirección
  const handleSearch = async (address: string) => {
    setSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'GeoAnalysisApp/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setMarker({ lat: latitude, lon: longitude });

        toast.success('Ubicación encontrada', {
          description: display_name
        });

        await analyzeLocation(latitude, longitude, display_name);
      } else {
        toast.error('No se encontró la ubicación', {
          description: 'Intenta con una dirección más específica'
        });
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      toast.error('Error en la búsqueda', {
        description: 'No se pudo conectar con el servicio de geocodificación'
      });
    } finally {
      setSearching(false);
    }
  };

  // Función para manejar clics en el mapa
  const handleMapClick = async (lat: number, lon: number) => {
    setMarker({ lat, lon });
    setMapCenter([lat, lon]);
    setMapZoom(14);

    toast.info('Ubicación seleccionada', {
      description: `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'GeoAnalysisApp/1.0'
          }
        }
      );

      const data = await response.json();
      const address = data.display_name || undefined;

      await analyzeLocation(lat, lon, address);
    } catch (error) {
      await analyzeLocation(lat, lon);
    }
  };

  // Función para analizar una ubicación
  const analyzeLocation = async (lat: number, lon: number, address?: string) => {
    setLoading(true);
    setComparisonResult((prev) => analysisResult || prev);
    setAnalysisResult(null);

    try {
      const [report, risks] = await Promise.all([
        performAnalysis(lat, lon, address),
        riesgoInundacion(lat, lon),
      ]);

      setRiskData(risks);

      setAnalysisResult({
        report,
        coordinates: { lat, lon },
        address: address,
        timestamp: new Date().toISOString()
      });

      toast.success('Análisis completado', {
        description: 'El informe está listo para su revisión',
        icon: <Sparkles className="size-4" />
      });
    } catch (error) {
      console.error('Error en análisis:', error);
      toast.error('Error al analizar', {
        description: error instanceof Error ? error.message : 'Error desconocido. Verifica tu API key de OpenAI en las variables de entorno.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnterApp = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLanding(false);
      setIsTransitioning(false);
    }, 500);
  };

  if (showLanding) {
    return (
      <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <LandingPage onEnterApp={handleEnterApp} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <Toaster position="top-right" richColors closeButton theme="dark" />
      
      {/* Full Screen Map Background */}
      <div className="fixed inset-0 z-0">
        <MapView 
          center={mapCenter} 
          zoom={mapZoom}
          onMapClick={handleMapClick}
          marker={marker}
          baseLayer={baseLayer}
          activeOverlays={activeOverlays}
          riskData={riskData}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Floating Top Bar - Responsive */}
      <header className="relative z-50 mt-2 sm:mt-4 mx-2 sm:mx-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 px-2 sm:px-3 md:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div 
              className="flex items-center gap-2 sm:gap-2 cursor-pointer group flex-shrink-0"
              onClick={() => setShowLanding(true)}
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md flex-shrink-0">
                <Globe className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">GeoAnalyzer AI</h1>
                <p className="text-[9px] sm:text-[10px] text-white/50 hidden xs:block">Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLayersSheetOpen(true)}
                className="hidden md:flex text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm px-2"
              >
                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                <span className="hidden lg:inline">Capas</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSavedLocationsSheetOpen(true)}
                className="hidden md:flex text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm px-2"
              >
                <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                <span className="hidden lg:inline">Historial</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2"
                aria-label="Menú"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 pt-2 border-t border-white/10 space-y-2 animate-slideDown">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLayersSheetOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm"
              >
                <Layers className="w-4 h-4 mr-2" />
                Capas del Mapa
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSavedLocationsSheetOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm"
              >
                <History className="w-4 h-4 mr-2" />
                Ubicaciones Guardadas
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Search Panel - Responsive */}
      <div className="relative z-40 mt-3 sm:mt-4 md:mt-5 mx-2 sm:mx-3">
        <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/5 shadow-2xl p-3 sm:p-4 max-w-full sm:max-w-sm">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-white/50" />
            </div>
            <h3 className="text-sm sm:text-sm font-medium text-white tracking-tight">Buscar Ubicación</h3>
          </div>
          <SearchBar onSearch={handleSearch} loading={searching} />
        </div>
      </div>

      {/* Risk Legend - Below Search Panel */}
      {activeOverlays.filter(id => {
        const layer = getLayerById(id);
        return layer?.category === 'risk';
      }).length > 0 && riskData && (
        <div className="relative z-30 mt-3 sm:mt-4 mx-2 sm:mx-3 max-w-full sm:max-w-sm">
          <div className="bg-black/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-4">
            <RiskLegend 
              activeRiskLayers={activeOverlays.filter(id => {
                const layer = getLayerById(id);
                return layer?.category === 'risk';
              })}
              riskData={riskData}
            />
          </div>
        </div>
      )}

      {/* Floating Coordinates - Responsive */}
      {marker && (
        <div className="fixed top-18 sm:top-20 right-2 sm:right-3 z-40 bg-black/80 backdrop-blur-xl rounded-md sm:rounded-lg border border-white/10 px-2 sm:px-3 py-1 pointer-events-none">
          <p className="text-[10px] sm:text-[11px] font-mono text-white">
            <span className="hidden sm:inline">{marker.lat.toFixed(6)}, {marker.lon.toFixed(6)}</span>
            <span className="sm:hidden">{marker.lat.toFixed(4)}...{marker.lon.toFixed(4)}</span>
          </p>
        </div>
      )}

      {/* Floating Analysis Panel - Responsive with Mobile Sheet */}
      {!loading && (analysisResult || comparisonResult) ? (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-4 sm:right-4 z-40 w-full sm:w-auto sm:max-w-[430px] lg:max-w-[520px]">
          <div className="bg-black/95 sm:bg-black/90 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 overflow-hidden max-h-[75vh] sm:max-h-[72vh] flex flex-col">
            <div className="overflow-y-auto flex-1 p-2 sm:p-3">
              {analysisResult && (
                <div className="p-3 sm:p-4">
                  <ReportDisplay
                    report={analysisResult.report}
                    coordinates={analysisResult.coordinates}
                    address={analysisResult.address}
                    timestamp={analysisResult.timestamp}
                    label="Análisis Actual"
                  />
                </div>
              )}

              {comparisonResult && analysisResult && (
                <>
                  <Separator className="bg-white/10" />
                  <div className="p-3 sm:p-4">
                    <div className="mb-3">
                      <p className="text-xs sm:text-sm font-semibold text-white/60 uppercase tracking-wider">
                        Comparación
                      </p>
                    </div>
                    <ReportDisplay
                      report={comparisonResult.report}
                      coordinates={comparisonResult.coordinates}
                      address={comparisonResult.address}
                      timestamp={comparisonResult.timestamp}
                      label="Comparación"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-4 sm:right-4 z-40 w-full sm:w-auto sm:max-w-sm md:max-w-md">
          <div className="bg-black/95 sm:bg-black/90 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 overflow-hidden shadow-2xl max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
            <LoadingAnalysis />
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-40 w-full sm:w-auto sm:max-w-sm md:max-w-md hidden sm:block">
          <div className="bg-black/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
            <WelcomePanel />
          </div>
        </div>
      )}

      {/* Weather Legend */}
      <WeatherLegend activeOverlays={activeOverlays} />

      {/* Saved Locations Sheet - Responsive */}
      <Sheet open={savedLocationsSheetOpen} onOpenChange={setSavedLocationsSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] md:w-[450px] bg-black border-white/10 p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle className="text-white text-lg sm:text-xl">Ubicaciones Guardadas</SheetTitle>
            <SheetDescription className="text-white/50 text-sm">
              Accede rápidamente a ubicaciones previamente analizadas
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 sm:mt-6">
            <SavedLocations 
              onSelectLocation={async (lat, lon, address) => {
                setMapCenter([lat, lon]);
                setMapZoom(14);
                setMarker({ lat, lon });
                setSavedLocationsSheetOpen(false);
                await analyzeLocation(lat, lon, address);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Map Layers Control */}
      <MapLayersControl 
        activeBaseLayer={baseLayer}
        activeOverlays={activeOverlays}
        onBaseLayerChange={(layerId) => {
          setBaseLayer(layerId);
          toast.success('Mapa base actualizado', {
            description: `Cambiado a ${layerId}`
          });
        }}
        onOverlayToggle={(layerId) => {
          setActiveOverlays(prev => 
            prev.includes(layerId) 
              ? prev.filter(id => id !== layerId)
              : [...prev, layerId]
          );
        }}
        open={layersSheetOpen}
        onOpenChange={setLayersSheetOpen}
      />
    </div>
  );
}

export default App;
