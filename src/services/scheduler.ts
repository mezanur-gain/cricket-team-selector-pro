import { Player, Team, AppStep } from "@/types";
import { useCricket } from "@/context/useCricket";

export interface ScheduleConfig {
  hour: number;
  minute: number;
  enabled: boolean;
}

// Default players that will always be available
export const defaultPlayers: Omit<Player, 'id'>[] = [
  {
    name: "Imtiaz",
    imageUrl: "/images/Imtiaz.jpeg",
    weight: 3,
  },
  {
    name: "Mizan",
    imageUrl: "/images/cricket-player.png",
    weight: 3,
  },
  {
    name: "Tahsin",
    imageUrl: "/images/Tahsin.jpeg",
    weight: 3,
  },
  {
    name: "Momenul",
    imageUrl: "/images/Momenul.jpeg",
    weight: 3,
  },
  {
    name: "Mezan",
    imageUrl: "/images/Mezan.jpeg",
    weight: 5,
  },
  {
    name: "Mahabub",
    imageUrl: "/images/Mahabub.jpeg",
    weight: 2,
  },
  {
    name: "Zabid",
    imageUrl: "/images/Zabid.jpeg",
    weight: 4,
  },
  {
    name: "Rashed",
    imageUrl: "/images/Rashed.jpeg",
    weight: 3,
  },
  {
    name: "Akbar",
    imageUrl: "/images/Akbar.jpeg",
    weight: 2,
  },
  {
    name: "Shamil",
    imageUrl: "/images/Shamil.jpeg",
    weight: 1,
  },
  {
    name: "Elias",
    imageUrl: "/images/Elias.jpeg",
    weight: 5,
  },
  {
    name: "Emran",
    imageUrl: "/images/Emran.jpeg",
    weight: 1,
  },
  {
    name: "Saqib",
    imageUrl: "/images/Saqib.jpeg",
    weight: 2,
  },
  {
    name: "Rakib",
    imageUrl: "/images/Rakib.jpeg",
    weight: 5,
  },
  {
    name: "Arif",
    imageUrl: "/images/cricket-player.png",
    weight: 3,
  },
  {
    name: "Riaz",
    imageUrl: "/images/Riaz.jpeg",
    weight: 4,
  },
  {
    name: "Kamruzzaman",
    imageUrl: "/images/Kamruzzaman.jpeg",
    weight: 5,
  },
  {
    name: "Shahnewaz",
    imageUrl: "/images/Shahnewaz.jpeg",
    weight: 3,
  },
  {
    name: "Maruf",
    imageUrl: "/images/Maruf.jpeg",
    weight: 1,
  },
  {
    name: "Rifat",
    imageUrl: "/images/Rifat.jpeg",
    weight: 1,
  },
];

export const scheduleAutoTeamFormation = (
  config: ScheduleConfig,
  cricketContext: ReturnType<typeof useCricket>,
  onComplete: () => void,
  runImmediately = false
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
    if (!config.enabled && !runImmediately) return;
    
    console.log("Starting automated team formation...");
    try {
      // 1. Reset to initial state
      cricketContext.resetToStep(AppStep.ADD_PLAYERS);
      
      // 2. Clear players first to avoid duplicates
      if (cricketContext.allPlayers.length > 0) {
        cricketContext.allPlayers.forEach(player => {
          cricketContext.removePlayer(player.id);
        });
      }
      
      // 3. Add default players always
      console.log("Adding default players to the system");
      defaultPlayers.forEach(player => {
        const playerWithoutId = {
          name: player.name,
          imageUrl: player.imageUrl,
          weight: player.weight
        };
        cricketContext.addPlayer(playerWithoutId);
      });
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Players added:", cricketContext.allPlayers.length);
      
      // 4. Form balanced teams
      console.log("Forming balanced teams");
      formBalancedTeams(cricketContext);
      
      // 5. Move to captain selection
      console.log("Setting up for captain selection");
      cricketContext.setStep(AppStep.SELECT_CAPTAINS);
      cricketContext.setIsTeamFormationComplete(true);
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Teams formed:", cricketContext.teamAlpha.players.length, cricketContext.teamBeta.players.length);
      
      // 6. Select random captains
      console.log("Selecting random captains");
      selectRandomCaptains(cricketContext);
      
      // 7. Move to toss
      console.log("Moving to toss stage");
      cricketContext.setStep(AppStep.TOSS);
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 8. Set random captain choice
      console.log("Setting captain's toss choice");
      const choice = Math.random() > 0.5 ? 'heads' : 'tails';
      const teamId = Math.random() > 0.5 ? 'team-alpha' : 'team-beta';
      cricketContext.setCaptainChoice({
        choice,
        teamId
      });
      console.log(`Captain choice set: ${choice} by ${teamId}`);
      
      // 9. Perform toss
      console.log("Performing coin toss");
      cricketContext.performToss();
      
      // Short delay to allow state updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 10. Move to result
      console.log("Moving to final result");
      cricketContext.setStep(AppStep.RESULT);
      
      // 11. Capture and download image (after DOM has updated)
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Ready for image capture");
      
      onComplete();
      
      console.log("Automated team formation completed!");
    } catch (error) {
      console.error("Error during automated team formation:", error);
    }
    
    // Schedule next run if not a one-time run
    if (!runImmediately) {
      scheduleNextRun();
    }
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
    
    if (runImmediately) {
      executeAutomation();
      return;
    }
    
    if (config.enabled) {
      scheduleNextRun();
    }
  };
  
  // Start the scheduler
  start();
  
  // Return cleanup function
  return () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
};

// Create balanced teams based on player weights
export const formBalancedTeams = (cricketContext: ReturnType<typeof useCricket>) => {
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
  
  console.log(`Team weights after balancing - Alpha: ${teamAlphaWeight}, Beta: ${teamBetaWeight}`);
};

// Select random captains for both teams
export const selectRandomCaptains = (cricketContext: ReturnType<typeof useCricket>) => {
  const { teamAlpha, teamBeta, selectCaptain } = cricketContext;
  
  // Select random captain for Team Alpha
  if (teamAlpha.players.length > 0) {
    const randomAlphaIndex = Math.floor(Math.random() * teamAlpha.players.length);
    const alphaCaptain = teamAlpha.players[randomAlphaIndex];
    selectCaptain(alphaCaptain.id, 'team-alpha');
    console.log(`Team Alpha captain selected: ${alphaCaptain.name}`);
  }
  
  // Select random captain for Team Beta
  if (teamBeta.players.length > 0) {
    const randomBetaIndex = Math.floor(Math.random() * teamBeta.players.length);
    const betaCaptain = teamBeta.players[randomBetaIndex];
    selectCaptain(betaCaptain.id, 'team-beta');
    console.log(`Team Beta captain selected: ${betaCaptain.name}`);
  }
};
