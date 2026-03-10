import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { getLevelInfo } from "@/lib/utils/levelSystem";

interface XPProgressBarProps {
  currentXP: number;
  animated?: boolean;
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ currentXP, animated = true }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const levelInfo = getLevelInfo(currentXP);
  
  useEffect(() => {
    if (animated) {
      // Animate progress bar fill
      const duration = 1000;
      const startTime = performance.now();
      const startProgress = 0;
      
      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayProgress(startProgress + (levelInfo.progress - startProgress) * easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayProgress(levelInfo.progress);
        }
      }
      
      requestAnimationFrame(animate);
    } else {
      setDisplayProgress(levelInfo.progress);
    }
  }, [currentXP, levelInfo.progress, animated]);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Level {levelInfo.level}
        </span>
        <span className="text-muted-foreground">
          {levelInfo.xpToNextLevel} XP to Level {levelInfo.level + 1}
        </span>
      </div>
      <Progress value={displayProgress} className="h-3" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForNextLevel} XP</span>
        <span>Total: {currentXP.toLocaleString()} XP</span>
      </div>
    </div>
  );
};

export default XPProgressBar;

