import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Conversion {
  id: string;
  conversion_type: string;
  status: string;
  input_file_path: string;
  output_file_path: string | null;
  error_message: string | null;
  cost: number;
  created_at: string;
  completed_at: string | null;
}

export function useConversions() {
  return useQuery({
    queryKey: ["conversions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Conversion[];
    },
  });
}

export function useConversionDownload() {
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("conversions")
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  };

  return { downloadFile };
}