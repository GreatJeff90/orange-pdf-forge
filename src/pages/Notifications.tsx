import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const Notifications = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p>This is the notifications page.</p>
      </main>
      <BottomNav />
    </div>
  );
};

export default Notifications;
