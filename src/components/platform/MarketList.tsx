import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Token } from '@/types/token';
import { cn } from '@/lib/utils';

interface MarketListProps {
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
}

export const MarketList: React.FC<MarketListProps> = ({ tokens, selectedToken, onSelectToken }) => {
  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toFixed(0);
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Markets</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {tokens.map((token) => {
          const isPositive = token.priceChange24h >= 0;
          const isSelected = token.id === selectedToken.id;
          
          return (
            <div
              key={token.id}
              onClick={() => onSelectToken(token)}
              className={cn(
                "flex items-center justify-between p-3 cursor-pointer transition-colors border-l-2",
                isSelected 
                  ? "bg-primary/10 border-l-primary" 
                  : "border-l-transparent hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{token.logo}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{token.symbol}-PERP</p>
                  <p className="text-muted-foreground text-xs">{token.maxLeverage}x</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-foreground text-sm">${formatPrice(token.price)}</p>
                <div className={cn(
                  "flex items-center justify-end gap-0.5 text-xs",
                  isPositive ? "text-primary" : "text-destructive"
                )}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
