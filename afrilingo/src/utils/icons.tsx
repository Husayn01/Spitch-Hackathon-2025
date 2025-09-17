import {
  Circle,        // Use for cowrie shells (circular shape)
  Flame,
  Trophy,
  Rocket,
  Globe,
  Drama,         // Theater masks for Yoruba
  Bird,          // For Igbo
  Star,          // For Hausa
  PartyPopper,
  Lightbulb,
  Book,
  Zap,           // More common than PlugZap
  CheckCircle,
  Loader2,
  Volume2,
  Mic,
  MessageCircle,
  Users,
  Award,
  TrendingUp,
  Heart,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';

// Icon mapping for consistent usage across the app
export const Icons = {
  // Game currency - using Circle to represent cowrie shells
  cowrieShell: Circle,
  
  // Achievements and progress
  streak: Flame,
  achievement: Trophy,
  level: TrendingUp,
  xp: Star,
  celebrate: PartyPopper,
  
  // Learning
  tip: Lightbulb,
  story: Book,
  pronunciation: Volume2,
  recording: Mic,
  conversation: MessageCircle,
  
  // Cultural elements
  yorubaMask: Drama,     // Theater masks represent Yoruba performance culture
  igboBird: Bird,        // Eagle is significant in Igbo culture
  hausaStar: Star,       // Islamic/celestial symbols for Hausa
  
  // Navigation and actions
  start: Rocket,
  explore: Globe,
  next: ChevronRight,
  
  // Status
  offline: Zap,
  success: CheckCircle,
  loading: Loader2,
  
  // Community
  community: Users,
  badge: Award,
  
  // General
  info: Info,
  alert: AlertCircle,
  heart: Heart,
  calendar: Calendar,
  time: Clock,
  location: MapPin
} as const;

// Helper function to get icon by name
export const getIcon = (name: keyof typeof Icons): LucideIcon => {
  return Icons[name];
};

// Common icon props for consistent styling
export const iconProps = {
  small: { size: 16, strokeWidth: 2 },
  medium: { size: 20, strokeWidth: 2 },
  large: { size: 24, strokeWidth: 2 },
  xlarge: { size: 32, strokeWidth: 1.5 }
} as const;

// Icon with default props component
export interface IconProps {
  icon: keyof typeof Icons;
  size?: keyof typeof iconProps;
  className?: string;
}

export const Icon = ({ icon, size = 'medium', className = '' }: IconProps) => {
  const IconComponent = Icons[icon];
  return <IconComponent {...iconProps[size]} className={className} />;
};