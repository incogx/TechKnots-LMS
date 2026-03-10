import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Zap } from "lucide-react";
import { triggerConfetti, initializeAnimations } from "@/lib/utils/animations";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  rewards?: {
    points?: number;
    xp?: number;
  };
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  open,
  onClose,
  oldLevel,
  newLevel,
  rewards,
}) => {
  useEffect(() => {
    if (open) {
      initializeAnimations();
      triggerConfetti();
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Level Up!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Level Display */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative flex items-center gap-4">
              <div className="text-6xl font-bold text-muted-foreground line-through">
                {oldLevel}
              </div>
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <div className="text-6xl font-bold text-primary">
                {newLevel}
              </div>
            </div>
          </div>
          
          {/* Rewards */}
          {rewards && (
            <div className="w-full space-y-3">
              <div className="text-center text-sm font-semibold text-muted-foreground">
                Rewards Earned
              </div>
              <div className="flex items-center justify-center gap-6">
                {rewards.points && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-yellow-600">
                      +{rewards.points} Points
                    </span>
                  </div>
                )}
                {rewards.xp && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="font-bold text-primary">
                      +{rewards.xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Message */}
          <p className="text-center text-muted-foreground">
            Congratulations! You've reached level {newLevel}. Keep learning to unlock more rewards!
          </p>
          
          <Button onClick={onClose} className="w-full" size="lg">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;

