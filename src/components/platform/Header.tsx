import React from 'react';
import { Gem, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  balance: number;
}

export const Header: React.FC<HeaderProps> = ({ balance }) => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-gem flex items-center justify-center glow-purple">
              <Gem className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-foreground font-black text-xl tracking-tight">
              LOW CAP <span className="text-gradient-gem">GEMS</span>
            </h1>
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Powered by SUPRA Labs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-foreground font-semibold">
              {balance.toLocaleString()} SUPRA
            </span>
          </div>
          
          <Button className="bg-gradient-gem hover:opacity-90 text-white font-semibold glow-purple">
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
};
