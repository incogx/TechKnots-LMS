import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, TrendingUp } from "lucide-react";
import { animateNumberIncrement, triggerPointsIncrementAnimation } from "@/lib/utils/animations";
import type { PointsBreakdown } from "@/lib/types";

interface PointsDisplayProps {
  totalPoints: number;
  breakdown?: PointsBreakdown;
  showBreakdown?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  totalPoints, 
  breakdown,
  showBreakdown = true 
}) => {
  const pointsRef = useRef<HTMLSpanElement>(null);
  const [displayPoints, setDisplayPoints] = useState(totalPoints);
  const [prevPoints, setPrevPoints] = useState(totalPoints);
  
  useEffect(() => {
    if (totalPoints !== prevPoints && pointsRef.current) {
      // Animate number increment
      animateNumberIncrement(pointsRef.current, prevPoints, totalPoints, 800);
      // Trigger visual animation
      triggerPointsIncrementAnimation(pointsRef.current);
      setPrevPoints(totalPoints);
    }
  }, [totalPoints, prevPoints]);
  
  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-500" />
          Total Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span 
            ref={pointsRef}
            className="text-3xl font-bold text-yellow-600"
          >
            {displayPoints.toLocaleString()}
          </span>
          {showBreakdown && breakdown && (
            <PointsBreakdownDialog breakdown={breakdown} />
          )}
        </div>
        {breakdown && (
          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Today</span>
              <span className="font-medium">+{breakdown.today.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>This Week</span>
              <span className="font-medium">+{breakdown.thisWeek.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PointsBreakdownDialog: React.FC<{ breakdown: PointsBreakdown }> = ({ breakdown }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <TrendingUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Points Breakdown</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="font-semibold">{breakdown.today.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="font-semibold">{breakdown.thisWeek.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold">{breakdown.thisMonth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Total</span>
              <span className="font-bold text-lg">{breakdown.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-semibold">By Category</h4>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Problems</span>
              <span className="font-medium">{breakdown.byCategory.problems.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Courses</span>
              <span className="font-medium">{breakdown.byCategory.courses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Challenges</span>
              <span className="font-medium">{breakdown.byCategory.challenges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Achievements</span>
              <span className="font-medium">{breakdown.byCategory.achievements.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PointsDisplay;

