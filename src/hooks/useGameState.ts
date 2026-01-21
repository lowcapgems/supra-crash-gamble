import { useState, useCallback, useRef, useEffect } from 'react';

export type GamePhase = 'betting' | 'running' | 'crashed';

export interface GameState {
  phase: GamePhase;
  multiplier: number;
  crashPoint: number;
  timeElapsed: number;
  bettingTimeLeft: number;
}

export interface Bet {
  amount: number;
  cashedOutAt: number | null;
  profit: number | null;
}

// Simulates Supra dVRF - generates crash point using verifiable randomness
const generateCrashPoint = (): number => {
  // Using cryptographic randomness to simulate Supra's dVRF
  // In production, this would call Supra's rng_request and verify_callback
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  const normalized = randomValue / 0xFFFFFFFF; // 0 to 1
  
  // House edge of 3% - standard for crash games
  const houseEdge = 0.03;
  
  // Crash point formula: ensures fair distribution with house edge
  // E[payout] = 1 - houseEdge when betting on any multiplier
  const crashPoint = Math.max(1, (1 - houseEdge) / (1 - normalized));
  
  return Math.min(crashPoint, 1000); // Cap at 1000x for display purposes
};

const BETTING_TIME = 5; // 5 seconds to place bets
const TICK_RATE = 50; // Update every 50ms

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'betting',
    multiplier: 1.00,
    crashPoint: 0,
    timeElapsed: 0,
    bettingTimeLeft: BETTING_TIME,
  });

  const [bet, setBet] = useState<Bet | null>(null);
  const [balance, setBalance] = useState(1000); // Starting balance
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Calculate multiplier based on time (exponential growth)
  const calculateMultiplier = useCallback((elapsedMs: number): number => {
    // Multiplier grows exponentially: starts slow, accelerates
    const seconds = elapsedMs / 1000;
    return Math.pow(Math.E, 0.1 * seconds);
  }, []);

  // Start the game round
  const startRound = useCallback(() => {
    const crashPoint = generateCrashPoint();
    
    setGameState(prev => ({
      ...prev,
      phase: 'running',
      multiplier: 1.00,
      crashPoint,
      timeElapsed: 0,
    }));

    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const currentMultiplier = calculateMultiplier(elapsed);

      if (currentMultiplier >= crashPoint) {
        // Crashed!
        setGameState(prev => ({
          ...prev,
          phase: 'crashed',
          multiplier: crashPoint,
        }));
        
        setGameHistory(prev => [crashPoint, ...prev.slice(0, 19)]);
        
        // Check if player lost their bet
        setBet(prev => {
          if (prev && prev.cashedOutAt === null) {
            return { ...prev, profit: -prev.amount };
          }
          return prev;
        });

        // Start new betting phase after 3 seconds
        setTimeout(() => {
          setGameState({
            phase: 'betting',
            multiplier: 1.00,
            crashPoint: 0,
            timeElapsed: 0,
            bettingTimeLeft: BETTING_TIME,
          });
          setBet(null);
        }, 3000);

        return;
      }

      setGameState(prev => ({
        ...prev,
        multiplier: currentMultiplier,
        timeElapsed: elapsed,
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [calculateMultiplier]);

  // Betting phase countdown
  useEffect(() => {
    if (gameState.phase !== 'betting') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.bettingTimeLeft - 0.1;
        if (newTime <= 0) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, bettingTimeLeft: newTime };
      });
    }, 100);

    const timeout = setTimeout(() => {
      startRound();
    }, BETTING_TIME * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [gameState.phase, startRound]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Place a bet
  const placeBet = useCallback((amount: number) => {
    if (gameState.phase !== 'betting') return false;
    if (amount > balance || amount <= 0) return false;

    setBalance(prev => prev - amount);
    setBet({
      amount,
      cashedOutAt: null,
      profit: null,
    });

    return true;
  }, [gameState.phase, balance]);

  // Cash out current bet
  const cashOut = useCallback(() => {
    if (gameState.phase !== 'running' || !bet || bet.cashedOutAt !== null) return false;

    const profit = bet.amount * gameState.multiplier - bet.amount;
    const payout = bet.amount + profit;

    setBalance(prev => prev + payout);
    setBet(prev => prev ? {
      ...prev,
      cashedOutAt: gameState.multiplier,
      profit,
    } : null);

    return true;
  }, [gameState.phase, gameState.multiplier, bet]);

  // Cancel bet during betting phase
  const cancelBet = useCallback(() => {
    if (gameState.phase !== 'betting' || !bet) return false;

    setBalance(prev => prev + bet.amount);
    setBet(null);

    return true;
  }, [gameState.phase, bet]);

  return {
    gameState,
    bet,
    balance,
    gameHistory,
    placeBet,
    cashOut,
    cancelBet,
    setBalance,
  };
};
