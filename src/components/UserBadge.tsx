import { Crown, Sparkles } from "lucide-react";

interface UserBadgeProps {
  badge: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const UserBadge = ({ badge, size = "md", showLabel = true }: UserBadgeProps) => {
  const badgeConfig = {
    founder: {
      label: "Founder",
      icon: Crown,
      gradient: "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600",
      textColor: "text-amber-500",
      glow: "shadow-lg shadow-amber-500/50",
    },
    freemium: {
      label: "Freemium",
      icon: Sparkles,
      gradient: "bg-gradient-to-r from-gray-500 to-gray-600",
      textColor: "text-gray-500",
      glow: "shadow-sm shadow-gray-500/30",
    },
  };

  const config = badgeConfig[badge as keyof typeof badgeConfig] || badgeConfig.freemium;
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: "px-2 py-0.5",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      container: "px-2.5 py-1",
      icon: "w-3.5 h-3.5",
      text: "text-xs",
    },
    lg: {
      container: "px-3 py-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
  };

  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`${config.gradient} ${config.glow} ${sizeClass.container} rounded-full text-white font-semibold flex items-center gap-1.5 w-fit`}
    >
      <Icon className={sizeClass.icon} />
      {showLabel && <span className={sizeClass.text}>{config.label}</span>}
    </div>
  );
};
