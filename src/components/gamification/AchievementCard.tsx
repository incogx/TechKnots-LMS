import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock } from "lucide-react";
import { triggerAchievementUnlockAnimation } from "@/lib/utils/animations";
import type { Achievement } from "@/lib/types";

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number;
  showProgress?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlocked,
  progress = 0,
  showProgress = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (unlocked && cardRef.current) {
      triggerAchievementUnlockAnimation(cardRef.current);
    }
  }, [unlocked]);
  
  const tierColors = {
    bronze: "bg-orange-100 text-orange-700 border-orange-300",
    silver: "bg-gray-100 text-gray-700 border-gray-300",
    gold: "bg-yellow-100 text-yellow-700 border-yellow-300",
    platinum: "bg-purple-100 text-purple-700 border-purple-300",
  };
  
  const progressPercent = Math.min(100, (progress / achievement.requirement) * 100);
  
  return (
    <Card
      ref={cardRef}
      className={`transition-all hover:shadow-lg ${
        unlocked ? "border-2 border-primary" : "opacity-75"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              unlocked ? "bg-primary/10" : "bg-muted"
            }`}>
              {unlocked ? (
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{achievement.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {achievement.description}
              </p>
            </div>
          </div>
          <Badge className={tierColors[achievement.tier]}>
            {achievement.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {showProgress && !unlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress} / {achievement.requirement}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
        {unlocked && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Unlocked!</span>
            <span className="font-semibold text-primary">
              +{achievement.points} points
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementCard;

