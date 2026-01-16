import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { FileText, MapPin, Calendar, Download, AlertTriangle, Info, Sparkles } from 'lucide-react';
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
    <Card className="w-full bg-[#0a0a0a] border-white/10">
      <CardHeader className="border-b border-white/10 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
            <CardTitle className="flex items-start sm:items-center gap-2 sm:gap-3 text-white">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                <FileText className="size-4 sm:size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg md:text-xl font-bold line-clamp-2">Informe de Análisis Geográfico</div>
                <CardDescription className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-white/60 text-xs sm:text-sm">
                  <MapPin className="size-2.5 sm:size-3 text-white/60 flex-shrink-0" />
                  <span className="truncate">{address || `${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`}</span>
                </CardDescription>
                <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-white/50 text-[10px] sm:text-xs">
                  <Calendar className="size-2.5 sm:size-3 flex-shrink-0" />
                  <span className="truncate">{formattedDate}</span>
                </CardDescription>
              </div>
            </CardTitle>
          </div>
          <div className="flex gap-1.5 sm:gap-2 items-start flex-shrink-0">
            {label && (
              <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase tracking-wide bg-white/10 text-white border-white/20 hidden sm:inline-flex">
                {label}
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSaveLocation}
                    className="border-white/20 hover:bg-white/10 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <MapPin className="size-3.5 sm:size-4 text-white/70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Guardar ubicación</p>
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
                    className="border-white/20 hover:bg-white/10 hover:border-white/30 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Download className="size-3.5 sm:size-4 text-white/70" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10 text-[10px] sm:text-xs px-2 py-0.5">
              <Info className="size-2.5 sm:size-3 text-white/60" />
              <span className="hidden sm:inline">OpenStreetMap</span>
              <span className="sm:hidden">OSM</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10 text-[10px] sm:text-xs px-2 py-0.5">
              <Info className="size-2.5 sm:size-3 text-white/60" />
              Elevation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10 text-[10px] sm:text-xs px-2 py-0.5">
              <Info className="size-2.5 sm:size-3 text-white/60" />
              Meteo
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-white/10 text-white border-white/20 text-[10px] sm:text-xs px-2 py-0.5">
              <Sparkles className="size-2.5 sm:size-3" />
              IA
            </Badge>
          </div>

          <Separator className="bg-white/10" />

          <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg border border-white/10 bg-[#0a0a0a] p-4 sm:p-6">
            <div className="prose prose-sm max-w-none prose-invert">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm sm:text-base">
                {normalizedReport}
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 border border-white/20 rounded-lg">
            <AlertTriangle className="size-4 sm:size-5 text-white/60 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs text-white/70 leading-relaxed">
              <strong className="text-white">Limitaciones:</strong> Este informe se basa en datos públicos y puede no estar completamente actualizado. 
              Se recomienda verificar la información con fuentes oficiales locales antes de tomar decisiones importantes.
            </p>
          </div>

          <div className="text-[10px] sm:text-xs text-white/50 font-mono break-all">
            <strong className="text-white/70">Coordenadas exactas:</strong> {coordinates.lat.toFixed(6)}° N, {coordinates.lon.toFixed(6)}° E
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
