import { useEffect, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface SearchBarProps {
  onSearch: (address: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

  useEffect(() => {
    const query = searchInput.trim();

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setFetchingSuggestions(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'GeoAnalysisApp/1.0',
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error('No se pudo obtener sugerencias');
        }

        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error obteniendo sugerencias:', error);
        }
      } finally {
        setFetchingSuggestions(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const handleSuggestionClick = (displayName: string) => {
    setSearchInput(displayName);
    setSuggestions([]);
    onSearch(displayName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      toast.error('Por favor, introduce una dirección');
      return;
    }

    onSearch(searchInput.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 w-full relative">
      <div className="relative flex-1 min-w-0">
        <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-white/60 pointer-events-none" />
        <Input
          type="text"
          placeholder="Introduce una dirección..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          disabled={loading}
          className="pl-9 sm:pl-12 bg-[#0a0a0a] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 h-10 sm:h-12 text-sm sm:text-base"
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <Card className="absolute z-50 mt-2 w-full shadow-2xl border border-white/20 bg-black backdrop-blur-xl">
            <ScrollArea className="max-h-64">
              <ul className="divide-y divide-white/10">
                {suggestions.map((s) => (
                  <li
                    key={`${s.lat}-${s.lon}-${s.display_name}`}
                    className="px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                    onClick={() => handleSuggestionClick(s.display_name)}
                  >
                    {s.display_name}
                  </li>
                ))}
                {fetchingSuggestions && (
                  <li className="px-4 py-3 text-xs text-white/50">
                    Buscando sugerencias...
                  </li>
                )}
              </ul>
            </ScrollArea>
          </Card>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={loading} 
        size="default"
        className="h-10 sm:h-12 bg-white text-black hover:bg-white/90 font-semibold px-3 sm:px-4 md:px-6 shadow-lg text-sm sm:text-base flex-shrink-0"
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
            <span className="hidden sm:inline">Buscando...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <Search className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Buscar</span>
          </>
        )}
      </Button>
    </form>
  );
}
