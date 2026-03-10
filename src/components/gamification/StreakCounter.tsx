import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { triggerStreakFlameAnimation } from "@/lib/utils/animations";

interface StreakCounterProps {
  streak: number;
  lastStreakDate?: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak, lastStreakDate }) => {
  const flameRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (flameRef.current && streak > 0) {
      triggerStreakFlameAnimation(flameRef.current);
    }
  }, [streak]);
  
  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today!";
    if (streak < 7) return "Keep it going!";
    if (streak < 30) return "You're on fire!";
    return "Incredible dedication!";
  };
  
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-500" />
          Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div 
            ref={flameRef}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white"
          >
            <Flame className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-orange-600">{streak}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {getStreakMessage()}
            </div>
          </div>
        </div>
        
        {/* Streak calendar visualization */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">This Week</div>
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => {
              const isActive = streak > i;
              return (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-muted"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;

