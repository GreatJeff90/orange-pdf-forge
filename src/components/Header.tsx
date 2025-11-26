import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "@/assets/logo.png";
import { UserAvatar } from "./UserAvatar";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="glass-effect rounded-b-3xl p-4">
      <div className="flex justify-between items-center w-full">
        {/* Left-aligned Logo */}
        <div className="flex items-center">
          <img src={logo} alt="PDF-Orange" className="w-10 h-10 rounded-xl mr-3" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
              PDF-Orange
            </h1>
            <p className="text-xs text-muted-foreground">Futuristic PDF Tools</p>
          </div>
        </div>

        {/* Right-aligned Icons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
            className="w-10 h-10 rounded-full glass-effect hover:bg-orange-500/20"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};
