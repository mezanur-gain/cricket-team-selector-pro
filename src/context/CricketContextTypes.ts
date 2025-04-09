
import { Player, Team, AppStep, TossResult, CaptainTossChoice } from '../types';
import { ReactNode } from 'react';

export interface CricketState {
  step: AppStep;
  allPlayers: Player[];
  teamAlpha: Team;
  teamBeta: Team;
  tossResult: TossResult;
  tossWinningTeam: Team | null;
  isTeamFormationComplete: boolean;
  captainChoice: CaptainTossChoice | null;
}

export interface CricketContextType extends CricketState {
  setStep: (step: AppStep) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  removePlayer: (playerId: string) => void;
  movePlayerToTeam: (playerId: string, teamId: string) => void;
  selectCaptain: (playerId: string, teamId: string) => void;
  performToss: () => void;
  resetToStep: (step: AppStep) => void;
  setIsTeamFormationComplete: (value: boolean) => void;
  setCaptainChoice: (choice: CaptainTossChoice) => void;
}

export interface CricketProviderProps {
  children: ReactNode;
}
