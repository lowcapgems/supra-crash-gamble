import { useState } from 'react';
import { Header } from '@/components/platform/Header';
import { TrendingBar } from '@/components/platform/TrendingBar';
import { TokenCard } from '@/components/platform/TokenCard';
import { LiveTrades } from '@/components/platform/LiveTrades';
import { TokenModal } from '@/components/platform/TokenModal';
import { StatsCards } from '@/components/platform/StatsCards';
import { mockTokens, mockTrades } from '@/data/mockTokens';
import { Token } from '@/types/token';
import { Search, Filter, Flame, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [balance, setBalance] = useState(10000);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'hot' | 'new' | 'gainers'>('all');
  const { toast } = useToast();

  const filteredTokens = mockTokens
    .filter(token => {
      const matchesSearch = token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           token.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (filter) {
        case 'hot': return token.isHot;
        case 'new': return token.isNew;
        case 'gainers': return token.priceChange24h > 0;
        default: return true;
      }
    })
    .sort((a, b) => {
      if (filter === 'gainers') return b.priceChange24h - a.priceChange24h;
      return b.volume24h - a.volume24h;
    });

  const totalVolume = mockTokens.reduce((sum, t) => sum + t.volume24h, 0);
  const totalHolders = mockTokens.reduce((sum, t) => sum + t.holders, 0);

  const handleTrade = (tokenId: string, type: 'buy' | 'sell', amount: number) => {
    const token = mockTokens.find(t => t.id === tokenId);
    if (!token) return;

    if (type === 'buy') {
      if (amount > balance) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough SUPRA for this trade.",
          variant: "destructive",
        });
        return;
      }
      setBalance(prev => prev - amount);
      toast({
        title: "Trade successful! 🎉",
        description: `Bought ${(amount / token.price).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${token.symbol}`,
      });
    } else {
      setBalance(prev => prev + amount);
      toast({
        title: "Trade successful! 💰",
        description: `Sold tokens for ${amount.toLocaleString()} SUPRA`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header balance={balance} />
      <TrendingBar tokens={mockTokens} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6">
          <StatsCards 
            totalTokens={mockTokens.length}
            totalVolume={totalVolume}
            totalHolders={totalHolders}
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search gems by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={filter === 'hot' ? 'default' : 'outline'}
              onClick={() => setFilter('hot')}
              className="gap-2"
            >
              <Flame className="w-4 h-4" />
              Hot
            </Button>
            <Button
              variant={filter === 'new' ? 'default' : 'outline'}
              onClick={() => setFilter('new')}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              New
            </Button>
            <Button
              variant={filter === 'gainers' ? 'default' : 'outline'}
              onClick={() => setFilter('gainers')}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Gainers
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Token Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-foreground mb-4">
              💎 Discover Gems
              <span className="text-muted-foreground text-sm font-normal ml-2">
                {filteredTokens.length} tokens
              </span>
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredTokens.map(token => (
                <TokenCard 
                  key={token.id} 
                  token={token} 
                  onClick={setSelectedToken}
                />
              ))}
            </div>
            
            {filteredTokens.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No gems found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LiveTrades trades={mockTrades} tokens={mockTokens} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            LOW CAP GEMS • Built on SUPRA Labs • Trade responsibly 💎
          </p>
        </div>
      </footer>

      {/* Token Modal */}
      {selectedToken && (
        <TokenModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
          onTrade={handleTrade}
          balance={balance}
        />
      )}
    </div>
  );
};

export default Index;
