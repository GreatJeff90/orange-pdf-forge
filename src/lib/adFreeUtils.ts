import { formatDistanceToNow, isPast, format } from "date-fns";

export interface AdFreeStatus {
  isAdFree: boolean;
  expiresAt: Date | null;
  timeRemaining: string;
  formattedDate: string;
}

export function getAdFreeStatus(adFreeUntil: string | null): AdFreeStatus {
  if (!adFreeUntil) {
    return {
      isAdFree: false,
      expiresAt: null,
      timeRemaining: "Not active",
      formattedDate: "No ad-free time",
    };
  }

  const expiresAt = new Date(adFreeUntil);
  const isAdFree = !isPast(expiresAt);

  if (!isAdFree) {
    return {
      isAdFree: false,
      expiresAt,
      timeRemaining: "Expired",
      formattedDate: format(expiresAt, "MMM d, yyyy"),
    };
  }

  return {
    isAdFree: true,
    expiresAt,
    timeRemaining: formatDistanceToNow(expiresAt, { addSuffix: true }),
    formattedDate: format(expiresAt, "MMM d, yyyy 'at' h:mm a"),
  };
}
