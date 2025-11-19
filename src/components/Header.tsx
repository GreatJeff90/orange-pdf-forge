import { Moon, Sun, FileText, LogOut, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { useUserCoins } from "@/hooks/useCoins";

export const Header = ({ showUserInfo = false }: { showUserInfo?: boolean }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: coins } = useUserCoins();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/onboarding");
    }
  };

  return (
    <header className="glass-effect rounded-b-3xl p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center mr-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
              PDF-Orange
            </h1>
            <p className="text-xs text-muted-foreground">Futuristic PDF Tools</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => navigate("/profile")}
            className="glass-effect px-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <Coins className="w-4 h-4 text-orange" />
            <span className="text-sm font-bold text-orange">{coins?.toLocaleString() || 0}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="glass-effect w-10 h-10 rounded-full flex items-center justify-center hover:rotate-[30deg] transition-transform duration-300"
          >
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-10 h-10 rounded-full glass-effect hover:bg-orange-500/20"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          
          <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold">
            <span>{user?.email?.charAt(0).toUpperCase() || "U"}</span>
          </div>
        </div>
      </div>

      {showUserInfo && (
        <div className="flex items-center mt-4">
          <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold mr-3">
            <span>{user?.email?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div>
            <p className="font-medium">{user?.email?.split('@')[0] || "User"}</p>
            <p className="text-xs text-muted-foreground">Premium Member</p>
          </div>
        </div>
      )}
    </header>
  );
};
