import { Home, Coins, History, User } from "lucide-react";
import { NavLink } from "./NavLink";

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 p-4">
      <div className="max-w-md mx-auto rounded-[50px] overflow-hidden bg-orange/90 backdrop-blur-lg">
        <div className="grid grid-cols-4 text-white/70">
          <NavLink
            to="/"
            className="flex flex-col items-center py-3 transition-colors"
            activeClassName="text-white relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white"
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </NavLink>
          <NavLink
            to="/earn"
            className="flex flex-col items-center py-3 transition-colors"
            activeClassName="text-white relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white"
          >
            <Coins className="w-5 h-5 mb-1" />
            <span className="text-xs">Earn</span>
          </NavLink>
          <NavLink
            to="/history"
            className="flex flex-col items-center py-3 transition-colors"
            activeClassName="text-white relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white"
          >
            <History className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </NavLink>
          <NavLink
            to="/profile"
            className="flex flex-col items-center py-3 transition-colors"
            activeClassName="text-white relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white"
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs">Profile</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
