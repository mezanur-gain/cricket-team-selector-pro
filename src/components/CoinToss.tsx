
import React, { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ChevronsRight, Trophy, CircleDot, CircleOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AppStep } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const CoinToss: React.FC = () => {
  const { teamAlpha, teamBeta, performToss, tossResult, tossWinningTeam, setStep, captainChoice, setCaptainChoice } = useCricket();
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedCaptain, setSelectedCaptain] = useState<'alpha' | 'beta'>('alpha');
  const { toast } = useToast();

  const handleCaptainChoice = (value: 'heads' | 'tails') => {
    setCaptainChoice({
      choice: value,
      teamId: selectedCaptain === 'alpha' ? 'team-alpha' : 'team-beta'
    });
  };

  const handleToss = () => {
    if (!captainChoice) {
      toast({
        title: "Captain's Choice Required",
        description: "Please select a captain and their coin toss choice first.",
        variant: "destructive",
      });
      return;
    }
    
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
      const winningStatus = captainChoice?.choice === tossResult ? 'won' : 'lost';
      toast({
        title: "Toss Result",
        description: `It's ${tossResult}! ${tossWinningTeam?.name} ${winningStatus} the toss!`,
      });
    }
  }, [tossResult, isFlipping, tossWinningTeam, toast, captainChoice]);

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
            Time for the captains to face off! First, select which captain will call the toss.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          {/* Captain Selection */}
          <div className="mb-8 w-full">
            <RadioGroup 
              defaultValue="alpha"
              onValueChange={(value) => setSelectedCaptain(value as 'alpha' | 'beta')}
              className="flex justify-center gap-8 mb-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto overflow-hidden">
                  <img 
                    src={teamAlpha.captain?.imageUrl || "https://ui-avatars.com/api/?name=Alpha&background=random"} 
                    alt={teamAlpha.captain?.name || "Team Alpha Captain"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alpha" id="alpha" />
                  <Label htmlFor="alpha" className="font-semibold">{teamAlpha.captain?.name || "Alpha Captain"}</Label>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 mx-auto overflow-hidden">
                  <img 
                    src={teamBeta.captain?.imageUrl || "https://ui-avatars.com/api/?name=Beta&background=random"} 
                    alt={teamBeta.captain?.name || "Team Beta Captain"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beta" id="beta" />
                  <Label htmlFor="beta" className="font-semibold">{teamBeta.captain?.name || "Beta Captain"}</Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Heads or Tails Choice */}
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                {selectedCaptain === 'alpha' ? teamAlpha.captain?.name : teamBeta.captain?.name} will call:
              </h3>
              <RadioGroup 
                defaultValue={captainChoice?.choice || "heads"}
                onValueChange={(value) => handleCaptainChoice(value as 'heads' | 'tails')}
                className="flex justify-center gap-16"
              >
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                    <CircleDot className="h-10 w-10" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="heads" id="heads" />
                    <Label htmlFor="heads" className="font-semibold">Heads</Label>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                    <CircleOff className="h-10 w-10" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tails" id="tails" />
                    <Label htmlFor="tails" className="font-semibold">Tails</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="mb-8 flex gap-16 items-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 mb-2 mx-auto overflow-hidden">
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
              <div className="w-12 h-12 rounded-full bg-amber-500/20 mb-2 mx-auto overflow-hidden">
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
            <div className={`coin ${isFlipping ? 'animate-coin-flip' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
              <div className="coin-side heads">
                <div className="flex items-center justify-center">
                  <CircleDot className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              <div className="coin-side tails">
                <div className="flex items-center justify-center">
                  <CircleOff className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          {tossResult && !isFlipping && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg">
              <div className="text-xl font-medium">Result: {tossResult.toUpperCase()}</div>
              <div className="flex items-center justify-center mt-2 gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                  background: tossResult === 'heads' ? 'linear-gradient(45deg, #f5d742, #f5b642)' : 'linear-gradient(45deg, #427af5, #425df5)' 
                }}>
                  {tossResult === 'heads' ? <CircleDot className="h-6 w-6 text-primary-foreground" /> : <CircleOff className="h-6 w-6 text-primary-foreground" />}
                </div>
                <div className="text-lg">
                  <span className="font-semibold">{tossWinningTeam?.name}</span> wins the toss!
                </div>
              </div>
            </div>
          )}
          
          <Button 
            size="lg" 
            onClick={handleToss}
            disabled={isFlipping || !captainChoice}
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
