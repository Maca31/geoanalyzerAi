import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
    <Card className="w-full bg-[#0a0a0a] border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-3 text-white">
          <Loader2 className="size-5 animate-spin text-white" />
          Analizando ubicación...
        </CardTitle>
        <CardDescription className="text-white/50">
          Recopilando información de fuentes oficiales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-white/10" />
          <p className="text-sm text-white/60 text-center">
            {progress}% completado
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <CurrentIcon className={`size-5 text-white ${currentStep === steps.length - 1 ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium text-white">{steps[currentStep].label}</span>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-5/6 bg-white/10" />
          <div className="pt-4 space-y-3">
            <Skeleton className="h-20 w-full bg-white/10" />
            <Skeleton className="h-20 w-full bg-white/10" />
            <Skeleton className="h-20 w-full bg-white/10" />
          </div>
        </div>

        <div className="text-xs text-white/50 space-y-1 pt-4 border-t border-white/10">
          <p className="font-medium text-white/70">Consultando fuentes:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>OpenStreetMap - Datos geográficos</li>
            <li>Overpass API - Infraestructura urbana</li>
            <li>Open-Elevation - Datos topográficos</li>
            <li>Open-Meteo - Información climática</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
