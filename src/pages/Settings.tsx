import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const Settings = () => {
  // Initialize state directly to 'light' or 'dark', avoiding 'system' state.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    // Check for saved theme first
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }
    // If no saved theme, use system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Effect to apply the theme class to the root element and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle function simply flips between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="flex items-center justify-between mt-2">
            <p>Theme</p>
            <Button onClick={toggleTheme} variant="outline" size="icon">
              {/* Icon represents the theme you will switch TO. If current is light, show moon. */}
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Settings;
