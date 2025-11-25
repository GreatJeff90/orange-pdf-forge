import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ConversionProgressProps {
  status: string;
  createdAt: string;
  completedAt?: string | null;
}

export const ConversionProgress = ({
  status,
  createdAt,
  completedAt,
}: ConversionProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");

  useEffect(() => {
    if (status === "completed" || status === "failed") {
      setProgress(100);
      return;
    }

    if (status !== "processing") {
      setProgress(0);
      return;
    }

    // Simulate progress for processing conversions
    const startTime = new Date(createdAt).getTime();
    const estimatedDuration = 60000; // Estimate 60 seconds for conversion

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const estimatedProgress = Math.min((elapsed / estimatedDuration) * 100, 95);
      
      setProgress(estimatedProgress);

      const remainingMs = Math.max(0, estimatedDuration - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      if (remainingSec > 0) {
        setEstimatedTime(`~${remainingSec}s remaining`);
      } else {
        setEstimatedTime("Finalizing...");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, createdAt]);

  if (status === "completed" || status === "failed") {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
        <span className="text-sm font-medium">
          {status === "processing" ? "Converting" : "Queued"}
        </span>
        {status === "processing" && (
          <span className="text-xs text-muted-foreground">{estimatedTime}</span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-xs text-muted-foreground text-right">
        {Math.round(progress)}%
      </div>
    </div>
  );
};
