
import React from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PlayerCard from './PlayerCard';
import { Flag, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AppStep } from '@/types';

const CaptainSelection: React.FC = () => {
  const { teamAlpha, teamBeta, selectCaptain, setStep } = useCricket();
  const { toast } = useToast();

  const handleSelectCaptainForTeam = (playerId: string, teamId: string) => {
    selectCaptain(playerId, teamId);
    toast({
      title: "Captain Selected",
      description: `New captain has been selected for ${teamId === 'team-alpha' ? 'Team Alpha' : 'Team Beta'}`,
    });
  };

  const handleProceedToToss = () => {
    if (!teamAlpha.captain || !teamBeta.captain) {
      toast({
        title: "Error",
        description: "Both teams must have a captain selected",
        variant: "destructive",
      });
      return;
    }

    setStep(AppStep.TOSS);
  };

  const areCaptainsSelected = !!teamAlpha.captain && !!teamBeta.captain;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Alpha Captain Selection */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-500" />
              <span>Select Team Alpha Captain</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {teamAlpha.players.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No players in Team Alpha
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamAlpha.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCaptainSelectionMode={true}
                    onSelectCaptain={(id) => handleSelectCaptainForTeam(id, 'team-alpha')}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Beta Captain Selection */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-600/5">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              <span>Select Team Beta Captain</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {teamBeta.players.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No players in Team Beta
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamBeta.players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCaptainSelectionMode={true}
                    onSelectCaptain={(id) => handleSelectCaptainForTeam(id, 'team-beta')}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proceed Button */}
      <div className="flex justify-center mt-8">
        <Button 
          size="lg" 
          onClick={handleProceedToToss}
          disabled={!areCaptainsSelected}
          className="gap-2"
        >
          <Crown className="h-4 w-4" />
          <span>Proceed to Toss</span>
        </Button>
      </div>
    </div>
  );
};

export default CaptainSelection;
