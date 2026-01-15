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

      {/* Floating Top Bar */}
      <header className="relative z-50 mt-4 mx-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShowLanding(true)}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Globe className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">GeoAnalyzer AI</h1>
                <p className="text-xs text-white/50">Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLayersSheetOpen(true)}
                className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
              >
                <Layers className="w-4 h-4 mr-2" />
                Capas
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSavedLocationsSheetOpen(true)}
                className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
              >
                <History className="w-4 h-4 mr-2" />
                Historial
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-white/10 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLayersSheetOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
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
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <History className="w-4 h-4 mr-2" />
                Ubicaciones Guardadas
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Floating Search Panel - Top Left */}
      <div className="relative z-40 mt-6 mx-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-white/60" />
            <h3 className="text-sm font-semibold text-white/80">Buscar Ubicación</h3>
          </div>
          <SearchBar onSearch={handleSearch} loading={searching} />
        </div>
      </div>

      {/* Floating Coordinates - Top Right */}
      {marker && (
        <div className="fixed top-24 right-4 z-40 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 pointer-events-none">
          <p className="text-xs font-mono text-white">
            {marker.lat.toFixed(6)}, {marker.lon.toFixed(6)}
          </p>
        </div>
      )}

      {/* Floating Analysis Panel - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 w-full max-w-lg">
        <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {loading && (
            <div className="p-6">
              <LoadingAnalysis />
            </div>
          )}
          
          {!loading && (analysisResult || comparisonResult) && (
            <div className="max-h-[70vh] overflow-y-auto">
              {analysisResult && (
                <div className="p-6">
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
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
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
          )}

          {!loading && !analysisResult && !comparisonResult && (
            <div className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <MapPin className="w-8 h-8 text-white/40" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Listo para analizar</h3>
                  <p className="text-sm text-white/60">
                    Busca una ubicación o haz clic en el mapa para comenzar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Info Panel - Bottom Left */}
      {!loading && !analysisResult && (
        <div className="fixed bottom-4 left-4 z-40 w-full max-w-sm hidden lg:block">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <WelcomePanel />
          </div>
        </div>
      )}

      {/* Risk Legend - Floating */}
      {activeOverlays.filter(id => {
        const layer = getLayerById(id);
        return layer?.category === 'risk';
      }).length > 0 && riskData && (
        <div className="fixed top-32 left-4 z-40 w-full max-w-xs hidden md:block">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
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

      {/* Weather Legend */}
      <WeatherLegend activeOverlays={activeOverlays} />

      {/* Saved Locations Sheet */}
      <Sheet open={savedLocationsSheetOpen} onOpenChange={setSavedLocationsSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] bg-black border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Ubicaciones Guardadas</SheetTitle>
            <SheetDescription className="text-white/50">
              Accede rápidamente a ubicaciones previamente analizadas
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
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
