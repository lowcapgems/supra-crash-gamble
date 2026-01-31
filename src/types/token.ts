export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  logo: string;
  description: string;
  launchDate: Date;
  isHot?: boolean;
  isNew?: boolean;
}

export interface Trade {
  id: string;
  tokenId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  user: string;
}

export interface Portfolio {
  tokenId: string;
  amount: number;
  avgBuyPrice: number;
}
