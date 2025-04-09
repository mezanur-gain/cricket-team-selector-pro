
import { useContext } from 'react';
import { CricketContext } from './CricketContext';
import { CricketContextType } from './CricketContextTypes';

export const useCricket = (): CricketContextType => {
  const context = useContext(CricketContext);
  if (context === undefined) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
