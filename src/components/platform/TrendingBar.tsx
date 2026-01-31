import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Token } from '@/types/token';

interface TrendingBarProps {
  tokens: Token[];
}

export const TrendingBar: React.FC<TrendingBarProps> = ({ tokens }) => {
  const topGainers = [...tokens]
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 5);

  return (
    <div className="bg-card/50 border-b border-border py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-primary shrink-0">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">TRENDING</span>
          </div>
          
          <div className="flex items-center gap-6">
            {topGainers.map((token, index) => (
              <div key={token.id} className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground text-sm">#{index + 1}</span>
                <span className="text-lg">{token.logo}</span>
                <span className="text-foreground font-semibold text-sm">{token.symbol}</span>
                <span className={`flex items-center gap-0.5 text-sm font-medium ${
                  token.priceChange24h >= 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {token.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
