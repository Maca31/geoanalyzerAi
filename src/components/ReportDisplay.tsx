import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { FileText, MapPin, Calendar, Download, AlertTriangle, Database, Sparkles, Globe, CloudSun } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { jsPDF } from 'jspdf';

interface ReportDisplayProps {
  report: string;
  coordinates: { lat: number; lon: number };
  address?: string;
  timestamp: string;
  label?: string;
}

export function ReportDisplay({ report, coordinates, address, timestamp, label }: ReportDisplayProps) {
  const normalizedReport = report
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
      } as any);

      const marginX = 40;
      let cursorY = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Informe de Análisis Geográfico', marginX, cursorY);

      cursorY += 24;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const locationText = address || `${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`;
      doc.text(`Ubicación: ${locationText}`, marginX, cursorY);

      cursorY += 16;
      doc.text(
        `Fecha de generación: ${new Date(timestamp).toLocaleString('es-ES')}`,
        marginX,
        cursorY,
      );

      cursorY += 24;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Informe detallado', marginX, cursorY);

      cursorY += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      const maxWidth = 515;
      const lines = doc.splitTextToSize(normalizedReport, maxWidth);
      
      const pageHeight = 842;
      const lineHeight = 14;
      
      lines.forEach((line: string) => {
        if (cursorY > pageHeight - 40) {
          doc.addPage();
          cursorY = 40;
        }
        doc.text(line, marginX, cursorY);
        cursorY += lineHeight;
      });

      const fileNameSafe =
        (address || `informe-${coordinates.lat.toFixed(3)}-${coordinates.lon.toFixed(3)}`)
          .replace(/[^\w\d\-]+/g, '_')
          .slice(0, 60);

      doc.save(`${fileNameSafe}.pdf`);

      toast.success('Informe exportado a PDF', {
        description: 'Se ha descargado un archivo PDF con el contenido del informe.',
      });
    } catch (error) {
      console.error('Error exportando PDF:', error);
      toast.error('No se pudo exportar el PDF', {
        description: 'Inténtalo de nuevo o revisa la consola del navegador para más detalles.',
      });
    }
  };

  const handleSaveLocation = () => {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const newLocation = {
      coordinates,
      address,
      timestamp,
      id: Date.now()
    };
    
    savedLocations.push(newLocation);
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    
    toast.success('Ubicación guardada', {
      description: 'La ubicación se ha guardado correctamente'
    });
  };

  const formattedDate = new Date(timestamp).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  return (
    <Card className="w-full bg-gradient-to-b from-[#0a0a0a] to-[#111] border-white/10 shadow-2xl">
      {/* Header con gradiente */}
      <CardHeader className="border-b border-white/10 p-4 sm:p-5 bg-gradient-to-r from-white/5 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0 shadow-lg">
                <FileText className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg font-bold tracking-tight">Informe de Análisis</div>
                {label && (
                  <Badge variant="outline" className="mt-1 text-[9px] uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white/80 border-white/20">
                    {label}
                  </Badge>
                )}
              </div>
            </CardTitle>
            
            {/* Location info */}
            <div className="flex flex-col gap-1 pl-[52px]">
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="size-3 text-blue-400/70 flex-shrink-0" />
                <span className="text-xs truncate">{address || `${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Calendar className="size-3 flex-shrink-0" />
                <span className="text-[11px]">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 items-start flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSaveLocation}
                    className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 h-9 w-9 rounded-lg"
                  >
                    <MapPin className="size-4 text-white/60" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Guardar ubicación</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleExportPDF}
                    className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 h-9 w-9 rounded-lg"
                  >
                    <Download className="size-4 text-white/60" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Exportar PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Data sources badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-md">
            <Globe className="size-3" />
            OpenStreetMap
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400/90 border-amber-500/20 text-[10px] px-2.5 py-1 rounded-md">
            <Database className="size-3" />
            Elevation
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-sky-500/10 text-sky-400/90 border-sky-500/20 text-[10px] px-2.5 py-1 rounded-md">
            <CloudSun className="size-3" />
            Meteo
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 bg-purple-500/10 text-purple-400/90 border-purple-500/20 text-[10px] px-2.5 py-1 rounded-md">
            <Sparkles className="size-3" />
            IA Analysis
          </Badge>
        </div>

        <Separator className="bg-white/5" />

        {/* Report content */}
        <ScrollArea className="h-[280px] sm:h-[350px] md:h-[420px] w-full rounded-xl border border-white/5 bg-black/30 p-4 sm:p-5">
          <div className="prose prose-sm max-w-none prose-invert">
            <div className="whitespace-pre-wrap text-white/75 leading-relaxed text-[13px] sm:text-sm font-light">
              {normalizedReport}
            </div>
          </div>
        </ScrollArea>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="size-4 text-amber-400/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-white/50 leading-relaxed">
              <span className="text-amber-400/80 font-medium">Aviso:</span> Este informe se basa en datos públicos disponibles. 
              Verifica la información con fuentes oficiales antes de tomar decisiones.
            </p>
          </div>
        </div>

        {/* Coordinates footer */}
        <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5">
          <span className="font-mono">
            {coordinates.lat.toFixed(6)}° N, {coordinates.lon.toFixed(6)}° E
          </span>
          <span className="text-white/30">GeoAnalyzer AI</span>
        </div>
      </CardContent>
    </Card>
  );
}
