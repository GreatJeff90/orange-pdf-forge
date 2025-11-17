import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const Header = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="glass-effect rounded-b-3xl p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
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
    </header>
  );
};
