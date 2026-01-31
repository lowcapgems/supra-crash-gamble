import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade, Token } from '@/types/token';

interface LiveTradesProps {
  trades: Trade[];
  tokens: Token[];
}

export const LiveTrades: React.FC<LiveTradesProps> = ({ trades, tokens }) => {
  const getToken = (tokenId: string) => tokens.find(t => t.id === tokenId);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Live Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trades.map((trade) => {
          const token = getToken(trade.tokenId);
          if (!token) return null;
          
          const isBuy = trade.type === 'buy';
          
          return (
            <div 
              key={trade.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isBuy 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-destructive/5 border-destructive/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isBuy ? 'bg-primary/20' : 'bg-destructive/20'
                }`}>
                  {isBuy ? (
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{token.logo}</span>
                    <span className="font-semibold text-foreground">{token.symbol}</span>
                    <span className={`text-xs font-medium ${isBuy ? 'text-primary' : 'text-destructive'}`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">{trade.user}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatAmount(trade.amount)}</p>
                <p className="text-muted-foreground text-xs">Just now</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
