import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  popular: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export function useUserCoins() {
  return useQuery({
    queryKey: ["user-coins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data.coins as number;
    },
  });
}

export function useCoinPackages() {
  return useQuery({
    queryKey: ["coin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coin_packages")
        .select("*")
        .order("coins", { ascending: true });

      if (error) throw error;
      return data as CoinPackage[];
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useAddCoins() {
  const queryClient = useQueryClient();

  const addCoins = async (packageId: string) => {
    // Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from("coin_packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (pkgError) throw pkgError;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Add coins using the database function
    const { error: addError } = await supabase.rpc("add_coins", {
      p_user_id: user.id,
      p_amount: pkg.coins,
      p_description: `Purchased ${pkg.name} package`,
    });

    if (addError) throw addError;

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["user-coins"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return { addCoins };
}