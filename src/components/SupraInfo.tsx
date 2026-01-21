import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

export const SupraInfo: React.FC = () => {
  return (
    <div className="game-card rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-crash-yellow/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-crash-yellow" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold">Powered by Supra dVRF</h3>
          <p className="text-muted-foreground text-sm">Verifiable Random Function</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-crash-green mt-0.5" />
          <div>
            <p className="text-foreground text-sm font-medium">Provably Fair</p>
            <p className="text-muted-foreground text-xs">
              Every crash point is generated using Supra's decentralized VRF
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-crash-blue mt-0.5" />
          <div>
            <p className="text-foreground text-sm font-medium">Tamper-Proof</p>
            <p className="text-muted-foreground text-xs">
              Cryptographic verification ensures no manipulation
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-crash-yellow mt-0.5" />
          <div>
            <p className="text-foreground text-sm font-medium">Instant Results</p>
            <p className="text-muted-foreground text-xs">
              Sub-second randomness generation with on-chain verification
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-muted-foreground text-xs text-center">
          House Edge: 3% • RTP: 97%
        </p>
      </div>
    </div>
  );
};
