
import React from 'react';
import { useCricket } from '@/context/useCricket';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import PlayerCard from './PlayerCard';
import { Flag, Users2, ShieldAlert, Crown, ChevronsRight, Scale, Shuffle } from 'lucide-react';
import { AppStep } from '@/types';
import { useToast } from '@/hooks/use-toast';
import PlayersList from './PlayersList';

// Default players for random team generation
const defaultPlayers = [
  { name: "MS Dhoni", imageUrl: "/placeholder.svg", weight: 9 },
  { name: "Virat Kohli", imageUrl: "/placeholder.svg", weight: 9 },
  { name: "Rohit Sharma", imageUrl: "/placeholder.svg", weight: 8 },
  { name: "Jasprit Bumrah", imageUrl: "/placeholder.svg", weight: 8 },
  { name: "KL Rahul", imageUrl: "/placeholder.svg", weight: 7 },
  { name: "Ravindra Jadeja", imageUrl: "/placeholder.svg", weight: 7 },
  { name: "Hardik Pandya", imageUrl: "/placeholder.svg", weight: 7 },
  { name: "Bhuvneshwar Kumar", imageUrl: "/placeholder.svg", weight: 6 },
  { name: "Yuzvendra Chahal", imageUrl: "/placeholder.svg", weight: 6 },
  { name: "Shikhar Dhawan", imageUrl: "/placeholder.svg", weight: 6 },
  { name: "Rishabh Pant", imageUrl: "/placeholder.svg", weight: 5 },
  { name: "Shreyas Iyer", imageUrl: "/placeholder.svg", weight: 5 },
];

// Function to create balanced teams
const formBalancedTeams = (cricketContext) => {
  const {
    allPlayers,
    movePlayerToTeam,
    resetToStep
  } = cricketContext;

  // First clear any existing team assignments
  resetToStep(AppStep.FORM_TEAMS);
  
  // Sort players by weight in descending order
  const sortedPlayers = [...allPlayers].sort((a, b) => b.weight - a.weight);
  
  // Initialize team weights
  let teamAlphaWeight = 0;
  let teamBetaWeight = 0;
  
  // Distribute players using a greedy algorithm
  sortedPlayers.forEach(player => {
    if (teamAlphaWeight <= teamBetaWeight) {
      movePlayerToTeam(player.id, 'team-alpha');
      teamAlphaWeight += player.weight;
    } else {
      movePlayerToTeam(player.id, 'team-beta');
      teamBetaWeight += player.weight;
    }
  });
};

const TeamFormation: React.FC = () => {
  const { 
    teamAlpha, 
    teamBeta, 
    setStep, 
    isTeamFormationComplete, 
    setIsTeamFormationComplete,
    allPlayers,
    addPlayer,
    removePlayer,
    resetToStep
  } = useCricket();
  const { toast } = useToast();

  const handleTeamFormationComplete = () => {
    if (!areTeamsValid()) {
      toast({
        title: "Invalid Teams",
        description: "Each team must have at least 1 player",
        variant: "destructive",
      });
      return;
    }
    
    setIsTeamFormationComplete(true);
    setStep(AppStep.SELECT_CAPTAINS);
  };

  const areTeamsValid = () => {
    // Teams must have at least 1 player each to be valid
    return teamAlpha.players.length >= 1 && teamBeta.players.length >= 1;
  };

  const handleAutoFormTeams = () => {
    toast({
      title: "Auto-forming Teams",
      description: "Creating balanced teams based on player weights"
    });
    
    formBalancedTeams(useCricket());
  };

  const handleGetRandomBalancedTeam = () => {
    toast({
      title: "Creating Random Balanced Teams",
      description: "Generating two equally balanced teams from default players"
    });
    
    // First reset to clean state
    resetToStep(AppStep.FORM_TEAMS);
    
    // Clear any existing players to avoid duplicates
    allPlayers.forEach(player => {
      removePlayer(player.id);
    });
    
    // Add default players
    defaultPlayers.forEach(player => {
      const playerWithoutId = {
        name: player.name,
        imageUrl: player.imageUrl,
        weight: player.weight
      };
      addPlayer(playerWithoutId);
    });
    
    // Short timeout to ensure state is updated before forming teams
    setTimeout(() => {
      formBalancedTeams(useCricket());
    }, 100);
  };

  // Calculate team total weights
  const calculateTeamWeight = (players) => {
    return players.reduce((sum, player) => sum + player.weight, 0);
  };

  const teamAlphaWeight = calculateTeamWeight(teamAlpha.players);
  const teamBetaWeight = calculateTeamWeight(teamBeta.players);

  return (
    <div className="space-y-8">
      {/* Player Pool at the top */}
      <div className="w-full">
        <PlayersList showDragHandle={true} />
      </div>
      
      {/* Quick Action Buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button 
          variant="outline" 
          onClick={handleAutoFormTeams}
          className="gap-2"
          disabled={allPlayers.length === 0}
        >
          <Scale className="h-4 w-4" />
          <span>Auto-Balance Teams</span>
        </Button>
        
        <Button 
          variant="default" 
          onClick={handleGetRandomBalancedTeam}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          <span>Generate Random Balanced Teams</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Alpha */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-500" />
              <span>Team Alpha</span>
              <Badge>{teamAlpha.players.length}</Badge>
              {teamAlpha.players.length > 0 && (
                <Badge variant="outline" className="ml-auto">Weight: {teamAlphaWeight}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Droppable droppableId="team-alpha">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`team-container min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-blue-500/10' : ''
                  }`}
                >
                  {teamAlpha.players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                      <ShieldAlert className="h-10 w-10 mb-2 opacity-50" />
                      <p>Drag players here to add to Team Alpha</p>
                    </div>
                  ) : (
                    <div className="player-list">
                      {teamAlpha.players.map((player, index) => (
                        <Draggable
                          key={player.id}
                          draggableId={player.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <PlayerCard player={player} isDraggable={true} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>

        {/* Team Beta */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-600/5">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              <span>Team Beta</span>
              <Badge>{teamBeta.players.length}</Badge>
              {teamBeta.players.length > 0 && (
                <Badge variant="outline" className="ml-auto">Weight: {teamBetaWeight}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Droppable droppableId="team-beta">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`team-container min-h-[200px] ${
                    snapshot.isDraggingOver ? 'bg-amber-500/10' : ''
                  }`}
                >
                  {teamBeta.players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                      <ShieldAlert className="h-10 w-10 mb-2 opacity-50" />
                      <p>Drag players here to add to Team Beta</p>
                    </div>
                  ) : (
                    <div className="player-list">
                      {teamBeta.players.map((player, index) => (
                        <Draggable
                          key={player.id}
                          draggableId={player.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <PlayerCard player={player} isDraggable={true} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>
      </div>

      {/* Weight Comparison */}
      {(teamAlpha.players.length > 0 || teamBeta.players.length > 0) && (
        <div className="text-center p-2 bg-muted rounded-lg text-sm">
          <div className="font-medium mb-1">Team Weight Balance:</div>
          <div className="flex justify-center items-center gap-4">
            <span>Team Alpha: {teamAlphaWeight}</span>
            <span className={teamAlphaWeight === teamBetaWeight ? "text-green-500" : "text-amber-500"}>
              {teamAlphaWeight === teamBetaWeight ? "=" : teamAlphaWeight > teamBetaWeight ? ">" : "<"}
            </span>
            <span>Team Beta: {teamBetaWeight}</span>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={handleTeamFormationComplete}
          disabled={!areTeamsValid()}
          className="gap-2"
        >
          <Crown className="h-4 w-4" />
          <span>Teams Complete - Select Captains</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TeamFormation;
