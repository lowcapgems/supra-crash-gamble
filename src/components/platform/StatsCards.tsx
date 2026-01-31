import React from 'react';
import { Gem, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  totalTokens: number;
  totalVolume: number;
  totalHolders: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ totalTokens, totalVolume, totalHolders }) => {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const stats = [
    {
      label: 'Active Gems',
      value: totalTokens.toString(),
      icon: Gem,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: '24h Volume',
      value: formatVolume(totalVolume),
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Holders',
      value: totalHolders.toLocaleString(),
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'TPS on SUPRA',
      value: '160K+',
      icon: Zap,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-foreground font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
