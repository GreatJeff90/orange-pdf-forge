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
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />

      <main className="p-4 space-y-6">
        {/* Profile Header Card */}
        <div className="glass-effect rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ background: "hsl(var(--orange))" }} />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10" style={{ background: "hsl(var(--orange))" }} />
          
          <div className="relative z-10 flex items-center mb-4">
            <div className="w-20 h-20 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-2xl mr-4 neon-glow">
              JS
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">John Smith</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                john.smith@email.com
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
              <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                5,240
              </div>
              <div className="text-xs text-muted-foreground">Coins</div>
            </div>
            <div className="text-center border-x border-border/50">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                127
              </div>
              <div className="text-xs text-muted-foreground">Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                45
              </div>
              <div className="text-xs text-muted-foreground">Days Active</div>
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
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="glass-effect rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Account Settings</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Edit Profile</p>
                  <p className="text-xs text-muted-foreground">Update your information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Security</p>
                  <p className="text-xs text-muted-foreground">Password & authentication</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Billing & Plan</p>
                  <p className="text-xs text-muted-foreground">Manage subscription</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-effect rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Preferences</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Notifications</p>
                  <p className="text-xs text-muted-foreground">Manage alerts</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Appearance</p>
                  <p className="text-xs text-muted-foreground">Theme & display</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Language</p>
                  <p className="text-xs text-muted-foreground">English (US)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="glass-effect rounded-2xl p-4">
          <h3 className="font-semibold mb-3">Support</h3>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Help Center</p>
                  <p className="text-xs text-muted-foreground">FAQs & support</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full glass-effect border-destructive/50 text-destructive hover:bg-destructive/10 rounded-xl py-6 font-medium"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>

        <div className="text-center text-xs text-muted-foreground py-4">
          Version 1.0.0 • Made with ❤️
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
