
import React, { createContext, useReducer } from 'react';
import { CricketContextType, CricketProviderProps } from './CricketContextTypes';
import { cricketReducer, initialState } from './CricketReducer';
import { AppStep, CaptainTossChoice } from '../types';

// Create the context
const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider: React.FC<CricketProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cricketReducer, initialState);

  // Action creators
  const setStep = (step: AppStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const addPlayer = (player: Omit<never, 'id'>) => {
    dispatch({ type: 'ADD_PLAYER', payload: player });
  };

  const removePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  const movePlayerToTeam = (playerId: string, teamId: string) => {
    dispatch({ type: 'MOVE_PLAYER', payload: { playerId, teamId } });
  };

  const selectCaptain = (playerId: string, teamId: string) => {
    dispatch({ type: 'SELECT_CAPTAIN', payload: { playerId, teamId } });
  };

  const performToss = () => {
    if (state.captainChoice) {
      dispatch({ type: 'PERFORM_TOSS', payload: state.captainChoice });
    }
  };

  const resetToStep = (step: AppStep) => {
    dispatch({ type: 'RESET_TO_STEP', payload: step });
  };

  const setIsTeamFormationComplete = (value: boolean) => {
    dispatch({ type: 'SET_TEAM_FORMATION_COMPLETE', payload: value });
  };

  const setCaptainChoice = (choice: CaptainTossChoice) => {
    dispatch({ type: 'SET_CAPTAIN_CHOICE', payload: choice });
  };

  // Combine state and actions for the context value
  const contextValue: CricketContextType = {
    ...state,
    setStep,
    addPlayer,
    removePlayer,
    movePlayerToTeam,
    selectCaptain,
    performToss,
    resetToStep,
    setIsTeamFormationComplete,
    setCaptainChoice,
  };

  return (
    <CricketContext.Provider value={contextValue}>
      {children}
    </CricketContext.Provider>
  );
};

// Export the hook for using the context
export { CricketContext };
