import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types';
import { Trash2, Crown, Star } from 'lucide-react';
import { useCricket } from '@/context/useCricket';

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  isDraggable?: boolean;
  isCaptainSelectionMode?: boolean;
  onSelectCaptain?: (id: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onRemove,
  isDraggable = false,
  isCaptainSelectionMode = false,
  onSelectCaptain,
}) => {
  const { step } = useCricket();
  
  const getPlayerSkillDescription = (weight: number) => {
    switch (weight) {
      case 1:
        return "Beginner";
      case 2:
        return "Amateur";
      case 3:
        return "Intermediate";
      case 4:
        return "Advanced";
      case 5:
        return "Expert";
      default:
        return "Player";
    }
  };

  return (
    <Card className={`player-card ${isDraggable ? 'cursor-grab' : ''}`}>
      <CardHeader className="p-3 pb-0 relative flex-row justify-between">
        <div className="font-medium truncate max-w-[170px]">{player.name}</div>
        {player.isCaptain && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            <span>Captain</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="aspect-square w-full bg-muted rounded-md overflow-hidden">
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`;
            }}
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          {step === 'result' ? (
            <>
              <span>Skill:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {getPlayerSkillDescription(player.weight)}
              </Badge>
            </>
          ) : (
            <>
              <span>Weight:</span>
              <Badge variant="outline">{player.weight}</Badge>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        {onRemove && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onRemove(player.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Remove</span>
          </Button>
        )}
        {isCaptainSelectionMode && onSelectCaptain && (
          <Button
            variant={player.isCaptain ? "default" : "secondary"}
            size="sm"
            className="w-full"
            onClick={() => onSelectCaptain(player.id)}
            disabled={player.isCaptain}
          >
            <Crown className="h-4 w-4 mr-2" />
            <span>{player.isCaptain ? "Captain" : "Make Captain"}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
