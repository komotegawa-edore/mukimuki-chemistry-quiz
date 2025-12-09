'use client'

import {
  BookOpen,
  Heart,
  Compass,
  Target,
  Wrench,
  Palette,
  Moon,
  Brain,
  Zap,
  PartyPopper,
  Rocket,
  Lightbulb,
  Briefcase,
  Users,
  Sparkles,
  Crown,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Heart,
  Compass,
  Target,
  Wrench,
  Palette,
  Moon,
  Brain,
  Zap,
  PartyPopper,
  Rocket,
  Lightbulb,
  Briefcase,
  Users,
  Sparkles,
  Crown,
}

interface TypeIconProps {
  iconName: string
  className?: string
}

export default function TypeIcon({ iconName, className }: TypeIconProps) {
  const Icon = iconMap[iconName]

  if (!Icon) {
    return <Sparkles className={className} />
  }

  return <Icon className={className} />
}
