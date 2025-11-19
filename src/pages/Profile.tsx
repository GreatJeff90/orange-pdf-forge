import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  HelpCircle, 
  Star,
  CreditCard,
  LogOut,
  ChevronRight,
  Award,
  TrendingUp,
  Coins,
  Plus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserCoins, useTransactions } from "@/hooks/useCoins";
import { useConversions } from "@/hooks/useConversions";
import { CoinPurchaseModal } from "@/components/CoinPurchaseModal";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { data: coins, isLoading: coinsLoading } = useUserCoins();
  const { data: conversions } = useConversions();
  const { data: transactions } = useTransactions();

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

  const initials = userProfile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />

      <main className="p-4 space-y-6">
        {/* Profile Header Card */}
        <div className="glass-effect rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ background: "hsl(var(--orange))" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "hsl(var(--orange))" }} />
          
          <div className="relative z-10 flex items-center mb-4">
            {userProfile?.avatar_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mr-4 neon-glow border-2 border-orange">
                <img
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-2xl mr-4 neon-glow">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{userProfile?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {userProfile?.email || "user@email.com"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-3 py-1 rounded-full gradient-orange text-white text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Premium Member
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
            <div className="text-center">
              {coinsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange" />
              ) : (
                <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                  {coins?.toLocaleString() || 0}
                </div>
              )}
              <div className="text-xs text-muted-foreground">Coins</div>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                {conversions?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                {transactions?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
          </div>
        </div>

        {/* Coin Balance & Purchase */}
        <div className="glass-effect rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5 text-orange" />
              Coin Balance
            </h3>
            <Button
              onClick={() => setShowCoinModal(true)}
              size="sm"
              className="gradient-orange text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Buy Coins
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 glass-effect rounded-xl">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              {coinsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-orange mt-1" />
              ) : (
                <p className="text-3xl font-bold text-orange">{coins?.toLocaleString() || 0}</p>
              )}
            </div>
            <div className="w-16 h-16 rounded-full gradient-orange flex items-center justify-center neon-glow">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-effect rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-orange" />
              Achievements
            </h3>
            <span className="text-xs text-orange">3/12</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl gradient-orange flex items-center justify-center neon-glow">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-shrink-0 w-16 h-16 rounded-xl glass-effect flex items-center justify-center border-2 border-dashed border-border">
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-shrink-0 w-16 h-16 rounded-xl glass-effect flex items-center justify-center border-2 border-dashed border-border">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-shrink-0 w-16 h-16 rounded-xl glass-effect flex items-center justify-center border-2 border-dashed border-border">
              <Coins className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="glass-effect rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-orange" />
                <span className="text-sm">Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-orange" />
                <span className="text-sm">Payment Methods</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-orange" />
                <span className="text-sm">Privacy & Security</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange" />
                <span className="text-sm">Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-orange" />
                <span className="text-sm">Theme</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-orange" />
                <span className="text-sm">Language</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-orange" />
                <span className="text-sm">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full glass-effect border-red-500/20 text-red-500 hover:bg-red-500/10 py-6"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>

      <BottomNav />
      <CoinPurchaseModal isOpen={showCoinModal} onClose={() => setShowCoinModal(false)} />
      <ProfileEditModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        currentProfile={{
          full_name: userProfile?.full_name || null,
          avatar_url: userProfile?.avatar_url || null,
        }}
        onUpdate={fetchProfile}
      />
    </div>
  );
};

export default Profile;