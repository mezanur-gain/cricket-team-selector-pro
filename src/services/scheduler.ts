
import { CricketContextType } from "@/context/CricketContext";
import { Player, AppStep } from "@/types";

export interface ScheduleConfig {
  hour: number;
  minute: number;
  enabled: boolean;
}

// Default cricket players with images
export const defaultPlayers: Omit<Player, 'id'>[] = [
  {
    name: "Virat Kohli",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/164.png",
    weight: 72,
  },
  {
    name: "Rohit Sharma",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/107.png",
    weight: 78,
  },
  {
    name: "Joe Root",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/303.png",
    weight: 70,
  },
  {
    name: "Steve Smith",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/311.png",
    weight: 74,
  },
  {
    name: "Kane Williamson",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/440.png",
    weight: 71,
  },
  {
    name: "Babar Azam",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/2713.png",
    weight: 68,
  },
  {
    name: "Ben Stokes",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/308.png",
    weight: 85,
  },
  {
    name: "Jasprit Bumrah",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/1124.png",
    weight: 75,
  },
  {
    name: "Pat Cummins",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/488.png",
    weight: 83,
  },
  {
    name: "Kagiso Rabada",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/1085.png",
    weight: 80,
  },
  {
    name: "Trent Boult",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/969.png",
    weight: 76,
  },
  {
    name: "Rashid Khan",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/2245.png",
    weight: 65,
  },
  {
    name: "Jos Buttler",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/498.png",
    weight: 77,
  },
  {
    name: "Rishabh Pant",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/2972.png",
    weight: 74,
  },
  {
    name: "Shakib Al Hasan",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/201.png",
    weight: 72,
  },
  {
    name: "David Warner",
    imageUrl: "https://resources.pulse.icc-cricket.com/players/284/219.png",
    weight: 75,
  },
];

export const scheduleAutoTeamFormation = (
  config: ScheduleConfig,
  cricketContext: CricketContextType,
  onComplete: () => void
): (() => void) => {
  let timeoutId: number | null = null;
  
  const calculateNextRunTime = (): number => {
    const now = new Date();
    const targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      config.hour,
      config.minute,
      0
    );
    
    // If the target time has already passed today, schedule for tomorrow
    if (targetTime.getTime() <= now.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return targetTime.getTime() - now.getTime();
  };
  
  const executeAutomation = async () => {
    if (!config.enabled) return;
    
    console.log("Starting automated team formation...");
    try {
      // 1. Reset to initial state
      cricketContext.resetToStep(AppStep.ADD_PLAYERS);
      
      // 2. Add default players if no players exist
      console.log("Adding default players...");
      if (cricketContext.allPlayers.length === 0) {
        defaultPlayers.forEach(player => {
          console.log(`Adding player: ${player.name}`);
          cricketContext.addPlayer(player);
        });
      } else {
        console.log(`Using existing ${cricketContext.allPlayers.length} players`);
      }
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Form balanced teams
      console.log("Forming balanced teams...");
      formBalancedTeams(cricketContext);
      
      // 4. Move to captain selection
      console.log("Moving to captain selection...");
      cricketContext.setStep(AppStep.SELECT_CAPTAINS);
      cricketContext.setIsTeamFormationComplete(true);
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 5. Select random captains
      console.log("Selecting random captains...");
      selectRandomCaptains(cricketContext);
      
      // 6. Move to toss
      console.log("Moving to toss...");
      cricketContext.setStep(AppStep.TOSS);
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 7. Set random captain choice
      const choice = Math.random() > 0.5 ? 'heads' : 'tails';
      const teamId = Math.random() > 0.5 ? 'team-alpha' : 'team-beta';
      console.log(`Setting captain choice: ${choice} for team ${teamId}`);
      cricketContext.setCaptainChoice({
        choice,
        teamId
      });
      
      // 8. Perform toss
      console.log("Performing toss...");
      cricketContext.performToss();
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 9. Move to result
      console.log("Moving to result page...");
      cricketContext.setStep(AppStep.RESULT);
      
      // 10. Capture and download image (after DOM has updated)
      console.log("Preparing to capture image...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Executing onComplete callback...");
      onComplete();
      
      console.log("Automated team formation completed!");
    } catch (error) {
      console.error("Error during automated team formation:", error);
    }
    
    // Schedule next run
    scheduleNextRun();
  };
  
  const scheduleNextRun = () => {
    if (!config.enabled) return;
    
    const delay = calculateNextRunTime();
    console.log(`Next automated team formation in ${Math.round(delay / 60000)} minutes`);
    
    timeoutId = window.setTimeout(executeAutomation, delay);
  };
  
  // Clear any existing timeout and schedule a new one
  const start = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    
    if (config.enabled) {
      scheduleNextRun();
    }
  };
  
  // For testing or immediate run
  const runNow = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    executeAutomation();
  };
  
  // Start the scheduler
  start();
  
  // Return an object with cleanup and runNow functions
  return () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
};

// Create balanced teams based on player weights
export const formBalancedTeams = (cricketContext: CricketContextType) => {
  const { allPlayers, movePlayerToTeam } = cricketContext;
  
  // Sort players by weight in descending order
  const sortedPlayers = [...allPlayers].sort((a, b) => b.weight - a.weight);
  
  // Initialize team weights
  let teamAlphaWeight = 0;
  let teamBetaWeight = 0;
  
  // Distribute players to teams to balance weights
  sortedPlayers.forEach((player, index) => {
    // For first player, always add to team Alpha
    if (index === 0) {
      movePlayerToTeam(player.id, 'team-alpha');
      teamAlphaWeight += player.weight;
      return;
    }
    
    // For second player, always add to team Beta
    if (index === 1) {
      movePlayerToTeam(player.id, 'team-beta');
      teamBetaWeight += player.weight;
      return;
    }
    
    // For remaining players, add to the team with less weight
    if (teamAlphaWeight <= teamBetaWeight) {
      movePlayerToTeam(player.id, 'team-alpha');
      teamAlphaWeight += player.weight;
    } else {
      movePlayerToTeam(player.id, 'team-beta');
      teamBetaWeight += player.weight;
    }
  });
  
  console.log(`Team Alpha total weight: ${teamAlphaWeight}`);
  console.log(`Team Beta total weight: ${teamBetaWeight}`);
};

// Select random captains for both teams
export const selectRandomCaptains = (cricketContext: CricketContextType) => {
  const { teamAlpha, teamBeta, selectCaptain } = cricketContext;
  
  // Select random captain for Team Alpha
  if (teamAlpha.players.length > 0) {
    const randomAlphaIndex = Math.floor(Math.random() * teamAlpha.players.length);
    const alphaCaption = teamAlpha.players[randomAlphaIndex];
    console.log(`Selected captain for Team Alpha: ${alphaCaption.name}`);
    selectCaptain(alphaCaption.id, 'team-alpha');
  }
  
  // Select random captain for Team Beta
  if (teamBeta.players.length > 0) {
    const randomBetaIndex = Math.floor(Math.random() * teamBeta.players.length);
    const betaCaption = teamBeta.players[randomBetaIndex];
    console.log(`Selected captain for Team Beta: ${betaCaption.name}`);
    selectCaptain(betaCaption.id, 'team-beta');
  }
};
