import React from 'react';
import { Gem, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  balance: number;
  equity: number;
  unrealizedPnl: number;
}

export const Header: React.FC<HeaderProps> = ({ balance, equity, unrealizedPnl }) => {
  const isPnlPositive = unrealizedPnl >= 0;

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-gem flex items-center justify-center glow-purple">
              <Gem className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-foreground font-black text-lg tracking-tight">
              LOW CAP <span className="text-gradient-gem">GEMS</span>
            </h1>
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Perpetuals on SUPRA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Account Stats */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-2 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="text-muted-foreground text-xs">Balance</p>
              <p className="text-foreground font-semibold text-sm">{balance.toLocaleString()} SUPRA</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-muted-foreground text-xs">Equity</p>
              <p className="text-foreground font-semibold text-sm">{equity.toLocaleString()} SUPRA</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-muted-foreground text-xs">Unrealized PnL</p>
              <p className={`font-semibold text-sm ${isPnlPositive ? 'text-primary' : 'text-destructive'}`}>
                {isPnlPositive ? '+' : ''}{unrealizedPnl.toFixed(2)} SUPRA
              </p>
            </div>
          </div>
          
          <Button className="bg-gradient-gem hover:opacity-90 text-white font-semibold glow-purple">
            <Wallet className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>
    </header>
  );
};
