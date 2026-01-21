import React from 'react';
import moonDogLogo from '@/assets/moon-dog-logo.png';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={moonDogLogo} alt="Moon Dog" className="w-12 h-12 rounded-xl" />
          <div>
            <h1 className="text-foreground font-bold text-xl">MOON DOG</h1>
            <p className="text-muted-foreground text-xs">Powered by dVRF</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-crash-green animate-pulse" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};
