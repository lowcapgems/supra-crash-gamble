import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Users, BarChart3, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/types/token';

interface TokenModalProps {
  token: Token;
  onClose: () => void;
  onTrade: (tokenId: string, type: 'buy' | 'sell', amount: number) => void;
  balance: number;
}

export const TokenModal: React.FC<TokenModalProps> = ({ token, onClose, onTrade, balance }) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');

  const isPositive = token.priceChange24h >= 0;
  
  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(4);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(6);
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1000000) return `$${(mc / 1000000).toFixed(2)}M`;
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };

  const estimatedTokens = amount ? parseFloat(amount) / token.price : 0;

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onTrade(token.id, tradeType, parseFloat(amount));
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-4xl">
              {token.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{token.symbol}</h2>
                {token.isHot && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30">🔥 HOT</Badge>
                )}
                {token.isNew && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">✨ NEW</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-muted-foreground text-sm mb-1">Price</p>
              <p className="text-xl font-bold text-foreground font-mono">
                ${formatPrice(token.price)}
              </p>
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                isPositive ? 'text-primary' : 'text-destructive'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}% (24h)
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-muted-foreground text-sm mb-1">Market Cap</p>
              <p className="text-xl font-bold text-foreground">
                {formatMarketCap(token.marketCap)}
              </p>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                Vol: {formatMarketCap(token.volume24h)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{token.holders.toLocaleString()} holders</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Launched {token.launchDate.toLocaleDateString()}</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm bg-muted/30 p-3 rounded-lg">
            {token.description}
          </p>
        </div>

        {/* Trade Section */}
        <div className="p-6 border-t border-border space-y-4">
          <div className="flex gap-2">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              className={tradeType === 'buy' ? 'flex-1 bg-primary hover:bg-primary/90' : 'flex-1'}
              onClick={() => setTradeType('buy')}
            >
              Buy
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              className={tradeType === 'sell' ? 'flex-1 bg-destructive hover:bg-destructive/90' : 'flex-1'}
              onClick={() => setTradeType('sell')}
            >
              Sell
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Amount (SUPRA)</Label>
              <span className="text-muted-foreground text-sm">
                Balance: {balance.toLocaleString()} SUPRA
              </span>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-muted/50 border-border text-lg font-mono"
            />
            {amount && (
              <p className="text-muted-foreground text-sm">
                ≈ {estimatedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} {token.symbol}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setAmount((balance * pct / 100).toString())}
              >
                {pct}%
              </Button>
            ))}
          </div>

          <Button 
            className={`w-full text-lg py-6 font-semibold ${
              tradeType === 'buy' 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-destructive hover:bg-destructive/90'
            }`}
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
          </Button>

          <Button variant="ghost" className="w-full text-muted-foreground">
            <ExternalLink className="w-4 h-4 mr-2" />
            View on SUPRA Explorer
          </Button>
        </div>
      </div>
    </div>
  );
};
