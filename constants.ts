
import { ColorChoice, BigSmallChoice, GameMode } from './types';

export const NUMBERS_TO_COLORS: Record<number, ColorChoice[]> = {
  0: ['RED', 'VIOLET'],
  1: ['GREEN'],
  2: ['RED'],
  3: ['GREEN'],
  4: ['RED'],
  5: ['GREEN', 'VIOLET'],
  6: ['RED'],
  7: ['GREEN'],
  8: ['RED'],
  9: ['GREEN'],
};

export const MODE_DURATIONS: Record<GameMode, number> = {
  '30S': 30,
  '1M': 60,
  '3M': 180,
  '5M': 300,
};

export const getColorByNumber = (num: number): ColorChoice[] => {
  return NUMBERS_TO_COLORS[num] || [];
};

export const getBigSmallByNumber = (num: number): BigSmallChoice => {
  return num >= 5 ? 'BIG' : 'SMALL';
};

export const BET_MULTIPLIERS = {
  COLOR: 2,
  VIOLET_COLOR: 4.5,
  BIG_SMALL: 2,
  NUMBER: 9,
};

export const TIMER_DURATION = 60; // Default fallback
