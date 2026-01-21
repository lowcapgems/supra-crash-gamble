import { useGameState } from '@/hooks/useGameState';
import { CrashGraph } from '@/components/CrashGraph';
import { BettingPanel } from '@/components/BettingPanel';
import { GameHistory } from '@/components/GameHistory';
import { SupraInfo } from '@/components/SupraInfo';
import { Header } from '@/components/Header';

const Index = () => {
  const {
    gameState,
    bet,
    balance,
    gameHistory,
    placeBet,
    cashOut,
    cancelBet,
  } = useGameState();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main game area */}
          <div className="lg:col-span-2 space-y-6">
            <CrashGraph
              multiplier={gameState.multiplier}
              phase={gameState.phase}
              timeElapsed={gameState.timeElapsed}
            />
            <GameHistory history={gameHistory} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BettingPanel
              phase={gameState.phase}
              balance={balance}
              bet={bet}
              bettingTimeLeft={gameState.bettingTimeLeft}
              currentMultiplier={gameState.multiplier}
              onPlaceBet={placeBet}
              onCashOut={cashOut}
              onCancelBet={cancelBet}
            />
            <SupraInfo />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Demo game using simulated Supra dVRF • Gamble responsibly
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
