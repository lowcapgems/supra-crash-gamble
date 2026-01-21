import React from 'react';

interface GameHistoryProps {
  history: number[];
}

export const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
  return (
    <div className="game-card rounded-xl p-4">
      <h3 className="text-muted-foreground text-sm mb-3">Previous Rounds</h3>
      <div className="flex flex-wrap gap-2">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No games yet</p>
        ) : (
          history.map((crashPoint, index) => (
            <span
              key={index}
              className={`
                px-3 py-1 rounded-full font-mono text-sm font-semibold
                ${crashPoint >= 2 
                  ? 'bg-crash-green/20 text-crash-green' 
                  : 'bg-crash-red/20 text-crash-red'
                }
              `}
            >
              {crashPoint.toFixed(2)}x
            </span>
          ))
        )}
      </div>
    </div>
  );
};
