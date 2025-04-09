
import { v4 as uuidv4 } from 'uuid';
import { CricketState } from './CricketContextTypes';
import { Player, Team, AppStep, CaptainTossChoice, TossResult } from '../types';

type CricketAction =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'ADD_PLAYER'; payload: Omit<Player, 'id'> }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'MOVE_PLAYER'; payload: { playerId: string; teamId: string } }
  | { type: 'SELECT_CAPTAIN'; payload: { playerId: string; teamId: string } }
  | { type: 'PERFORM_TOSS'; payload: CaptainTossChoice }
  | { type: 'SET_TEAM_FORMATION_COMPLETE'; payload: boolean }
  | { type: 'SET_CAPTAIN_CHOICE'; payload: CaptainTossChoice }
  | { type: 'RESET_TO_STEP'; payload: AppStep };

// Initial state for the context
export const initialState: CricketState = {
  step: AppStep.ADD_PLAYERS,
  allPlayers: [],
  teamAlpha: {
    id: 'team-alpha',
    name: 'Team Alpha',
    players: [],
  },
  teamBeta: {
    id: 'team-beta',
    name: 'Team Beta',
    players: [],
  },
  tossResult: null,
  tossWinningTeam: null,
  isTeamFormationComplete: false,
  captainChoice: null,
};

export const cricketReducer = (state: CricketState, action: CricketAction): CricketState => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };

    case 'ADD_PLAYER': {
      const newPlayer = {
        ...action.payload,
        id: uuidv4(),
      };
      return {
        ...state,
        allPlayers: [...state.allPlayers, newPlayer],
      };
    }

    case 'REMOVE_PLAYER': {
      const playerId = action.payload;
      return {
        ...state,
        allPlayers: state.allPlayers.filter((player) => player.id !== playerId),
        teamAlpha: {
          ...state.teamAlpha,
          players: state.teamAlpha.players.filter((player) => player.id !== playerId),
        },
        teamBeta: {
          ...state.teamBeta,
          players: state.teamBeta.players.filter((player) => player.id !== playerId),
        },
      };
    }

    case 'MOVE_PLAYER': {
      const { playerId, teamId } = action.payload;
      const player = [...state.allPlayers, ...state.teamAlpha.players, ...state.teamBeta.players]
        .find((p) => p.id === playerId);
      
      if (!player) return state;

      const updatedAllPlayers = state.allPlayers.filter((p) => p.id !== playerId);
      const updatedTeamAlpha = {
        ...state.teamAlpha,
        players: state.teamAlpha.players.filter((p) => p.id !== playerId),
      };
      const updatedTeamBeta = {
        ...state.teamBeta,
        players: state.teamBeta.players.filter((p) => p.id !== playerId),
      };

      if (teamId === 'team-alpha') {
        updatedTeamAlpha.players.push(player);
      } else if (teamId === 'team-beta') {
        updatedTeamBeta.players.push(player);
      }

      return {
        ...state,
        allPlayers: updatedAllPlayers,
        teamAlpha: updatedTeamAlpha,
        teamBeta: updatedTeamBeta,
      };
    }

    case 'SELECT_CAPTAIN': {
      const { playerId, teamId } = action.payload;
      
      if (teamId === 'team-alpha') {
        const newTeam = {...state.teamAlpha};
        
        newTeam.players = newTeam.players.map(player => ({
          ...player,
          isCaptain: player.id === playerId
        }));
        
        newTeam.captain = newTeam.players.find(p => p.id === playerId);
        
        return {
          ...state,
          teamAlpha: newTeam
        };
      } else if (teamId === 'team-beta') {
        const newTeam = {...state.teamBeta};
        
        newTeam.players = newTeam.players.map(player => ({
          ...player,
          isCaptain: player.id === playerId
        }));
        
        newTeam.captain = newTeam.players.find(p => p.id === playerId);
        
        return {
          ...state,
          teamBeta: newTeam
        };
      }
      return state;
    }

    case 'PERFORM_TOSS': {
      const captainChoice = action.payload;
      const result: TossResult = Math.random() > 0.5 ? 'heads' : 'tails';
      
      const callingTeamId = captainChoice.teamId;
      const callingChoice = captainChoice.choice;
      
      const winningTeamId = callingChoice === result ? callingTeamId : 
        (callingTeamId === 'team-alpha' ? 'team-beta' : 'team-alpha');
      
      const winningTeam = winningTeamId === 'team-alpha' ? state.teamAlpha : state.teamBeta;
      
      return {
        ...state,
        tossResult: result,
        tossWinningTeam: winningTeam,
      };
    }

    case 'SET_TEAM_FORMATION_COMPLETE':
      return {
        ...state,
        isTeamFormationComplete: action.payload,
      };

    case 'SET_CAPTAIN_CHOICE':
      return {
        ...state,
        captainChoice: action.payload,
      };

    case 'RESET_TO_STEP': {
      const targetStep = action.payload;
      let newState = { ...state };
      
      if (targetStep === AppStep.ADD_PLAYERS) {
        newState = {
          ...initialState,
        };
      } else if (targetStep === AppStep.FORM_TEAMS) {
        const allTeamPlayers = [...state.teamAlpha.players, ...state.teamBeta.players];
        newState = {
          ...state,
          allPlayers: [...state.allPlayers, ...allTeamPlayers],
          teamAlpha: {
            ...state.teamAlpha,
            players: [],
            captain: undefined,
          },
          teamBeta: {
            ...state.teamBeta,
            players: [],
            captain: undefined,
          },
          tossResult: null,
          tossWinningTeam: null,
          isTeamFormationComplete: false,
          captainChoice: null,
        };
      } else if (targetStep === AppStep.SELECT_CAPTAINS) {
        newState = {
          ...state,
          teamAlpha: {
            ...state.teamAlpha,
            players: state.teamAlpha.players.map(p => ({ ...p, isCaptain: false })),
            captain: undefined,
          },
          teamBeta: {
            ...state.teamBeta,
            players: state.teamBeta.players.map(p => ({ ...p, isCaptain: false })),
            captain: undefined,
          },
          tossResult: null,
          tossWinningTeam: null,
          captainChoice: null,
        };
      } else if (targetStep === AppStep.TOSS) {
        newState = {
          ...state,
          tossResult: null,
          tossWinningTeam: null,
          captainChoice: null,
        };
      }
      
      newState.step = targetStep;
      return newState;
    }

    default:
      return state;
  }
};
