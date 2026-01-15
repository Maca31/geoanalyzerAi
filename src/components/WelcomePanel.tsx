import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  MapPin,
  Search,
  MousePointer,
  Sparkles,
  Info,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";

export function WelcomePanel() {
  return (
    <Card className="w-full bg-[#0a0a0a] border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Asistente Geográfico IA</div>
            <CardDescription className="text-white/50 text-sm mt-1">
              Análisis inteligente de zonas geográficas con datos oficiales
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Alert className="bg-white/5 border-white/20">
          <Info className="size-4 text-white/60" />
          <AlertTitle className="text-white">¿Cómo funciona?</AlertTitle>
          <AlertDescription className="text-white/70 text-sm">
            Selecciona una ubicación buscando por dirección o haciendo clic en el mapa. 
            El sistema consultará automáticamente datos oficiales y generará un informe profesional.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
            Opciones disponibles:
          </h3>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="p-3 rounded-lg bg-white/10 border border-white/20 group-hover:scale-110 transition-transform">
                <Search className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">
                  Búsqueda por dirección
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Introduce cualquier dirección o nombre de lugar en el buscador
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="p-3 rounded-lg bg-white/10 border border-white/20 group-hover:scale-110 transition-transform">
                <MousePointer className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">
                  Selección en el mapa
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Haz clic directamente sobre cualquier punto del mapa interactivo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="p-3 rounded-lg bg-white/10 border border-white/20 group-hover:scale-110 transition-transform">
                <MapPin className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm mb-1">
                  Análisis automático
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  El sistema recopilará datos de infraestructura, riesgos y urbanismo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">
              Fuentes de datos:
            </h4>
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-white/60" />
                OpenStreetMap
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-white/60" />
                Open-Elevation
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-white/60" />
                Open-Meteo
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-white/60" />
                Overpass API
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">
              El informe incluye:
            </h4>
            <ul className="text-xs text-white/60 space-y-1.5 list-disc list-inside">
              <li>Descripción general</li>
              <li>Infraestructura urbana</li>
              <li>Análisis de riesgos</li>
              <li>Clasificación de uso</li>
              <li>Recomendaciones IA</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
