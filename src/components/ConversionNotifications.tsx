import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export const ConversionNotifications = () => {
  const trackedConversions = useRef(new Set<string>());

  useEffect(() => {
    const channel = supabase
      .channel("conversion-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversions",
        },
        (payload) => {
          const conversion = payload.new;
          const conversionId = conversion.id;

          // Only notify once per conversion completion
          if (trackedConversions.current.has(conversionId)) {
            return;
          }

          if (conversion.status === "completed") {
            trackedConversions.current.add(conversionId);
            
            const conversionType = conversion.conversion_type
              .replace(/_/g, " ")
              .toUpperCase();

            toast.success(
              `${conversionType} conversion complete!`,
              {
                description: "Your file is ready to download in History",
                icon: <CheckCircle className="w-5 h-5" />,
                duration: 5000,
              }
            );
          } else if (conversion.status === "failed") {
            trackedConversions.current.add(conversionId);
            
            const conversionType = conversion.conversion_type
              .replace(/_/g, " ")
              .toUpperCase();

            toast.error(
              `${conversionType} conversion failed`,
              {
                description: conversion.error_message || "Please try again",
                icon: <XCircle className="w-5 h-5" />,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};
