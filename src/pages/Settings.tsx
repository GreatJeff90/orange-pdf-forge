import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const Settings = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p>This is the settings page.</p>
      </main>
      <BottomNav />
    </div>
  );
};

export default Settings;
