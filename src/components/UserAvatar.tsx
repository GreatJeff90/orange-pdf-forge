import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserCoins } from "@/hooks/useCoins";
import { useNavigate } from "react-router-dom";

export const UserAvatar = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { data: coins } = useUserCoins();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data);
      }
    };

    fetchUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile(data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatCoins = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "0";
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => navigate("/profile")}
      title="Profile"
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-orange"
        />
      ) : (
        <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold">
          <span>{user?.email?.charAt(0).toUpperCase() || "U"}</span>
        </div>
      )}
      <div className="absolute -bottom-1 -right-2 bg-background text-foreground text-xs font-bold px-1.5 py-0.5 rounded-full border border-orange">
        {formatCoins(coins?.coins)}
      </div>
    </div>
  );
};
