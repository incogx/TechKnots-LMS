// src/components/CourseRecommendations.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "@/lib/types";

interface CourseRecommendationsProps {
  recommendations: Course[];
  reason?: string;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  recommendations,
  reason,
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  const getLevelColor = (level?: string) => {
    if (!level) return "bg-muted text-muted-foreground";

    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-50 text-green-700 border border-green-100";
      case "intermediate":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "advanced":
        return "bg-violet-50 text-violet-700 border border-violet-100";
      case "expert":
        return "bg-red-50 text-red-700 border border-red-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Recommended for You</h2>
      </div>

      {reason && <p className="text-muted-foreground">{reason}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Thumbnail / placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl select-none">📚</span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  {course.category && (
                    <Badge variant="secondary" className="px-2 py-1">
                      {course.category}
                    </Badge>
                  )}

                  {course.level && (
                    <Badge className={`px-2 py-1 ${getLevelColor(course.level)}`}>
                      {course.level}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {course.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                )}

                {course.students !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Prefer slug → fallback to id */}
              <Link to={`/courses/${course.slug ?? course.id}`}>
                <Button className="w-full">View Course</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseRecommendations;
