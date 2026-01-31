import React from 'react';
import { TrendingUp, TrendingDown, Flame, Sparkles, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/types/token';

interface TokenCardProps {
  token: Token;
  onClick: (token: Token) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onClick }) => {
  const isPositive = token.priceChange24h >= 0;
  
  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(4);
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  return (
    <Card 
      className="bg-card/50 border-border hover:border-primary/50 transition-all cursor-pointer group hover:glow-green"
      onClick={() => onClick(token)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {token.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{token.symbol}</h3>
                {token.isHot && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs px-1.5">
                    <Flame className="w-3 h-3 mr-0.5" />
                    HOT
                  </Badge>
                )}
                {token.isNew && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-xs px-1.5">
                    <Sparkles className="w-3 h-3 mr-0.5" />
                    NEW
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{token.name}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold ${
            isPositive 
              ? 'bg-primary/20 text-primary' 
              : 'bg-destructive/20 text-destructive'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{token.priceChange24h.toFixed(1)}%
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Price</span>
            <span className="text-foreground font-mono font-semibold">
              ${formatPrice(token.price)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Market Cap</span>
            <span className="text-foreground font-semibold">
              {formatMarketCap(token.marketCap)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              Holders
            </span>
            <span className="text-foreground font-semibold">
              {token.holders.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
