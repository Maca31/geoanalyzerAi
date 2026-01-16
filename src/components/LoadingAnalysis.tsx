import { Skeleton } from './ui/skeleton';
import { Loader2, Database, Map, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/progress';
import { useEffect, useState } from 'react';

export function LoadingAnalysis() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Map, label: 'Obteniendo datos geográficos...' },
    { icon: Database, label: 'Consultando infraestructura urbana...' },
    { icon: AlertTriangle, label: 'Evaluando riesgos naturales...' },
    { icon: Loader2, label: 'Generando informe con IA...' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(stepInterval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <Loader2 className="size-4 sm:size-5 animate-spin text-white" />
          <h3 className="text-sm sm:text-base font-semibold text-white">Analizando ubicación...</h3>
        </div>
        <p className="text-xs sm:text-sm text-white/50 mt-1 ml-6 sm:ml-8">
          Recopilando información de fuentes oficiales
        </p>
      </div>
      
      {/* Content */}
      <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-4 sm:space-y-5">
        {/* Progress */}
        <div className="space-y-1.5 sm:space-y-2">
          <Progress value={progress} className="h-1.5 sm:h-2 bg-white/10" />
          <p className="text-xs sm:text-sm text-white/60 text-center">
            {progress}% completado
          </p>
        </div>

        {/* Current Step */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
          <CurrentIcon className={`size-4 sm:size-5 text-white flex-shrink-0 ${currentStep === steps.length - 1 ? 'animate-spin' : ''}`} />
          <span className="text-xs sm:text-sm font-medium text-white">{steps[currentStep].label}</span>
        </div>

        {/* Skeletons - More compact on mobile */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 sm:h-8 w-3/4 bg-white/10" />
          <Skeleton className="h-3 sm:h-4 w-full bg-white/10" />
          <Skeleton className="h-3 sm:h-4 w-full bg-white/10" />
          <Skeleton className="h-3 sm:h-4 w-5/6 bg-white/10" />
          <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
            <Skeleton className="h-14 sm:h-16 w-full bg-white/10" />
            <Skeleton className="h-14 sm:h-16 w-full bg-white/10" />
          </div>
        </div>

        {/* Sources - Collapsible on very small screens */}
        <div className="text-[10px] sm:text-xs text-white/50 space-y-1 pt-3 sm:pt-4 border-t border-white/10">
          <p className="font-medium text-white/70">Consultando fuentes:</p>
          <ul className="list-disc list-inside space-y-0.5 text-white/40">
            <li className="truncate">OpenStreetMap - Datos geográficos</li>
            <li className="truncate">Overpass API - Infraestructura urbana</li>
            <li className="truncate hidden sm:list-item">Open-Elevation - Datos topográficos</li>
            <li className="truncate hidden sm:list-item">Open-Meteo - Información climática</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
