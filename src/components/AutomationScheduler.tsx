
import React, { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Clock, RefreshCw, Users2, CheckCircle2 } from 'lucide-react';
import { scheduleAutoTeamFormation, ScheduleConfig, defaultPlayers } from '@/services/scheduler';
import { Separator } from '@/components/ui/separator';
import { toPng } from 'html-to-image';
import { AppStep } from '@/types';

const AutomationScheduler: React.FC = () => {
  const cricket = useCricket();
  const { toast } = useToast();
  const [config, setConfig] = useState<ScheduleConfig>({
    hour: 12,
    minute: 0,
    enabled: false
  });
  const [isRunningNow, setIsRunningNow] = useState(false);
  
  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('automationConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);
  
  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('automationConfig', JSON.stringify(config));
  }, [config]);
  
  // Set up scheduler
  useEffect(() => {
    const handleCaptureImage = () => {
      // Find the result container
      const resultElement = document.querySelector("[data-testid='team-result-container']");
      if (!resultElement) {
        console.error("Team result container not found");
        return;
      }
      
      setTimeout(async () => {
        try {
          const dataUrl = await toPng(resultElement as HTMLElement, { cacheBust: true });
          
          const link = document.createElement('a');
          link.download = `cricket-teams-${new Date().toISOString().split('T')[0]}.png`;
          link.href = dataUrl;
          link.click();
          
          toast({
            title: "Automated Process Complete",
            description: "Teams formed, captains selected, and image downloaded successfully!",
          });
          
          setIsRunningNow(false);
        } catch (err) {
          console.error("Error generating image:", err);
          toast({
            title: "Error",
            description: "Failed to generate image during automated process.",
            variant: "destructive",
          });
          setIsRunningNow(false);
        }
      }, 1000);
    };
    
    const cleanup = scheduleAutoTeamFormation(config, cricket, handleCaptureImage);
    
    return cleanup;
  }, [config, cricket, toast]);
  
  const handleScheduleChange = (field: keyof ScheduleConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };
  
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  const calculateNextRunTime = () => {
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
    
    return targetTime.toLocaleString();
  };
  
  const handleRunNow = async () => {
    if (isRunningNow) {
      toast({
        title: "Already Running",
        description: "The automation process is already running. Please wait for it to complete.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunningNow(true);
    
    toast({
      title: "Starting Automated Process",
      description: "Loading default players and creating balanced teams...",
    });
    
    // Reset to initial state
    cricket.resetToStep(AppStep.ADD_PLAYERS);
    
    // Add default players
    if (cricket.allPlayers.length === 0) {
      defaultPlayers.forEach(player => cricket.addPlayer(player));
      
      toast({
        title: "Players Added",
        description: `Added ${defaultPlayers.length} default cricket players.`,
      });
    }
    
    // Allow time for state to update
    setTimeout(() => {
      // Form balanced teams
      cricket.setStep(AppStep.FORM_TEAMS);
      
      // Use helper from scheduler
      setTimeout(() => {
        const { allPlayers, movePlayerToTeam } = cricket;
        
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
        
        toast({
          title: "Teams Formed",
          description: "Balanced teams have been created based on player weights.",
        });
        
        // Move to captain selection
        cricket.setStep(AppStep.SELECT_CAPTAINS);
        cricket.setIsTeamFormationComplete(true);
        
        // Select random captains
        setTimeout(() => {
          const { teamAlpha, teamBeta, selectCaptain } = cricket;
          
          // Select random captain for Team Alpha
          if (teamAlpha.players.length > 0) {
            const randomAlphaIndex = Math.floor(Math.random() * teamAlpha.players.length);
            const alphaCaption = teamAlpha.players[randomAlphaIndex];
            selectCaptain(alphaCaption.id, 'team-alpha');
          }
          
          // Select random captain for Team Beta
          if (teamBeta.players.length > 0) {
            const randomBetaIndex = Math.floor(Math.random() * teamBeta.players.length);
            const betaCaption = teamBeta.players[randomBetaIndex];
            selectCaptain(betaCaption.id, 'team-beta');
          }
          
          toast({
            title: "Captains Selected",
            description: "Random captains have been selected for both teams.",
          });
          
          // Move to toss
          cricket.setStep(AppStep.TOSS);
          
          // Set random captain choice
          setTimeout(() => {
            const choice = Math.random() > 0.5 ? 'heads' : 'tails';
            const teamId = Math.random() > 0.5 ? 'team-alpha' : 'team-beta';
            cricket.setCaptainChoice({
              choice,
              teamId
            });
            
            // Perform toss
            cricket.performToss();
            
            toast({
              title: "Toss Complete",
              description: `Team ${teamId === 'team-alpha' ? 'Alpha' : 'Beta'} chose ${choice} for the toss.`,
            });
            
            // Move to result
            setTimeout(() => {
              cricket.setStep(AppStep.RESULT);
              
              // Capture and download image
              setTimeout(() => {
                const resultElement = document.querySelector("[data-testid='team-result-container']");
                if (!resultElement) {
                  console.error("Team result container not found");
                  setIsRunningNow(false);
                  return;
                }
                
                toPng(resultElement as HTMLElement, { cacheBust: true })
                  .then(dataUrl => {
                    const link = document.createElement('a');
                    link.download = `cricket-teams-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = dataUrl;
                    link.click();
                    
                    toast({
                      title: "Process Complete",
                      description: "Teams formed, captains selected, toss performed, and result image downloaded!",
                    });
                    
                    setIsRunningNow(false);
                  })
                  .catch(err => {
                    console.error("Error generating image:", err);
                    toast({
                      title: "Error",
                      description: "Failed to generate image. Process completed but no image was saved.",
                      variant: "destructive",
                    });
                    setIsRunningNow(false);
                  });
              }, 1500);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };
  
  const handlePreloadPlayers = () => {
    // Reset to initial state
    cricket.resetToStep(AppStep.ADD_PLAYERS);
    
    // Clear existing players
    cricket.allPlayers.forEach(player => cricket.removePlayer(player.id));
    
    // Add default players
    defaultPlayers.forEach(player => cricket.addPlayer(player));
    
    toast({
      title: "Default Players Loaded",
      description: `Added ${defaultPlayers.length} cricket players with their images and weights.`,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Daily Team Formation Automation</span>
        </CardTitle>
        <CardDescription>
          Schedule automatic team formation, captain selection, and toss at a specific time every day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Daily Automation</Label>
            <div className="text-sm text-muted-foreground">
              Teams will be automatically formed at the scheduled time
            </div>
          </div>
          <Switch 
            checked={config.enabled} 
            onCheckedChange={(checked) => handleScheduleChange('enabled', checked)} 
          />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hour">Hour (0-23)</Label>
            <Input 
              id="hour"
              type="number" 
              min={0} 
              max={23} 
              value={config.hour}
              onChange={(e) => handleScheduleChange('hour', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minute">Minute (0-59)</Label>
            <Input 
              id="minute"
              type="number" 
              min={0} 
              max={59} 
              value={config.minute}
              onChange={(e) => handleScheduleChange('minute', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>Default Players Available</span>
          </h3>
          <p className="text-sm mt-1">16 real cricket players with images and weights are available for use.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handlePreloadPlayers}
          >
            Load Default Players Now
          </Button>
        </div>
        
        {config.enabled && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Schedule Summary</h3>
            <p className="text-sm mt-1">Teams will be automatically formed daily at {formatTime(config.hour, config.minute)}</p>
            <p className="text-sm mt-1">Next scheduled run: {calculateNextRunTime()}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {cricket.allPlayers.length === 0 ? 
            "No players in the system. Default players will be used." : 
            `${cricket.allPlayers.length} players available for team formation`}
        </div>
        <Button 
          onClick={handleRunNow} 
          className="gap-2"
          disabled={isRunningNow}
        >
          {isRunningNow ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Running Automation...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Run Now</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutomationScheduler;
