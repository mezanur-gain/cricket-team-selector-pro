import React, { useRef, useState } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Download, RefreshCw, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toPng } from 'html-to-image';
import { AppStep } from '@/types';

const TeamResult: React.FC = () => {
  const { teamAlpha, teamBeta, tossWinningTeam, resetToStep } = useCricket();
  const resultRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleCaptureImage = async () => {
    if (!resultRef.current) return;
    
    setIsGenerating(true);
    
    try {
      setTimeout(async () => {
        try {
          const dataUrl = await toPng(resultRef.current!, { cacheBust: true });
          
          const link = document.createElement('a');
          link.download = 'cricket-teams-result.png';
          link.href = dataUrl;
          link.click();
          
          toast({
            title: "Success",
            description: "Image has been generated and downloaded",
          });
        } catch (err) {
          console.error("Error generating image:", err);
          toast({
            title: "Error",
            description: "Failed to generate image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }, 100);
    } catch (error) {
      console.error("Error preparing for image generation:", error);
      toast({
        title: "Error",
        description: "Failed to prepare for image generation",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    resetToStep(AppStep.ADD_PLAYERS);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div ref={resultRef} className="p-6 bg-card rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Cricket Team Selection Results</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className={`border-2 ${tossWinningTeam?.id === 'team-alpha' ? 'border-primary' : 'border-transparent'}`}>
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 relative">
              {tossWinningTeam?.id === 'team-alpha' && (
                <div className="absolute -top-3 -right-3">
                  <Badge className="px-3 py-1 font-semibold flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>Toss Winner</span>
                  </Badge>
                </div>
              )}
              <CardTitle>Team Alpha</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={teamAlpha.captain?.imageUrl || "https://ui-avatars.com/api/?name=Captain&background=random"} 
                      alt={teamAlpha.captain?.name || "Captain"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{teamAlpha.captain?.name || "No Captain"}</div>
                    <Badge variant="secondary">Captain</Badge>
                  </div>
                </div>
                
                <div className="divide-y">
                  {teamAlpha.players
                    .filter(player => !player.isCaptain)
                    .map((player) => (
                      <div key={player.id} className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={player.imageUrl} 
                            alt={player.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-muted-foreground">{player.weight} kg</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 ${tossWinningTeam?.id === 'team-beta' ? 'border-primary' : 'border-transparent'}`}>
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 relative">
              {tossWinningTeam?.id === 'team-beta' && (
                <div className="absolute -top-3 -right-3">
                  <Badge className="px-3 py-1 font-semibold flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>Toss Winner</span>
                  </Badge>
                </div>
              )}
              <CardTitle>Team Beta</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={teamBeta.captain?.imageUrl || "https://ui-avatars.com/api/?name=Captain&background=random"} 
                      alt={teamBeta.captain?.name || "Captain"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{teamBeta.captain?.name || "No Captain"}</div>
                    <Badge variant="secondary">Captain</Badge>
                  </div>
                </div>
                
                <div className="divide-y">
                  {teamBeta.players
                    .filter(player => !player.isCaptain)
                    .map((player) => (
                      <div key={player.id} className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={player.imageUrl} 
                            alt={player.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-xs text-muted-foreground">{player.weight} kg</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-xl font-semibold">Toss Result: {tossWinningTeam?.name} won the toss!</div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline"
          size="lg"
          onClick={handleReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Start New Selection</span>
        </Button>
        
        <Button 
          size="lg"
          onClick={handleCaptureImage}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>Generating...</>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Generate Image</span>
              <Download className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TeamResult;
