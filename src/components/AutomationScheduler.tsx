import React, { useState, useEffect } from 'react';
import { useCricket } from '@/context/CricketContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, RefreshCw, Users2 } from 'lucide-react';
import { scheduleAutoTeamFormation, ScheduleConfig } from '@/services/scheduler';
import { Separator } from '@/components/ui/separator';
import { toPng } from 'html-to-image';

const AutomationScheduler: React.FC = () => {
  const cricket = useCricket();
  const { toast } = useToast();
  const [config, setConfig] = useState<ScheduleConfig>({
    hour: 12,
    minute: 0,
    enabled: false
  });
  
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
        toast({
          title: "Error",
          description: "Could not find team result container for image capture",
          variant: "destructive",
        });
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
        } catch (err) {
          console.error("Error generating image:", err);
          toast({
            title: "Error",
            description: "Failed to generate image during automated process.",
            variant: "destructive",
          });
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
    toast({
      title: "Starting Automated Process",
      description: "Teams will be formed, captains selected, and toss performed automatically.",
    });
    
    // Trigger the automation process manually
    const cleanup = scheduleAutoTeamFormation(
      { ...config, hour: new Date().getHours(), minute: new Date().getMinutes() + 1, enabled: true },
      cricket,
      () => {
        toast({
          title: "Automated Process Complete",
          description: "Teams formed, captains selected, and image downloaded successfully!",
        });
      }
    );
    
    // Clean up the temporary scheduler after 2 minutes
    setTimeout(cleanup, 120000);
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
          This will use the players already added to the system
        </div>
        <Button onClick={handleRunNow} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Run Now</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutomationScheduler;
