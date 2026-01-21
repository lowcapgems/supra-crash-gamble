import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GamePhase, Bet } from '@/hooks/useGameState';

interface BettingPanelProps {
  phase: GamePhase;
  balance: number;
  bet: Bet | null;
  bettingTimeLeft: number;
  currentMultiplier: number;
  onPlaceBet: (amount: number) => boolean;
  onCashOut: () => boolean;
  onCancelBet: () => boolean;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({
  phase,
  balance,
  bet,
  bettingTimeLeft,
  currentMultiplier,
  onPlaceBet,
  onCashOut,
  onCancelBet,
}) => {
  const [betAmount, setBetAmount] = useState('10');

  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (!isNaN(amount) && amount > 0) {
      onPlaceBet(amount);
    }
  };

  const handleQuickBet = (multiplier: number) => {
    const newAmount = Math.min(parseFloat(betAmount) * multiplier, balance);
    setBetAmount(newAmount.toFixed(2));
  };

  const potentialWin = bet ? bet.amount * currentMultiplier : 0;

  return (
    <div className="game-card rounded-xl p-6 space-y-6">
      {/* Balance display */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Balance</span>
        <span className="text-foreground font-mono text-xl font-semibold">
          {balance.toFixed(2)} <span className="text-crash-yellow">SUPRA</span>
        </span>
      </div>

      {/* Betting time indicator */}
      {phase === 'betting' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Betting closes in</span>
            <span className="text-crash-yellow font-mono font-semibold">
              {bettingTimeLeft.toFixed(1)}s
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-crash-yellow transition-all duration-100 rounded-full"
              style={{ width: `${(bettingTimeLeft / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bet input */}
      {!bet && phase === 'betting' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">Bet Amount</label>
            <div className="relative">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-secondary border-border text-foreground font-mono text-lg pr-20"
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-crash-yellow text-sm font-semibold">
                SUPRA
              </span>
            </div>
          </div>

          {/* Quick bet buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickBet(0.5)}
              className="text-xs"
            >
              ½
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuickBet(2)}
              className="text-xs"
            >
              2×
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBetAmount(Math.floor(balance / 2).toString())}
              className="text-xs"
            >
              Half
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBetAmount(Math.floor(balance).toString())}
              className="text-xs"
            >
              Max
            </Button>
          </div>

          <Button
            className="w-full bg-crash-green hover:bg-crash-green/90 text-primary-foreground font-semibold text-lg h-14 glow-green"
            onClick={handlePlaceBet}
            disabled={parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0}
          >
            Place Bet
          </Button>
        </div>
      )}

      {/* Active bet - betting phase (can cancel) */}
      {bet && phase === 'betting' && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Your Bet</span>
              <span className="text-foreground font-mono font-semibold">
                {bet.amount.toFixed(2)} SUPRA
              </span>
            </div>
            <p className="text-crash-green text-sm">Waiting for round to start...</p>
          </div>

          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={onCancelBet}
          >
            Cancel Bet
          </Button>
        </div>
      )}

      {/* Active bet - game running (can cash out) */}
      {bet && phase === 'running' && bet.cashedOutAt === null && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Your Bet</span>
              <span className="text-foreground font-mono font-semibold">
                {bet.amount.toFixed(2)} SUPRA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Current Payout</span>
              <span className="text-crash-green font-mono font-semibold text-xl">
                {potentialWin.toFixed(2)} SUPRA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Profit</span>
              <span className="text-crash-green font-mono">
                +{(potentialWin - bet.amount).toFixed(2)} SUPRA
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-crash-green hover:bg-crash-green/90 text-primary-foreground font-semibold text-xl h-16 glow-green pulse-green"
            onClick={onCashOut}
          >
            Cash Out @ {currentMultiplier.toFixed(2)}x
          </Button>
        </div>
      )}

      {/* Cashed out */}
      {bet && bet.cashedOutAt !== null && phase === 'running' && (
        <div className="space-y-4">
          <div className="bg-crash-green/20 border border-crash-green rounded-lg p-4 space-y-2">
            <p className="text-crash-green font-semibold text-center">Cashed Out!</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">At Multiplier</span>
              <span className="text-crash-green font-mono font-semibold">
                {bet.cashedOutAt.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Profit</span>
              <span className="text-crash-green font-mono font-semibold">
                +{bet.profit?.toFixed(2)} SUPRA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Crashed - show result */}
      {phase === 'crashed' && bet && (
        <div className="space-y-4 animate-fade-in">
          {bet.cashedOutAt !== null ? (
            <div className="bg-crash-green/20 border border-crash-green rounded-lg p-4 text-center">
              <p className="text-crash-green font-bold text-xl">You Won!</p>
              <p className="text-crash-green font-mono text-2xl mt-2">
                +{bet.profit?.toFixed(2)} SUPRA
              </p>
            </div>
          ) : (
            <div className="bg-crash-red/20 border border-crash-red rounded-lg p-4 text-center">
              <p className="text-crash-red font-bold text-xl">Busted!</p>
              <p className="text-crash-red font-mono text-2xl mt-2">
                -{bet.amount.toFixed(2)} SUPRA
              </p>
            </div>
          )}
        </div>
      )}

      {/* No bet during game */}
      {!bet && phase === 'running' && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Wait for next round to bet</p>
        </div>
      )}

      {!bet && phase === 'crashed' && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">New round starting soon...</p>
        </div>
      )}
    </div>
  );
};
