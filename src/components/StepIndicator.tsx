
import React from 'react';
import { useCricket } from '@/context/CricketContext';
import { AppStep } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, UserPlus, Users2, Crown, Coins, Trophy } from 'lucide-react';

const StepIndicator: React.FC = () => {
  const { step, resetToStep } = useCricket();

  const steps = [
    { key: AppStep.ADD_PLAYERS, label: 'Add Players', icon: UserPlus },
    { key: AppStep.FORM_TEAMS, label: 'Form Teams', icon: Users2 },
    { key: AppStep.SELECT_CAPTAINS, label: 'Select Captains', icon: Crown },
    { key: AppStep.TOSS, label: 'Coin Toss', icon: Coins },
    { key: AppStep.RESULT, label: 'Final Result', icon: Trophy },
  ];

  const getStepStatus = (stepKey: AppStep) => {
    const stepIndex = steps.findIndex((s) => s.key === stepKey);
    const currentIndex = steps.findIndex((s) => s.key === step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (stepKey: AppStep) => {
    // Only allow going back to previous steps
    const stepIndex = steps.findIndex((s) => s.key === stepKey);
    const currentIndex = steps.findIndex((s) => s.key === step);

    if (stepIndex < currentIndex) {
      resetToStep(stepKey);
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="flex flex-wrap justify-center gap-2 md:gap-0">
        {steps.map((s, index) => {
          const status = getStepStatus(s.key);
          const StepIcon = s.icon;
          
          return (
            <React.Fragment key={s.key}>
              <Button
                variant={status === 'current' ? 'default' : 'ghost'}
                className={`
                  rounded-full flex items-center gap-2 px-3 py-2 h-auto
                  ${status === 'completed' ? 'text-primary' : ''}
                  ${status === 'upcoming' ? 'text-muted-foreground pointer-events-none' : ''}
                `}
                onClick={() => handleStepClick(s.key)}
                disabled={status === 'upcoming'}
              >
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${status === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                    ${status === 'current' ? 'bg-primary text-primary-foreground' : ''}
                    ${status === 'upcoming' ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden md:inline">{s.label}</span>
              </Button>

              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center">
                  <div 
                    className={`
                      w-12 h-1 
                      ${status !== 'upcoming' && getStepStatus(steps[index + 1].key) !== 'upcoming' 
                        ? 'bg-primary' 
                        : 'bg-muted'
                      }
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
