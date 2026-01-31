export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  openInterest: number;
  fundingRate: number;
  logo: string;
  maxLeverage: number;
}

export interface Position {
  id: string;
  tokenId: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  leverage: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  margin: number;
  timestamp: Date;
}

export interface Order {
  id: string;
  tokenId: string;
  side: 'long' | 'short';
  type: 'market' | 'limit';
  size: number;
  price?: number;
  leverage: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

export interface Trade {
  id: string;
  tokenId: string;
  side: 'long' | 'short';
  size: number;
  price: number;
  timestamp: Date;
  user: string;
}
