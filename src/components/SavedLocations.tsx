import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { MapPin, Trash2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SavedLocation {
  id: number;
  coordinates: { lat: number; lon: number };
  address?: string;
  timestamp: string;
}

interface SavedLocationsProps {
  onSelectLocation: (lat: number, lon: number, address?: string) => void;
}

export function SavedLocations({ onSelectLocation }: SavedLocationsProps) {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    loadLocations();
    
    const handleStorageChange = () => {
      loadLocations();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(loadLocations, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [updateKey]);

  const loadLocations = () => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocations(parsed);
      } catch (error) {
        console.error('Error cargando ubicaciones:', error);
      }
    }
  };

  const deleteLocation = (id: number) => {
    const updated = locations.filter(loc => loc.id !== id);
    setLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
    toast.success('Ubicación eliminada');
  };

  const clearAll = () => {
    setLocations([]);
    localStorage.removeItem('savedLocations');
    toast.success('Todas las ubicaciones eliminadas');
  };

  if (locations.length === 0) {
    return (
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-base text-white">Ubicaciones guardadas</CardTitle>
          <CardDescription className="text-white/50">No hay ubicaciones guardadas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/60">
            Guarda ubicaciones desde el panel de informes para acceder a ellas rápidamente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0a0a0a] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-white">Ubicaciones guardadas</CardTitle>
            <CardDescription className="text-white/50">{locations.length} ubicación(es)</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
                Limpiar todo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black border-white/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">¿Eliminar todas las ubicaciones?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  Esta acción no se puede deshacer. Se eliminarán todas las ubicaciones guardadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/20 text-white/70 hover:bg-white/10">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll} className="bg-white text-black hover:bg-white/90">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-start gap-2 p-3 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MapPin className="size-4 text-white/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {location.address || `${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lon.toFixed(4)}`}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(location.timestamp).toLocaleDateString('es-ES')}
                  </p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs bg-white/5 text-white/70 border-white/10">
                      {location.coordinates.lat.toFixed(4)}° N
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-white/5 text-white/70 border-white/10">
                      {location.coordinates.lon.toFixed(4)}° E
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 hover:bg-white/10 text-white/60 hover:text-white"
                    onClick={() => onSelectLocation(
                      location.coordinates.lat,
                      location.coordinates.lon,
                      location.address
                    )}
                  >
                    <Navigation className="size-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 hover:bg-white/10 text-white/60 hover:text-white"
                      >
                        <Trash2 className="size-3 text-white/60" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black border-white/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Eliminar ubicación?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/20 text-white/70 hover:bg-white/10">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteLocation(location.id)} className="bg-white text-black hover:bg-white/90">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
