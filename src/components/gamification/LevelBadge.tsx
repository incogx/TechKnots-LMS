import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { triggerLevelUpAnimation } from "@/lib/utils/animations";

interface LevelBadgeProps {
  level: number;
  showLevelUp?: boolean;
  size?: "sm" | "md" | "lg";
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ 
  level, 
  showLevelUp = false,
  size = "md" 
}) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (showLevelUp && badgeRef.current) {
      triggerLevelUpAnimation(badgeRef.current);
    }
  }, [showLevelUp]);
  
  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-24 h-24 text-2xl",
    lg: "w-32 h-32 text-4xl",
  };
  
  return (
    <Card 
      ref={badgeRef}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg border-2 border-primary/20`}
    >
      <CardContent className="p-0 flex flex-col items-center justify-center">
        <Trophy className={`${size === "lg" ? "h-8 w-8" : size === "md" ? "h-6 w-6" : "h-4 w-4"} mb-1`} />
        <span className="font-bold">Lv.{level}</span>
      </CardContent>
    </Card>
  );
};

export default LevelBadge;

