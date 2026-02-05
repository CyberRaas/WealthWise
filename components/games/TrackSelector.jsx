"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_TRACKS } from "@/lib/gameEngine";
import {
  CheckCircle,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  Shield,
} from "lucide-react";

export default function TrackSelector({
  currentTrack,
  onSelectTrack,
  showDescription = true,
}) {
  const [selectedTrack, setSelectedTrack] = useState(currentTrack || null);
  const [hoveredTrack, setHoveredTrack] = useState(null);

  const tracks = Object.values(USER_TRACKS);

  const handleSelect = (trackId) => {
    setSelectedTrack(trackId);
    if (onSelectTrack) {
      onSelectTrack(trackId);
    }
  };

  const getTrackColor = (color) => {
    const colors = {
      emerald: "from-emerald-500 to-green-600",
      pink: "from-pink-500 to-rose-600",
      blue: "from-blue-500 to-indigo-600",
      violet: "from-violet-500 to-purple-600",
    };
    return colors[color] || "from-slate-500 to-slate-600";
  };

  const getTrackBorder = (color) => {
    const borders = {
      emerald: "border-emerald-500/50 hover:border-emerald-500",
      pink: "border-pink-500/50 hover:border-pink-500",
      blue: "border-blue-500/50 hover:border-blue-500",
      violet: "border-violet-500/50 hover:border-violet-500",
    };
    return borders[color] || "border-slate-500/50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-emerald-500" />
          Choose Your Financial Journey
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Select the track that best describes your financial situation
        </p>
      </div>

      {/* Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredTrack(track.id)}
            onHoverEnd={() => setHoveredTrack(null)}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 border-2 ${
                selectedTrack === track.id
                  ? `${getTrackBorder(track.color)} ring-2 ring-offset-2 ring-${track.color}-500`
                  : `border-slate-200 dark:border-slate-700 ${getTrackBorder(track.color)}`
              } ${selectedTrack === track.id ? "bg-slate-50 dark:bg-slate-800/50" : ""}`}
              onClick={() => handleSelect(track.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTrackColor(track.color)} flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {track.icon}
                    </div>

                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {track.name}
                        {selectedTrack === track.id && (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {track.nameHindi}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs">
                    {track.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {track.description}
                </p>

                {/* Skills */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    You'll Learn:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {track.skills.slice(0, 4).map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs bg-slate-100 dark:bg-slate-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Challenges - Show on hover or selection */}
                <AnimatePresence>
                  {(hoveredTrack === track.id || selectedTrack === track.id) &&
                    showDescription && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700"
                      >
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Challenges You'll Face:
                        </p>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {track.challenges.map((challenge, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>

                {/* Age Group */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Age Group: {track.ageGroup}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      selectedTrack === track.id
                        ? "text-emerald-500 translate-x-1"
                        : "text-slate-400"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedTrack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            className={`bg-gradient-to-r ${getTrackColor(USER_TRACKS[selectedTrack]?.color)} text-white shadow-lg`}
            onClick={() => onSelectTrack && onSelectTrack(selectedTrack)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start as {USER_TRACKS[selectedTrack]?.name}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
