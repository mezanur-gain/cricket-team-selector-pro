
import React from 'react';
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
import { AppStep } from '@/types';
import { CricketBall } from 'lucide-react';

const CricketTeamSelector: React.FC = () => {
  const { step, movePlayerToTeam } = useCricket();

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
              <PlayersList />
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
        return <TeamResult />;
      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CricketBall className="h-8 w-8" />
              <span>Cricket Team Selector Pro</span>
            </h1>
            <ThemeToggle />
          </div>
        </header>

        <StepIndicator />

        <main>{renderStepContent()}</main>
      </div>
    </DragDropContext>
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
