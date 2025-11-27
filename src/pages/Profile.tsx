import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Coins, ChevronRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserCoins } from "@/hooks/useCoins";
import { useConversions } from "@/hooks/useConversions";
import { useNavigate } from "react-router-dom";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { CoinPurchaseModal } from "@/components/CoinPurchaseModal";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const { data: coins } = useUserCoins();
  const { data: conversions } = useConversions();
  const { toast } = useToast();

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setUserProfile(data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handlePlaceholderClick = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} functionality will be available in a future update.`,
    });
  };

  const initials = userProfile?.full_name
    ? userProfile.full_name.charAt(0).toUpperCase()
    : userProfile?.email?.charAt(0).toUpperCase() || "U";

  const displayName = userProfile?.full_name || userProfile?.email || "User";

  return (
    <div className="bg-premium-dark min-h-screen">
      <Header />
      <main className="px-6 py-4 space-y-4 mb-20">
        {/* Section 1: User Identity */}
        <div className="h-[120px] flex items-center justify-between">
          <div className="flex items-center">
            {userProfile?.avatar_url ? (
              <div className="w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-premium-orange">
                <img
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 flex-shrink-0 rounded-full bg-premium-orange flex items-center justify-center text-white font-bold text-4xl border-2 border-premium-orange">
                {initials}
              </div>
            )}
            <div className="ml-4">
              <p className="text-lg font-semibold text-white truncate max-w-[150px]">{displayName}</p>
              <p className="text-sm text-[#999999]">Free Account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#999999] hover:text-white"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Section 2: Coin Balance & Top-Up */}
        <div>
          <hr className="border-t border-[#2A2A2A]" />
          <div className="mt-4 bg-[#1E1E1E] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Coins className="w-6 h-6 text-premium-orange mr-2" />
                <span className="text-2xl font-bold text-white">{coins?.coins?.toLocaleString() || 0} Coins</span>
              </div>
              <Button
                className="bg-premium-orange text-white rounded-xl text-base font-medium h-full"
                onClick={() => setIsCoinModalOpen(true)}
              >
                Buy Coins
              </Button>
            </div>
            <p className="text-xs text-[#888888] mt-2">
              Purchase coins to remove ads. Conversions are free!
            </p>
          </div>
        </div>

        {/* Section 3: Quick Stats */}
        <div className="flex space-x-2">
          <div className="bg-[#2A2A2A] text-[#AAAAAA] text-xs px-3 py-1 rounded-full">
            Total Conversions · {conversions?.length || 0}
          </div>
          <div className="bg-[#2A2A2A] text-[#AAAAAA] text-xs px-3 py-1 rounded-full">
            Files Processed · {conversions?.length || 0}
          </div>
        </div>

        {/* Section 4: Settings List */}
        <div className="bg-[#1E1E1E] rounded-2xl">
          <SettingsButton
            text="Upgrade to PRO"
            special
            onClick={() => setIsCoinModalOpen(true)}
          />
          <SettingsButton
            text="Payment Methods"
            onClick={() => handlePlaceholderClick("Payment Methods")}
          />
          <SettingsButton
            text="Privacy & Security"
            onClick={() => handlePlaceholderClick("Privacy & Security")}
          />
          <SettingsButton
            text="Notifications"
            onClick={() => navigate("/notifications")}
          />
          <SettingsButton
            text="Appearance"
            onClick={() => navigate("/settings")}
          />
          <SettingsButton
            text="Language & Region"
            onClick={() => handlePlaceholderClick("Language & Region")}
          />
          <SettingsButton
            text="Help & Support"
            onClick={() => handlePlaceholderClick("Help & Support")}
          />
        </div>

        <div className="text-center mt-10 pb-6">
          <button
            onClick={handleSignOut}
            className="text-red-500 font-medium hover:underline"
          >
            Sign Out
          </button>
        </div>
      </main>

      {userProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={userProfile}
          onUpdate={fetchProfile}
        />
      )}

      <CoinPurchaseModal
        isOpen={isCoinModalOpen}
        onClose={() => setIsCoinModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
};

const SettingsButton = ({
  text,
  special = false,
  onClick,
}: {
  text: string;
  special?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 border-b border-[#2A2A2A] last:border-b-0 hover:bg-[#2A2A2A] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
  >
    <span className={special ? "text-premium-orange font-semibold" : "text-white"}>
      {text}
    </span>
    <ChevronRight className="w-5 h-5 text-[#999999]" />
  </button>
);

export default Profile;
