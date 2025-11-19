import { LucideIcon } from "lucide-react";
import { Progress } from "./ui/progress";

interface AchievementCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
  gradient: string;
}

export const AchievementCard = ({
  icon: Icon,
  title,
  description,
  current,
  target,
  unlocked,
  gradient,
}: AchievementCardProps) => {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div
      className={`glass-effect rounded-xl p-4 border-2 transition-all ${
        unlocked
          ? "border-orange/50 shadow-lg shadow-orange/20"
          : "border-border opacity-75"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`${gradient} w-12 h-12 rounded-xl flex items-center justify-center ${
            unlocked ? "shadow-lg" : "opacity-60"
          }`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{title}</h4>
            {unlocked && (
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                Unlocked
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className={`font-semibold ${unlocked ? "text-green-500" : "text-orange"}`}>
            {current}/{target}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};
