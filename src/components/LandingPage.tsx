import React from 'react';
import { MapPin, Sparkles, ArrowRight, Globe2 } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenDocs?: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Subtle grid pattern background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(30px, 4vw, 50px) clamp(30px, 4vw, 50px)'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-16 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Globe2 className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white tracking-wider">GEOANALYZER</p>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono">AI</p>
          </div>
        </div>
      </nav>

      {/* Main Hero Content - Everything in one viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16 py-4 sm:py-6 text-center min-h-0 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center h-full space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          
          {/* Icon - Smaller on mobile */}
          <div className="flex justify-center mb-0 sm:mb-1 md:mb-2">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Heading - Compact */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight px-2">
            Análisis Geoespacial
            <span className="block mt-0.5 sm:mt-1 text-white/90">Inteligente</span>
          </h1>

          {/* Description - Shorter */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed px-4 line-clamp-2 sm:line-clamp-none">
            Analiza cualquier ubicación del mundo con inteligencia artificial. 
            Obtén insights detallados sobre geografía, clima e infraestructura.
          </p>

          {/* CTA Button */}
          <div className="pt-1 sm:pt-2">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 font-semibold px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg rounded-lg transition-all hover:scale-105 shadow-lg active:scale-95"
            >
              Comenzar análisis
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Features Grid - Compact, horizontal on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 pt-4 sm:pt-6 md:pt-8 max-w-4xl mx-auto px-4 w-full">
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-white/10 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm md:text-base">Análisis Global</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/60">Cualquier ubicación</p>
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-white/10 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm md:text-base">IA Avanzada</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/60">Insights precisos</p>
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-white/10 flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm md:text-base">Tiempo Real</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-white/60">Datos actualizados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
