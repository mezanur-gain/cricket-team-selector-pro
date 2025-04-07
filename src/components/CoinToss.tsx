
import React, { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ChevronsRight, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AppStep } from '@/types';

const CoinToss: React.FC = () => {
  const { teamAlpha, teamBeta, performToss, tossResult, tossWinningTeam, setStep } = useCricket();
  const [isFlipping, setIsFlipping] = useState(false);
  const { toast } = useToast();

  const handleToss = () => {
    setIsFlipping(true);
    
    // Delay the actual toss result to allow for animation
    setTimeout(() => {
      performToss();
      setTimeout(() => {
        setIsFlipping(false);
      }, 3000); // Match the animation duration
    }, 100);
  };

  useEffect(() => {
    if (tossResult && !isFlipping) {
      toast({
        title: "Toss Result",
        description: `It's ${tossResult}! ${tossWinningTeam?.name} wins the toss!`,
      });
    }
  }, [tossResult, isFlipping, tossWinningTeam, toast]);

  const handleProceedToResult = () => {
    if (!tossResult || !tossWinningTeam) {
      toast({
        title: "Error",
        description: "Please perform the toss first",
        variant: "destructive",
      });
      return;
    }

    setStep(AppStep.RESULT);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl flex justify-center items-center gap-2">
            <Crown className="h-6 w-6" />
            <span>The Coin Toss</span>
          </CardTitle>
          <CardDescription>
            Time for the captains to face off! Click the button below to flip the coin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="mb-8 flex gap-16 items-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 mb-2 mx-auto overflow-hidden">
                <img 
                  src={teamAlpha.captain?.imageUrl || "https://ui-avatars.com/api/?name=Alpha&background=random"} 
                  alt={teamAlpha.captain?.name || "Team Alpha Captain"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-semibold">{teamAlpha.captain?.name || "No Captain"}</div>
              <div className="text-sm text-muted-foreground">Team Alpha</div>
            </div>
            
            <div className="text-2xl font-bold">VS</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 mb-2 mx-auto overflow-hidden">
                <img 
                  src={teamBeta.captain?.imageUrl || "https://ui-avatars.com/api/?name=Beta&background=random"} 
                  alt={teamBeta.captain?.name || "Team Beta Captain"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-semibold">{teamBeta.captain?.name || "No Captain"}</div>
              <div className="text-sm text-muted-foreground">Team Beta</div>
            </div>
          </div>

          <div className="perspective-[1000px] mb-8">
            <div className={`coin ${isFlipping ? 'animate-coin-flip' : ''}`}>
              <div className="coin-side heads">
                <span className="text-2xl font-bold">H</span>
              </div>
              <div className="coin-side tails">
                <span className="text-2xl font-bold">T</span>
              </div>
            </div>
          </div>
          
          {tossResult && !isFlipping && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg">
              <div className="text-xl font-medium">Result: {tossResult.toUpperCase()}</div>
              <div className="mt-2 text-lg">
                <span className="font-semibold">{tossWinningTeam?.name}</span> wins the toss!
              </div>
            </div>
          )}
          
          <Button 
            size="lg" 
            onClick={handleToss}
            disabled={isFlipping}
            className="gap-2"
          >
            {isFlipping ? 'Flipping...' : 'Flip Coin'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleProceedToResult}
            disabled={!tossResult || isFlipping}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span>Proceed to Final Result</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CoinToss;
