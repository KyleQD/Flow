"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  CheckCircle, 
  Lock,
  Info,
  TrendingUp,
  Award
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Achievement, UserAchievement } from "@/types/achievements"

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  showProgress?: boolean
  onClick?: () => void
  className?: string
}

const rarityConfig = {
  common: {
    color: 'bg-gray-500',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-600',
    icon: Star,
    glow: 'shadow-gray-500/20'
  },
  uncommon: {
    color: 'bg-green-500',
    borderColor: 'border-green-400',
    textColor: 'text-green-600',
    icon: Star,
    glow: 'shadow-green-500/20'
  },
  rare: {
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600',
    icon: Zap,
    glow: 'shadow-blue-500/20'
  },
  epic: {
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-600',
    icon: Trophy,
    glow: 'shadow-purple-500/20'
  },
  legendary: {
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-600',
    icon: Target,
    glow: 'shadow-yellow-500/20'
  }
}

export function AchievementCard({ 
  achievement, 
  userAchievement, 
  showProgress = true, 
  onClick,
  className 
}: AchievementCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isCompleted = userAchievement?.is_completed || false
  const progress = userAchievement?.progress_percentage || 0
  const rarity = rarityConfig[achievement.rarity]
  const RarityIcon = rarity.icon

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Music: '🎵',
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      Disc3: '💿',
      Zap: <Zap className="h-4 w-4" />,
      Mic: '🎤',
      Star: <Star className="h-4 w-4" />,
      Ticket: '🎫',
      Users: '👥',
      Handshake: '🤝',
      Globe: '🌍',
      DollarSign: '💰',
      Award: <Award className="h-4 w-4" />,
      Heart: '❤️',
      GraduationCap: '🎓'
    }
    return iconMap[iconName] || iconName
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer",
        isCompleted && "ring-2 ring-green-500/50",
        rarity.glow,
        className
      )}
      onClick={onClick}
    >
      {/* Rarity indicator */}
      <div className={cn(
        "absolute top-2 right-2 w-3 h-3 rounded-full",
        rarity.color
      )} />
      
      {/* Background gradient based on completion */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        isCompleted 
          ? "bg-gradient-to-br from-green-400 to-emerald-600" 
          : "bg-gradient-to-br from-gray-400 to-slate-600"
      )} />

      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white",
            isCompleted ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-gray-500 to-slate-600"
          )}>
            {getIconComponent(achievement.icon)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={cn(
                "font-semibold text-lg truncate",
                isCompleted ? "text-green-700" : "text-gray-700"
              )}>
                {achievement.name}
              </h3>
              {isCompleted && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {achievement.description}
            </p>

            {/* Progress */}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className={cn(
                    "h-2",
                    isCompleted ? "bg-green-100" : "bg-gray-100"
                  )}
                />
                {userAchievement && (
                  <div className="text-xs text-gray-500">
                    {userAchievement.current_value} / {userAchievement.target_value}
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  rarity.borderColor,
                  rarity.textColor
                )}
              >
                <RarityIcon className="h-3 w-3 mr-1" />
                {achievement.rarity}
              </Badge>
              
              <Badge 
                variant="outline" 
                className="text-xs border-gray-300 text-gray-600"
              >
                {achievement.points} pts
              </Badge>

              <Badge 
                variant="outline" 
                className="text-xs border-gray-300 text-gray-600"
              >
                {achievement.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Completion indicator */}
        {isCompleted && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
        )}

        {/* Details button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            setShowDetails(!showDetails)
          }}
        >
          <Info className="h-4 w-4" />
        </Button>

        {/* Requirements details */}
        {showDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Requirements:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(achievement.requirements).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    userAchievement?.progress_data?.[key] ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span className="capitalize">{key.replace(/_/g, ' ')}: {value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 