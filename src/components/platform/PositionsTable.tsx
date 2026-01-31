import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Position, Token } from '@/types/token';
import { cn } from '@/lib/utils';

interface PositionsTableProps {
  positions: Position[];
  tokens: Token[];
  onClosePosition: (positionId: string) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({ positions, tokens, onClosePosition }) => {
  const getToken = (tokenId: string) => tokens.find(t => t.id === tokenId);

  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(3);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  if (positions.length === 0) {
    return (
      <div className="bg-card/50 border border-border rounded-xl p-6">
        <p className="text-muted-foreground text-center text-sm">No open positions</p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Open Positions ({positions.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left p-3 font-medium">Market</th>
              <th className="text-left p-3 font-medium">Side</th>
              <th className="text-right p-3 font-medium">Size</th>
              <th className="text-right p-3 font-medium">Entry</th>
              <th className="text-right p-3 font-medium">Mark</th>
              <th className="text-right p-3 font-medium">Liq. Price</th>
              <th className="text-right p-3 font-medium">PnL</th>
              <th className="text-center p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const token = getToken(position.tokenId);
              if (!token) return null;
              
              const isPnlPositive = position.unrealizedPnl >= 0;
              const pnlPercent = (position.unrealizedPnl / position.margin) * 100;
              
              return (
                <tr key={position.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{token.logo}</span>
                      <span className="font-semibold text-foreground">{token.symbol}-PERP</span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {position.leverage}x
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
                      position.side === 'long' 
                        ? "bg-primary/20 text-primary" 
                        : "bg-destructive/20 text-destructive"
                    )}>
                      {position.side === 'long' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {position.side.toUpperCase()}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-foreground">
                    {position.size.toLocaleString()} SUPRA
                  </td>
                  <td className="p-3 text-right font-mono text-foreground">
                    ${formatPrice(position.entryPrice)}
                  </td>
                  <td className="p-3 text-right font-mono text-foreground">
                    ${formatPrice(token.price)}
                  </td>
                  <td className="p-3 text-right font-mono text-muted-foreground">
                    ${formatPrice(position.liquidationPrice)}
                  </td>
                  <td className="p-3 text-right">
                    <div className={cn(
                      "font-semibold",
                      isPnlPositive ? "text-primary" : "text-destructive"
                    )}>
                      {isPnlPositive ? '+' : ''}{position.unrealizedPnl.toFixed(2)} SUPRA
                    </div>
                    <div className={cn(
                      "text-xs",
                      isPnlPositive ? "text-primary" : "text-destructive"
                    )}>
                      ({isPnlPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClosePosition(position.id)}
                      className="hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
