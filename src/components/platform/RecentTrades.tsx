import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Trade, Token } from '@/types/token';
import { cn } from '@/lib/utils';

interface RecentTradesProps {
  trades: Trade[];
  tokens: Token[];
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, tokens }) => {
  const getToken = (tokenId: string) => tokens.find(t => t.id === tokenId);

  const formatSize = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K`;
    return size.toFixed(0);
  };

  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(2);
    return price.toFixed(6);
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Recent Trades</h3>
        <Zap className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {trades.map((trade) => {
          const token = getToken(trade.tokenId);
          if (!token) return null;
          
          const isLong = trade.side === 'long';
          
          return (
            <div 
              key={trade.id}
              className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  isLong ? "bg-primary/20" : "bg-destructive/20"
                )}>
                  {isLong ? (
                    <TrendingUp className="w-3 h-3 text-primary" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{token.logo}</span>
                    <span className="font-semibold text-foreground text-xs">{token.symbol}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{trade.user}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-mono text-foreground text-xs">{formatSize(trade.size)} SUPRA</p>
                <p className="text-muted-foreground text-xs">@${formatPrice(trade.price)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
