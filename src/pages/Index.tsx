import { useState } from 'react';
import { Header } from '@/components/platform/Header';
import { MarketList } from '@/components/platform/MarketList';
import { PriceChart } from '@/components/platform/PriceChart';
import { TradingPanel } from '@/components/platform/TradingPanel';
import { PositionsTable } from '@/components/platform/PositionsTable';
import { RecentTrades } from '@/components/platform/RecentTrades';
import { mockTokens, mockPositions, mockTrades } from '@/data/mockTokens';
import { Token, Position } from '@/types/token';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [selectedToken, setSelectedToken] = useState<Token>(mockTokens[0]);
  const { toast } = useToast();

  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
  const equity = balance + totalUnrealizedPnl;

  const handlePlaceOrder = (side: 'long' | 'short', margin: number, leverage: number) => {
    if (margin > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough SUPRA for this position.",
        variant: "destructive",
      });
      return;
    }

    const positionSize = margin * leverage;
    const liquidationPrice = side === 'long'
      ? selectedToken.price * (1 - 1 / leverage * 0.9)
      : selectedToken.price * (1 + 1 / leverage * 0.9);

    const newPosition: Position = {
      id: Date.now().toString(),
      tokenId: selectedToken.id,
      side,
      size: positionSize,
      entryPrice: selectedToken.price,
      leverage,
      liquidationPrice,
      unrealizedPnl: 0,
      margin,
      timestamp: new Date(),
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => prev - margin);

    toast({
      title: `${side === 'long' ? '🚀' : '📉'} Position Opened!`,
      description: `${side.toUpperCase()} ${selectedToken.symbol} ${positionSize.toLocaleString()} SUPRA @ ${leverage}x`,
    });
  };

  const handleClosePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const token = mockTokens.find(t => t.id === position.tokenId);
    if (!token) return;

    const pnl = position.unrealizedPnl;
    const returnAmount = position.margin + pnl;

    setPositions(prev => prev.filter(p => p.id !== positionId));
    setBalance(prev => prev + returnAmount);

    toast({
      title: pnl >= 0 ? "💰 Position Closed!" : "📉 Position Closed",
      description: `${pnl >= 0 ? 'Profit' : 'Loss'}: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} SUPRA`,
      variant: pnl >= 0 ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        balance={balance} 
        equity={equity}
        unrealizedPnl={totalUnrealizedPnl}
      />
      
      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-12 gap-4">
          {/* Left Sidebar - Markets */}
          <div className="lg:col-span-2">
            <MarketList 
              tokens={mockTokens} 
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
            />
          </div>

          {/* Main Content - Chart & Positions */}
          <div className="lg:col-span-7 space-y-4">
            <PriceChart token={selectedToken} />
            <PositionsTable 
              positions={positions} 
              tokens={mockTokens}
              onClosePosition={handleClosePosition}
            />
          </div>

          {/* Right Sidebar - Trading & Trades */}
          <div className="lg:col-span-3 space-y-4">
            <TradingPanel 
              token={selectedToken}
              balance={balance}
              onPlaceOrder={handlePlaceOrder}
            />
            <RecentTrades trades={mockTrades} tokens={mockTokens} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-xs">
            LOW CAP GEMS • Meme Perpetuals on SUPRA Labs • Trade responsibly 💎
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
