
import React, { useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { CricketProvider, useCricket } from '@/context/CricketContext';
import ThemeToggle from '@/components/ThemeToggle';
import StepIndicator from '@/components/StepIndicator';
import AddPlayerForm from '@/components/AddPlayerForm';
import PlayersList from '@/components/PlayersList';
import TeamFormation from '@/components/TeamFormation';
import CaptainSelection from '@/components/CaptainSelection';
import CoinToss from '@/components/CoinToss';
import TeamResult from '@/components/TeamResult';
import AutomationScheduler from '@/components/AutomationScheduler';
import { AppStep } from '@/types';
import { CircleOff, Settings, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultPlayers } from '@/services/scheduler';

// Add Montserrat font
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';

const CricketTeamSelector: React.FC = () => {
  const { 
    step, 
    movePlayerToTeam, 
    resetToStep, 
    allPlayers, 
    addPlayer,
    removePlayer
  } = useCricket();

  // Load default players when the app starts if no players exist
  useEffect(() => {
    // If there are no players, load the default players
    if (allPlayers.length === 0) {
      console.log("Loading default players on app start");
      
      // Remove any existing players to avoid duplicates
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
    }
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Move the player to the appropriate team
    movePlayerToTeam(draggableId, destination.droppableId);
  };

  const renderStepContent = () => {
    switch (step) {
      case AppStep.ADD_PLAYERS:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <AddPlayerForm />
            </div>
            <div>
              <PlayersList showDragHandle={false} />
            </div>
          </div>
        );
      case AppStep.FORM_TEAMS:
        return <TeamFormation />;
      case AppStep.SELECT_CAPTAINS:
        return <CaptainSelection />;
      case AppStep.TOSS:
        return <CoinToss />;
      case AppStep.RESULT:
        return (
          <div className="space-y-8">
            <TeamResult />
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => resetToStep(AppStep.ADD_PLAYERS)}
                className="gap-2"
              >
                Start New Game
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Only wrap with DragDropContext when in the team formation or later steps
  const content = renderStepContent();
  const shouldEnableDragDrop = step === AppStep.FORM_TEAMS;

  return (
    <div className="container mx-auto px-4 py-8 font-montserrat">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CircleOff className="h-8 w-8" />
            <span>Cricket Team Selector Pro</span>
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Tabs defaultValue="main">
        <TabsList className="mb-6">
          <TabsTrigger value="main" className="flex items-center gap-2">
            <CircleOff className="h-4 w-4" />
            <span>Team Selector</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Automation</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="main">
          <div className="space-y-8">
            <StepIndicator />
            
            <main>
              {shouldEnableDragDrop ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  {content}
                </DragDropContext>
              ) : (
                content
              )}
            </main>
          </div>
        </TabsContent>
        
        <TabsContent value="automation">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <CircleAlert className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">About Automated Team Formation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This feature automatically creates balanced teams based on player weights,
                  selects captains, performs the coin toss, and downloads the result image at a scheduled time.
                  Default cricket players are always loaded into the system.
                </p>
              </div>
            </div>
            
            <AutomationScheduler />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <CricketProvider>
      <CricketTeamSelector />
    </CricketProvider>
  );
};

export default Index;
