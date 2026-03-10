import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Search, CheckCircle2, Circle } from "lucide-react";

interface Problem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  acceptance: number;
  completed: boolean;
}

const Problems = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const allProblems: Problem[] = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      topics: ["Array", "Hash Table"],
      acceptance: 49.2,
      completed: true,
    },
    {
      id: 2,
      title: "Add Two Numbers",
      difficulty: "Medium",
      topics: ["Linked List", "Math"],
      acceptance: 39.8,
      completed: false,
    },
    {
      id: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topics: ["String", "Sliding Window"],
      acceptance: 33.5,
      completed: true,
    },
    {
      id: 4,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      topics: ["Array", "Binary Search"],
      acceptance: 35.7,
      completed: false,
    },
    {
      id: 5,
      title: "Reverse Integer",
      difficulty: "Easy",
      topics: ["Math"],
      acceptance: 26.4,
      completed: false,
    },
    {
      id: 6,
      title: "Regular Expression Matching",
      difficulty: "Hard",
      topics: ["String", "Dynamic Programming"],
      acceptance: 27.8,
      completed: false,
    },
    {
      id: 7,
      title: "Container With Most Water",
      difficulty: "Medium",
      topics: ["Array", "Two Pointers"],
      acceptance: 54.1,
      completed: true,
    },
    {
      id: 8,
      title: "Valid Parentheses",
      difficulty: "Easy",
      topics: ["String", "Stack"],
      acceptance: 40.2,
      completed: false,
    },
    {
      id: 9,
      title: "Merge K Sorted Lists",
      difficulty: "Hard",
      topics: ["Linked List", "Heap"],
      acceptance: 47.3,
      completed: false,
    },
    {
      id: 10,
      title: "Binary Tree Inorder Traversal",
      difficulty: "Easy",
      topics: ["Tree", "DFS"],
      acceptance: 71.9,
      completed: true,
    },
  ];

  const allTopics = Array.from(
    new Set(allProblems.flatMap((p) => p.topics))
  ).sort();

  const filteredProblems = allProblems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    const matchesTopic =
      selectedTopic === "all" || problem.topics.includes(selectedTopic);
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const stats = {
    total: allProblems.length,
    completed: allProblems.filter((p) => p.completed).length,
    easy: allProblems.filter((p) => p.difficulty === "Easy").length,
    medium: allProblems.filter((p) => p.difficulty === "Medium").length,
    hard: allProblems.filter((p) => p.difficulty === "Hard").length,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">TechKnots</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/courses">
              <Button variant="ghost">Courses</Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="ghost">Leaderboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.completed}/{stats.total}</div>
              <div className="text-sm text-muted-foreground">Solved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
              <div className="text-sm text-muted-foreground">Easy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
              <div className="text-sm text-muted-foreground">Hard</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round((stats.completed / stats.total) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Easy">Easy</TabsTrigger>
                  <TabsTrigger value="Medium">Medium</TabsTrigger>
                  <TabsTrigger value="Hard">Hard</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant={selectedTopic === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic("all")}
              >
                All Topics
              </Button>
              {allTopics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problems List */}
        <div className="space-y-2">
          {filteredProblems.map((problem) => (
            <Link key={problem.id} to={`/code-editor/${problem.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8">
                        {problem.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{problem.id}. {problem.title}</span>
                          {problem.completed && (
                            <Badge variant="outline" className="text-primary border-primary">
                              Solved
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {problem.topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center hidden md:block">
                        <div className="text-sm text-muted-foreground">Acceptance</div>
                        <div className="font-medium">{problem.acceptance}%</div>
                      </div>
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No problems found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Problems;
