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
    <Card className="w-full bg-black/90 backdrop-blur-xl border-white/5 shadow-2xl">
      <CardHeader className="border-b border-white/5 p-5 sm:p-6">
        <CardTitle className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="size-5 sm:size-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-tight">Asistente Geográfico IA</div>
            <CardDescription className="text-white/40 text-xs sm:text-sm mt-1.5 font-light">
              Análisis inteligente de zonas geográficas con datos oficiales
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6 space-y-5 sm:space-y-6 p-5 sm:p-6">
        <div className="bg-white/3 border border-white/5 rounded-xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Info className="size-4 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-white mb-1.5">¿Cómo funciona?</h3>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                Selecciona una ubicación buscando por dirección o haciendo clic en el mapa. 
                El sistema consultará automáticamente datos oficiales y generará un informe profesional.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-white text-xs sm:text-sm uppercase tracking-widest text-white/40 mb-4">
            Opciones disponibles
          </h3>

          <div className="grid gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                <Search className="size-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm sm:text-base mb-1.5">
                  Búsqueda por dirección
                </h4>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-light">
                  Introduce cualquier dirección o nombre de lugar en el buscador
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                <MousePointer className="size-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm sm:text-base mb-1.5">
                  Selección en el mapa
                </h4>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-light">
                  Haz clic directamente sobre cualquier punto del mapa interactivo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                <MapPin className="size-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm sm:text-base mb-1.5">
                  Análisis automático
                </h4>
                <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-light">
                  El sistema recopilará datos de infraestructura, riesgos y urbanismo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-5 sm:pt-6 border-t border-white/5">
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">
              Fuentes de datos
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-white/40 font-light">
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>OpenStreetMap</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Open-Elevation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Open-Meteo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Overpass API</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">
              El informe incluye
            </h4>
            <ul className="text-xs sm:text-sm text-white/40 space-y-2.5 font-light">
              <li className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Descripción general</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Infraestructura urbana</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Análisis de riesgos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Clasificación de uso</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="size-1.5 rounded-full bg-white/30 flex-shrink-0" />
                <span>Recomendaciones IA</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
