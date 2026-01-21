import React, { useMemo } from 'react';
import { GamePhase } from '@/hooks/useGameState';

interface CrashGraphProps {
  multiplier: number;
  phase: GamePhase;
  timeElapsed: number;
}

export const CrashGraph: React.FC<CrashGraphProps> = ({ multiplier, phase, timeElapsed }) => {
  const width = 600;
  const height = 400;
  const padding = 40;

  // Dynamic scaling based on current multiplier
  const maxDisplayMultiplier = useMemo(() => {
    return Math.max(multiplier * 1.3, 2); // Always show 30% headroom above current
  }, [multiplier]);

  const maxDisplayTime = useMemo(() => {
    return Math.max(timeElapsed * 1.3, 5000); // Always show 30% headroom
  }, [timeElapsed]);

  // Generate points for the line
  const pathData = useMemo(() => {
    if (phase === 'betting') return '';

    const points: string[] = [];
    const steps = Math.min(Math.floor(timeElapsed / 50), 200);
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / Math.max(steps, 1)) * timeElapsed;
      const m = Math.pow(Math.E, 0.1 * (t / 1000));
      
      // Scale to graph coordinates with dynamic scaling
      const xRatio = t / maxDisplayTime;
      const x = padding + xRatio * (width - padding * 2);
      
      const yRatio = (m - 1) / (maxDisplayMultiplier - 1);
      const y = height - padding - yRatio * (height - padding * 2);
      
      // Clamp to chart bounds
      const clampedX = Math.max(padding, Math.min(x, width - padding));
      const clampedY = Math.max(padding, Math.min(y, height - padding));
      
      if (i === 0) {
        points.push(`M ${clampedX} ${clampedY}`);
      } else {
        points.push(`L ${clampedX} ${clampedY}`);
      }
    }

    return points.join(' ');
  }, [timeElapsed, phase, maxDisplayMultiplier, maxDisplayTime]);

  // Current point position - always stays on chart
  const currentPoint = useMemo(() => {
    if (phase === 'betting') return null;
    
    const xRatio = timeElapsed / maxDisplayTime;
    const x = padding + xRatio * (width - padding * 2);
    
    const yRatio = (multiplier - 1) / (maxDisplayMultiplier - 1);
    const y = height - padding - yRatio * (height - padding * 2);
    
    // Clamp to chart bounds
    return { 
      x: Math.max(padding, Math.min(x, width - padding)), 
      y: Math.max(padding, Math.min(y, height - padding)) 
    };
  }, [timeElapsed, multiplier, phase, maxDisplayMultiplier, maxDisplayTime]);

  const isCrashed = phase === 'crashed';

  return (
    <div className="relative w-full aspect-[3/2] game-card rounded-xl overflow-hidden">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(142 76% 50%)" />
            <stop offset="100%" stopColor="hsl(142 100% 70%)" />
          </linearGradient>
          <linearGradient id="lineGradientCrashed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0 72% 55%)" />
            <stop offset="100%" stopColor="hsl(0 85% 60%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        <g className="opacity-20">
          {[1, 2, 3, 4, 5].map(i => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + ((height - padding * 2) / 5) * i}
              x2={width - padding}
              y2={padding + ((height - padding * 2) / 5) * i}
              stroke="hsl(var(--foreground))"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {[1, 2, 3, 4, 5].map(i => (
            <line
              key={`v-${i}`}
              x1={padding + ((width - padding * 2) / 5) * i}
              y1={padding}
              x2={padding + ((width - padding * 2) / 5) * i}
              y2={height - padding}
              stroke="hsl(var(--foreground))"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </g>

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
        />

        {/* The crash line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={isCrashed ? 'url(#lineGradientCrashed)' : 'url(#lineGradient)'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* Current point */}
        {currentPoint && (
          <g filter="url(#glow)">
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={isCrashed ? 10 : 8}
              fill={isCrashed ? 'hsl(var(--crash-red))' : 'hsl(var(--crash-green))'}
              className={isCrashed ? 'pulse-red' : 'pulse-green'}
            />
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={4}
              fill="white"
            />
          </g>
        )}
      </svg>

      {/* Multiplier display overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {phase === 'betting' && (
          <div className="text-center animate-fade-in">
            <p className="text-muted-foreground text-lg mb-2">Starting soon...</p>
            <p className="text-foreground text-sm">Place your bets!</p>
          </div>
        )}
        
        {phase === 'running' && (
          <div className={`text-center counting`}>
            <span className="multiplier-text font-mono text-6xl md:text-8xl font-bold">
              {multiplier.toFixed(2)}x
            </span>
          </div>
        )}
        
        {phase === 'crashed' && (
          <div className="text-center animate-shake">
            <span className="crashed-text font-mono text-6xl md:text-8xl font-bold">
              {multiplier.toFixed(2)}x
            </span>
            <p className="text-crash-red text-2xl font-semibold mt-2">CRASHED!</p>
          </div>
        )}
      </div>
    </div>
  );
};
