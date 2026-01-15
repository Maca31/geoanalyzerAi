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
      <CardHeader className="border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <FileText className="size-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Informe de Análisis Geográfico</div>
                <CardDescription className="flex items-center gap-2 mt-2 text-white/60">
                  <MapPin className="size-3 text-white/60" />
                  {address || `${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`}
                </CardDescription>
                <CardDescription className="flex items-center gap-2 text-white/50 text-xs">
                  <Calendar className="size-3" />
                  {formattedDate}
                </CardDescription>
              </div>
            </CardTitle>
          </div>
          <div className="flex gap-2 items-start">
            {label && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide bg-white/10 text-white border-white/20">
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
                    className="border-white/20 hover:bg-white/10 hover:border-white/30"
                  >
                    <MapPin className="size-4 text-white/70" />
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
                    className="border-white/20 hover:bg-white/10 hover:border-white/30"
                  >
                    <Download className="size-4 text-white/70" />
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
      
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10">
              <Info className="size-3 text-white/60" />
              OpenStreetMap
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10">
              <Info className="size-3 text-white/60" />
              Open-Elevation
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/5 text-white/70 border-white/10">
              <Info className="size-3 text-white/60" />
              Open-Meteo
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-white/10 text-white border-white/20">
              <Sparkles className="size-3" />
              Análisis IA
            </Badge>
          </div>

          <Separator className="bg-white/10" />

          <ScrollArea className="h-[400px] w-full rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
            <div className="prose prose-sm max-w-none prose-invert">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed">
                {normalizedReport}
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/20 rounded-lg">
            <AlertTriangle className="size-5 text-white/60 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-white/70 leading-relaxed">
              <strong className="text-white">Limitaciones:</strong> Este informe se basa en datos públicos y puede no estar completamente actualizado. 
              Se recomienda verificar la información con fuentes oficiales locales antes de tomar decisiones importantes.
            </p>
          </div>

          <div className="text-xs text-white/50 font-mono">
            <strong className="text-white/70">Coordenadas exactas:</strong> {coordinates.lat.toFixed(6)}° N, {coordinates.lon.toFixed(6)}° E
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
