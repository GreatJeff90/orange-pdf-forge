import { Moon, Sun, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export const Header = ({ showUserInfo = false }: { showUserInfo?: boolean }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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
          <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold">
            <span>JS</span>
          </div>
        </div>
      </div>

      {showUserInfo && (
        <div className="flex items-center mt-4">
          <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold mr-3">
            <span>JS</span>
          </div>
          <div>
            <p className="font-medium">John Smith</p>
            <p className="text-xs text-muted-foreground">Premium Member</p>
          </div>
        </div>
      )}
    </header>
  );
};
