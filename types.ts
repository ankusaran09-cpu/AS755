
export type ColorChoice = 'RED' | 'GREEN' | 'VIOLET';
export type BigSmallChoice = 'BIG' | 'SMALL';
export type GameMode = '30S' | '1M' | '3M' | '5M';

export interface Bet {
  id: string;
  periodId: string;
  mode: GameMode;
  amount: number;
  selection: ColorChoice | number | BigSmallChoice;
  timestamp: number;
  status: 'PENDING' | 'WIN' | 'LOSS';
  payout?: number;
}

export interface GameResult {
  periodId: string;
  mode: GameMode;
  number: number;
  colors: ColorChoice[];
  bigSmall: BigSmallChoice;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: number;
  details: string;
}

export interface UserState {
  balance: number;
  phone: string;
  isAuthenticated: boolean;
}
