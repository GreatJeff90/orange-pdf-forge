import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversion } from "./useConversions";

export function useRealtimeConversions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("conversions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversions",
        },
        (payload) => {
          console.log("Realtime conversion update:", payload);

          // Update the conversions query cache
          queryClient.setQueryData(
            ["conversions"],
            (old: Conversion[] | undefined) => {
              if (!old) return old;

              if (payload.eventType === "INSERT") {
                return [payload.new as Conversion, ...old];
              }

              if (payload.eventType === "UPDATE") {
                return old.map((conversion) =>
                  conversion.id === payload.new.id
                    ? (payload.new as Conversion)
                    : conversion
                );
              }

              if (payload.eventType === "DELETE") {
                return old.filter(
                  (conversion) => conversion.id !== payload.old.id
                );
              }

              return old;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
