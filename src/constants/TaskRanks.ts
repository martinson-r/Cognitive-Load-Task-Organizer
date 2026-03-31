import { LoadLevel, PriorityLevel } from '../types';

export const LOAD_RANK: Record<LoadLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export const PRIORITY_RANK: Record<PriorityLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};