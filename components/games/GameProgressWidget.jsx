"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Gamepad2,
  Trophy,
  Zap,
  Star,
  Flame,
  ChevronRight,
  Shield,
  Wallet,
  Heart,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";
import { XP_CONFIG } from "@/lib/gameEngine";

// Game definitions
const GAMES = [
  {
    id: "scam-buster",
    name: "Scam Buster",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "life-decisions",
    name: "Life Decisions",
    icon: Wallet,
    color: "text-violet-500",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
  {
    id: "insurance-academy",
    name: "Insurance",
    icon: Heart,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

// Achievement definitions
const ACHIEVEMENTS = {
  first_game: {
    name: "First Steps",
    emoji: "🎮",
    description: "Played your first game",
  },
  scam_master: {
    name: "Scam Master",
    emoji: "🕵️",
    description: "Perfect score in Scam Buster",
  },
  insurance_pro: {
    name: "Insurance Pro",
    emoji: "🛡️",
    description: "Completed Insurance Academy",
  },
  level_5: { name: "Rising Star", emoji: "⭐", description: "Reached Level 5" },
  streak_7: { name: "Week Warrior", emoji: "🔥", description: "7-day streak" },
};

export default function GameProgressWidget({ className = "" }) {
  const router = useRouter();
  const [progress, setProgress] = useState({
    totalXP: 0,
    level: 1,
    levelName: "Financial Newbie",
    gamesPlayed: 0,
    gamesCompleted: [],
    achievements: [],
    streak: 0,
    lastPlayed: null,
  });

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("wealthwise_game_progress");
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Error loading game progress:", e);
      }
    }
  }, []);

  // Calculate level info
  const calculateLevel = (xp) => {
    for (let i = XP_CONFIG.levels.length - 1; i >= 0; i--) {
      if (xp >= XP_CONFIG.levels[i].minXP) {
        return XP_CONFIG.levels[i];
      }
    }
    return XP_CONFIG.levels[0];
  };

  const currentLevel = calculateLevel(progress.totalXP);
  const nextLevel =
    XP_CONFIG.levels[currentLevel.level] ||
    XP_CONFIG.levels[XP_CONFIG.levels.length - 1];
  const xpForCurrentLevel = progress.totalXP - currentLevel.minXP;
  const xpNeededForNext = nextLevel.minXP - currentLevel.minXP;
  const progressPercent =
    xpNeededForNext > 0
      ? Math.min(100, (xpForCurrentLevel / xpNeededForNext) * 100)
      : 100;

  // Calculate streak
  const calculateStreak = () => {
    if (!progress.lastPlayed) return 0;
    const lastPlayed = new Date(progress.lastPlayed);
    const today = new Date();
    const diffDays = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? progress.streak : 0;
  };

  const currentStreak = calculateStreak();

  if (progress.gamesPlayed === 0) {
    // New user - show invitation
    return (
      <Card
        className={`border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 ${className}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Learn Finance Through Games
          </CardTitle>
          <CardDescription>
            Build real-world money skills with interactive games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {GAMES.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  className={`flex flex-col items-center p-3 rounded-lg ${game.bgColor} transition-transform hover:scale-105`}
                >
                  <Icon className={`h-6 w-6 ${game.color} mb-1`} />
                  <span className="text-xs text-center font-medium">
                    {game.name}
                  </span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={() => router.push("/dashboard/games")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Start Playing
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <span className="font-semibold">Your Game Progress</span>
          </div>
          {currentStreak > 0 && (
            <Badge className="bg-white/20 text-white border-0">
              <Flame className="h-3 w-3 mr-1 text-orange-300" />
              {currentStreak} day streak
            </Badge>
          )}
        </div>

        {/* Level & XP */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl font-bold">{currentLevel.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{currentLevel.name}</span>
              <span className="text-sm text-emerald-100">
                {progress.totalXP} XP
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              {Math.round(xpNeededForNext - xpForCurrentLevel)} XP to Level{" "}
              {currentLevel.level + 1}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Trophy className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <div className="text-lg font-bold">{progress.gamesPlayed}</div>
            <div className="text-xs text-slate-500">Games</div>
          </div>
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Award className="h-4 w-4 mx-auto text-violet-500 mb-1" />
            <div className="text-lg font-bold">
              {progress.achievements.length}
            </div>
            <div className="text-xs text-slate-500">Badges</div>
          </div>
          <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Target className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <div className="text-lg font-bold">
              {progress.gamesCompleted.length}/3
            </div>
            <div className="text-xs text-slate-500">Completed</div>
          </div>
        </div>

        {/* Achievements */}
        {progress.achievements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              Earned Badges
            </p>
            <div className="flex gap-2">
              {progress.achievements.slice(0, 4).map((achievementId) => {
                const achievement = ACHIEVEMENTS[achievementId];
                if (!achievement) return null;
                return (
                  <div
                    key={achievementId}
                    className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
                    title={achievement.description}
                  >
                    <span className="text-lg">{achievement.emoji}</span>
                  </div>
                );
              })}
              {progress.achievements.length > 4 && (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-500">
                    +{progress.achievements.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Games Quick Access */}
        <div className="space-y-2 mb-4">
          {GAMES.map((game) => {
            const Icon = game.icon;
            const isCompleted = progress.gamesCompleted.includes(game.id);
            return (
              <button
                key={game.id}
                onClick={() => router.push("/dashboard/games")}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${game.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 ${game.color}`} />
                </div>
                <span className="flex-1 text-sm font-medium">{game.name}</span>
                {isCompleted ? (
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/30"
                  >
                    ✓ Done
                  </Badge>
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => router.push("/dashboard/games")}
          variant="outline"
          className="w-full"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Play More Games
        </Button>
      </CardContent>
    </Card>
  );
}
