import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Token } from '@/types/token';
import { cn } from '@/lib/utils';

interface TradingPanelProps {
  token: Token;
  balance: number;
  onPlaceOrder: (side: 'long' | 'short', size: number, leverage: number) => void;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ token, balance, onPlaceOrder }) => {
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState(10);

  const sizeNum = parseFloat(size) || 0;
  const positionSize = sizeNum * leverage;
  const estimatedTokens = positionSize / token.price;
  
  const liquidationPrice = side === 'long'
    ? token.price * (1 - 1 / leverage * 0.9)
    : token.price * (1 + 1 / leverage * 0.9);

  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(4);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(6);
  };

  const handleTrade = () => {
    if (sizeNum <= 0 || sizeNum > balance) return;
    onPlaceOrder(side, sizeNum, leverage);
    setSize('');
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Trade {token.symbol}-PERP</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Long/Short Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'long' ? 'default' : 'outline'}
            className={cn(
              "font-semibold",
              side === 'long' && "bg-primary hover:bg-primary/90"
            )}
            onClick={() => setSide('long')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Long
          </Button>
          <Button
            variant={side === 'short' ? 'default' : 'outline'}
            className={cn(
              "font-semibold",
              side === 'short' && "bg-destructive hover:bg-destructive/90"
            )}
            onClick={() => setSide('short')}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Short
          </Button>
        </div>

        {/* Margin Input */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground text-xs">Margin (SUPRA)</Label>
            <span className="text-muted-foreground text-xs">
              Available: {balance.toLocaleString()}
            </span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="bg-muted/50 border-border font-mono"
          />
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setSize((balance * pct / 100).toFixed(2))}
              >
                {pct}%
              </Button>
            ))}
          </div>
        </div>

        {/* Leverage Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-muted-foreground text-xs">Leverage</Label>
            <span className="text-foreground font-semibold bg-muted px-2 py-1 rounded text-sm">
              {leverage}x
            </span>
          </div>
          <Slider
            value={[leverage]}
            onValueChange={(val) => setLeverage(val[0])}
            max={token.maxLeverage}
            min={1}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>{token.maxLeverage}x</span>
          </div>
        </div>

        {/* Position Info */}
        {sizeNum > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position Size</span>
              <span className="text-foreground font-mono">{positionSize.toLocaleString()} SUPRA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Tokens</span>
              <span className="text-foreground font-mono">
                {estimatedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} {token.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Liq. Price
                <Info className="w-3 h-3" />
              </span>
              <span className={cn(
                "font-mono",
                side === 'long' ? 'text-destructive' : 'text-primary'
              )}>
                ${formatPrice(liquidationPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Trade Button */}
        <Button 
          className={cn(
            "w-full text-lg py-6 font-bold",
            side === 'long' 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-destructive hover:bg-destructive/90"
          )}
          onClick={handleTrade}
          disabled={sizeNum <= 0 || sizeNum > balance}
        >
          {side === 'long' ? '🚀 Long' : '📉 Short'} {token.symbol}
        </Button>

        {/* Funding Rate */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Funding Rate (8h)</span>
          <span className={cn(
            "font-mono",
            token.fundingRate >= 0 ? 'text-primary' : 'text-destructive'
          )}>
            {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(4)}%
          </span>
        </div>
      </div>
    </div>
  );
};
