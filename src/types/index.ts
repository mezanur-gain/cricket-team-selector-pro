
export interface Player {
  id: string;
  name: string;
  imageUrl: string;
  weight: number;
  isCaptain?: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  captain?: Player;
}

export enum AppStep {
  ADD_PLAYERS = 'add_players',
  FORM_TEAMS = 'form_teams',
  SELECT_CAPTAINS = 'select_captains',
  TOSS = 'toss',
  RESULT = 'result'
}

export type TossResult = 'heads' | 'tails' | null;
