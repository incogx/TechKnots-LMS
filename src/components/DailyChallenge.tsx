import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Trophy, 
  Share2, 
  Calendar, 
  Timer,
  Zap,
  CheckCircle2,
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDB, COLLECTIONS, SUBCOLLECTIONS } from "@/lib/firestore";
import { completeDailyChallenge } from "@/lib/services/gamificationService";
import { useUserStats } from "@/hooks/useUserStats";

interface DailyChallengeProps {
  currentStreak?: number;
  completed?: boolean;
}

const DailyChallenge = ({ currentStreak = 7, completed = false }: DailyChallengeProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.uid || null;
  const { data: userStats } = useUserStats(userId, !!userId);
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Check if challenge is already completed today
  useEffect(() => {
    const checkCompletion = async () => {
      if (!userId) return;
      
      try {
        const db = getFirestoreDB();
        const challengeId = "42"; // Today's challenge ID
        const completionRef = doc(
          db,
          COLLECTIONS.USERS,
          userId,
          SUBCOLLECTIONS.DAILY_CHALLENGES,
          challengeId
        );
        
        const completionSnap = await getDoc(completionRef);
        if (completionSnap.exists()) {
          const completion = completionSnap.data();
          const completedDate = completion.completedAt?.split("T")[0];
          const today = new Date().toISOString().split("T")[0];
          
          if (completedDate === today) {
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error("Error checking challenge completion:", error);
      }
    };
    
    checkCompletion();
  }, [userId]);

  const todayChallenge = {
    id: 42,
    title: "Valid Sudoku",
    difficulty: "Medium",
    points: 50,
    bonusPoints: 25,
    timeLimit: "24h",
    topicsCount: 3,
  };

  const handleComplete = async () => {
    if (!userId || isCompleted || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      const challengeId = todayChallenge.id.toString();
      const basePoints = todayChallenge.points;
      const bonusPoints = currentStreak > 0 ? todayChallenge.bonusPoints : 0;
      const totalPoints = basePoints + bonusPoints;
      const xpReward = Math.floor(totalPoints * 1.5); // XP is 1.5x points
      
      await completeDailyChallenge(userId, challengeId, totalPoints, xpReward);
      
      setIsCompleted(true);
      toast({
        title: "Challenge Completed! 🎉",
        description: `You earned ${totalPoints} points and ${xpReward} XP!`,
      });
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleShare = async () => {
    const shareText = `🔥 ${currentStreak} day streak on TechKnots!\n\n💪 Today's challenge: ${todayChallenge.title}\n🏆 Join me and level up your coding skills!\n\n#TechKnots #CodingChallenge`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TechKnots Daily Challenge',
          text: shareText,
        });
        toast({
          title: "Shared successfully!",
          description: "Keep up the great work!",
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your progress with friends!",
      });
    }
  };
  
  const actualStreak = userStats?.streak || currentStreak;

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Daily Challenge</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* Streak Badge */}
          <div className="flex flex-col items-center gap-1 bg-gradient-to-br from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <Flame className="h-6 w-6" />
            <div className="text-2xl font-bold">{actualStreak}</div>
            <div className="text-xs font-medium">Day Streak</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Challenge Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{todayChallenge.title}</h3>
                {isCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {todayChallenge.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {todayChallenge.topicsCount} Topics
                </Badge>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Base Points</div>
                <div className="text-lg font-bold text-primary">+{todayChallenge.points}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Streak Bonus</div>
                <div className="text-lg font-bold text-orange-500">
                  +{actualStreak > 0 ? todayChallenge.bonusPoints : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            <span className="text-sm font-bold text-primary">{todayChallenge.timeLimit}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCompleted ? (
              <Link to={`/code-editor/${todayChallenge.id}`} className="flex-1">
                <Button 
                  className="w-full gap-2" 
                  size="lg" 
                  onClick={handleComplete}
                  disabled={isCompleting || !userId}
                >
                  <Zap className="h-5 w-5" />
                  {isCompleting ? "Completing..." : "Start Challenge"}
                </Button>
              </Link>
            ) : (
              <Button className="flex-1 gap-2" size="lg" disabled>
                <CheckCircle2 className="h-5 w-5" />
                Completed Today
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
            <Link to="/rewards">
              <Button variant="secondary" size="lg">
                <Gift className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">This Week's Progress</span>
            <span className="text-muted-foreground">5/7 days</span>
          </div>
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < 5
                    ? 'bg-gradient-to-r from-primary to-primary/80'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Complete 2 more challenges this week to maintain your streak! 🔥
          </p>
        </div>

        {/* Milestone Alert */}
        {actualStreak >= 7 && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-purple-500" />
              <div>
                <div className="font-semibold text-sm">Milestone Unlocked!</div>
                <div className="text-xs text-muted-foreground">
                  You've maintained a {actualStreak}-day streak. Keep it going!
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyChallenge;
