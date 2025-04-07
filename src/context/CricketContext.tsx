
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Player, Team, AppStep, TossResult } from '../types';

interface CricketContextType {
  step: AppStep;
  setStep: (step: AppStep) => void;
  allPlayers: Player[];
  teamAlpha: Team;
  teamBeta: Team;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  removePlayer: (playerId: string) => void;
  movePlayerToTeam: (playerId: string, teamId: string) => void;
  selectCaptain: (playerId: string, teamId: string) => void;
  tossResult: TossResult;
  performToss: () => void;
  tossWinningTeam: Team | null;
  resetToStep: (step: AppStep) => void;
  isTeamFormationComplete: boolean;
  setIsTeamFormationComplete: (value: boolean) => void;
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

export const CricketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<AppStep>(AppStep.ADD_PLAYERS);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [teamAlpha, setTeamAlpha] = useState<Team>({
    id: 'team-alpha',
    name: 'Team Alpha',
    players: [],
  });
  const [teamBeta, setTeamBeta] = useState<Team>({
    id: 'team-beta',
    name: 'Team Beta',
    players: [],
  });
  const [tossResult, setTossResult] = useState<TossResult>(null);
  const [tossWinningTeam, setTossWinningTeam] = useState<Team | null>(null);
  const [isTeamFormationComplete, setIsTeamFormationComplete] = useState(false);

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: uuidv4(),
    };
    setAllPlayers((prev) => [...prev, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    setAllPlayers((prev) => prev.filter((player) => player.id !== playerId));
    
    // Also remove from teams if present
    setTeamAlpha((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== playerId),
    }));
    
    setTeamBeta((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== playerId),
    }));
  };

  const movePlayerToTeam = (playerId: string, teamId: string) => {
    // Find the player
    const player = [...allPlayers, ...teamAlpha.players, ...teamBeta.players]
      .find((p) => p.id === playerId);
    
    if (!player) return;

    // Remove from source lists
    const updatedAllPlayers = allPlayers.filter((p) => p.id !== playerId);
    const updatedTeamAlpha = {
      ...teamAlpha,
      players: teamAlpha.players.filter((p) => p.id !== playerId),
    };
    const updatedTeamBeta = {
      ...teamBeta,
      players: teamBeta.players.filter((p) => p.id !== playerId),
    };

    // Add to destination team
    if (teamId === 'team-alpha') {
      updatedTeamAlpha.players.push(player);
    } else if (teamId === 'team-beta') {
      updatedTeamBeta.players.push(player);
    }

    // Update state
    setAllPlayers(updatedAllPlayers);
    setTeamAlpha(updatedTeamAlpha);
    setTeamBeta(updatedTeamBeta);
  };

  const selectCaptain = (playerId: string, teamId: string) => {
    if (teamId === 'team-alpha') {
      const newTeam = {...teamAlpha};
      
      // Reset any existing captain
      newTeam.players = newTeam.players.map(player => ({
        ...player,
        isCaptain: player.id === playerId
      }));
      
      // Set the new captain reference
      newTeam.captain = newTeam.players.find(p => p.id === playerId);
      
      setTeamAlpha(newTeam);
    } else if (teamId === 'team-beta') {
      const newTeam = {...teamBeta};
      
      // Reset any existing captain
      newTeam.players = newTeam.players.map(player => ({
        ...player,
        isCaptain: player.id === playerId
      }));
      
      // Set the new captain reference
      newTeam.captain = newTeam.players.find(p => p.id === playerId);
      
      setTeamBeta(newTeam);
    }
  };

  const performToss = () => {
    const result: TossResult = Math.random() > 0.5 ? 'heads' : 'tails';
    setTossResult(result);
    
    // Determine winning team (for simplicity, heads = Alpha, tails = Beta)
    const winningTeam = result === 'heads' ? teamAlpha : teamBeta;
    setTossWinningTeam(winningTeam);
  };

  const resetToStep = (targetStep: AppStep) => {
    if (targetStep === AppStep.ADD_PLAYERS) {
      setAllPlayers([]);
      setTeamAlpha({
        id: 'team-alpha',
        name: 'Team Alpha',
        players: [],
      });
      setTeamBeta({
        id: 'team-beta',
        name: 'Team Beta',
        players: [],
      });
      setTossResult(null);
      setTossWinningTeam(null);
      setIsTeamFormationComplete(false);
    } else if (targetStep === AppStep.FORM_TEAMS) {
      // Move all players back to the pool
      const allTeamPlayers = [...teamAlpha.players, ...teamBeta.players];
      setAllPlayers((prev) => [...prev, ...allTeamPlayers]);
      setTeamAlpha({
        ...teamAlpha,
        players: [],
        captain: undefined,
      });
      setTeamBeta({
        ...teamBeta,
        players: [],
        captain: undefined,
      });
      setTossResult(null);
      setTossWinningTeam(null);
      setIsTeamFormationComplete(false);
    } else if (targetStep === AppStep.SELECT_CAPTAINS) {
      // Reset captain selections
      setTeamAlpha({
        ...teamAlpha,
        players: teamAlpha.players.map(p => ({ ...p, isCaptain: false })),
        captain: undefined,
      });
      setTeamBeta({
        ...teamBeta,
        players: teamBeta.players.map(p => ({ ...p, isCaptain: false })),
        captain: undefined,
      });
      setTossResult(null);
      setTossWinningTeam(null);
    } else if (targetStep === AppStep.TOSS) {
      setTossResult(null);
      setTossWinningTeam(null);
    }
    
    setStep(targetStep);
  };

  return (
    <CricketContext.Provider
      value={{
        step,
        setStep,
        allPlayers,
        teamAlpha,
        teamBeta,
        addPlayer,
        removePlayer,
        movePlayerToTeam,
        selectCaptain,
        tossResult,
        performToss,
        tossWinningTeam,
        resetToStep,
        isTeamFormationComplete,
        setIsTeamFormationComplete,
      }}
    >
      {children}
    </CricketContext.Provider>
  );
};

export const useCricket = (): CricketContextType => {
  const context = useContext(CricketContext);
  if (context === undefined) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
