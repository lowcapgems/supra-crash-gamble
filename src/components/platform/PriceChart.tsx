import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock } from 'lucide-react';
import { Token } from '@/types/token';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  token: Token;
}

export const PriceChart: React.FC<PriceChartProps> = ({ token }) => {
  const isPositive = token.priceChange24h >= 0;

  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(4);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(6);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  // Generate mock chart data
  const generateChartPath = () => {
    const points = [];
    let y = 50;
    for (let x = 0; x <= 100; x += 2) {
      y += (Math.random() - 0.48) * 8;
      y = Math.max(10, Math.min(90, y));
      points.push(`${x},${y}`);
    }
    // Trend direction based on price change
    if (isPositive) {
      return points.map((p, i) => {
        const [x, y] = p.split(',').map(Number);
        return `${x},${y - i * 0.3}`;
      }).join(' ');
    }
    return points.join(' ');
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{token.logo}</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{token.symbol}-PERP</h2>
              <p className="text-muted-foreground text-sm">{token.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono text-foreground">
              ${formatPrice(token.price)}
            </p>
            <div className={cn(
              "flex items-center justify-end gap-1 text-sm font-semibold",
              isPositive ? "text-primary" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4">
        <div className="relative h-48 bg-muted/20 rounded-lg overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.2"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Price line */}
            <polyline
              points={generateChartPath()}
              fill="none"
              stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Gradient fill */}
            <defs>
              <linearGradient id={`gradient-${token.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                  stopOpacity="0.3" 
                />
                <stop 
                  offset="100%" 
                  stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} 
                  stopOpacity="0" 
                />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time labels */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-xs text-muted-foreground">
            <span>24h ago</span>
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-t border-border">
        <div className="p-3 border-r border-border">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            24h Volume
          </div>
          <p className="font-semibold text-foreground text-sm">{formatVolume(token.volume24h)}</p>
        </div>
        <div className="p-3 border-r border-border">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
            <BarChart3 className="w-3 h-3" />
            Open Interest
          </div>
          <p className="font-semibold text-foreground text-sm">{formatVolume(token.openInterest)}</p>
        </div>
        <div className="p-3 border-r border-border">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
            <Clock className="w-3 h-3" />
            Funding (8h)
          </div>
          <p className={cn(
            "font-semibold text-sm font-mono",
            token.fundingRate >= 0 ? 'text-primary' : 'text-destructive'
          )}>
            {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(4)}%
          </p>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
            <Activity className="w-3 h-3" />
            Max Leverage
          </div>
          <p className="font-semibold text-foreground text-sm">{token.maxLeverage}x</p>
        </div>
      </div>
    </div>
  );
};
