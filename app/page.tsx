"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Search,
  LayoutGrid,
  BookText,
  Smile,
  XCircle,
  Shuffle,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { HabitTracker } from "@/components/habit-tracker";
import { MoodTracker } from "@/components/mood-tracker";
import { Journal } from "@/components/journal";
import { TodoList } from "@/components/todo-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState("dashboard");
  const [wallpaperUrl, setWallpaperUrl] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const fetchNewWallpaper = async () => {
    setIsShuffling(true);
    try {
      const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        console.error(
          "Unsplash Access Key is missing. Please add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your .env.local file."
        );
        setWallpaperUrl(
          "https://images.unsplash.com/photo-1508599589922-36cf54751041?q=80&w=2070&auto=format&fit=crop"
        ); // Fallback
        return;
      }
      const query =
        theme === "dark"
          ? "nature,water,calm,dark"
          : "white,light,minimal,architecture";
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}`
      );
      const data = await response.json();
      if (response.ok && data.urls && data.urls.regular) {
        setWallpaperUrl(data.urls.regular);
      } else {
        console.error("Failed to fetch wallpaper from Unsplash API:", data);
      }
    } catch (error) {
      console.error("Error fetching wallpaper:", error);
    } finally {
      setTimeout(() => setIsShuffling(false), 500);
    }
  };

  useEffect(() => {
    fetchNewWallpaper();
  }, [theme]);

  const renderContent = () => {
    switch (activeView) {
      case "habits":
        return <HabitTracker />;
      case "mood":
        return <MoodTracker />;
      case "journal":
        return <Journal />;
      case "dashboard":
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-lg">
                <div className="p-6 flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    Today's Habits
                  </h3>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold">+2</div>
                  <p className="text-xs text-muted-foreground">
                    +10% from yesterday
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-lg">
                <div className="p-6 flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    Current Mood
                  </h3>
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold">😊</div>
                  <p className="text-xs text-muted-foreground">
                    Feeling great today!
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-lg">
                <div className="p-6 flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium">
                    Journal Entry
                  </h3>
                  <BookText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold">View</div>
                  <p className="text-xs text-muted-foreground">
                    Write about your day
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md text-card-foreground shadow-lg">
              <div className="p-6">
                <h3 className="tracking-tight text-sm font-medium">To-Do</h3>
              </div>
              <div className="p-6">
                <TodoList />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${wallpaperUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r border-white/10 bg-black/10 backdrop-blur-md lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b border-white/10 px-6">
              <a className="flex items-center gap-2 font-semibold" href="#">
                <svg
                  className=" h-6 w-6"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15 6v12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3z" />
                  <path d="M12 6v12" />
                  <path d="M9 6v12a3 3 0 0 0-3 3V9a3 3 0 0 0 3-3z" />
                </svg>
                <span>Produktiv</span>
              </a>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-white/10",
                    {
                      "bg-white/20": activeView === "dashboard",
                    }
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView("habits")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-white/10",
                    {
                      "bg-white/20": activeView === "habits",
                    }
                  )}
                >
                  <XCircle className="h-5 w-5" />
                  Habits
                </button>
                <button
                  onClick={() => setActiveView("mood")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-white/10",
                    {
                      "bg-white/20": activeView === "mood",
                    }
                  )}
                >
                  <Smile className="h-5 w-5" />
                  Mood
                </button>
                <button
                  onClick={() => setActiveView("journal")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-white/10",
                    {
                      "bg-white/20": activeView === "journal",
                    }
                  )}
                >
                  <BookText className="h-5 w-5" />
                  Journal
                </button>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b border-white/10 bg-black/10 backdrop-blur-md px-6">
            <a className="lg:hidden" href="#">
              <svg
                className=" h-6 w-6"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 6v12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3z" />
                <path d="M12 6v12" />
                <path d="M9 6v12a3 3 0 0 0-3 3V9a3 3 0 0 0 3-3z" />
              </svg>
              <span className="sr-only">Home</span>
            </a>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                Welcome back, {user?.firstName}
              </h1>
            </div>
            <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <form className="ml-auto flex-1 sm:flex-initial">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-transparent"
                  />
                </div>
              </form>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchNewWallpaper}
                className="bg-transparent hover:bg-white/10"
                disabled={isShuffling}
              >
                <Shuffle
                  className={cn("h-[1.2rem] w-[1.2rem]", {
                    "animate-spin": isShuffling,
                  })}
                />
              </Button>
              <ModeToggle />
              <UserButton afterSignOutUrl="/sign-in" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleSignOut}
                className="bg-transparent hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}
