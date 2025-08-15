"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import {
  Search,
  Smile,
  Shuffle,
  ClipboardList,
  Target,
  ListTodo,
  Clapperboard,
  Activity,
  CalendarCheck,
  BrainCircuit,
  Wallet,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { HabitTracker } from "@/components/habit-tracker";
import { MoodTracker } from "@/components/mood-tracker";
import { Journal } from "@/components/journal";
import { TodoList } from "@/components/todo-list";
import RoutinesPage from "./routines/page";
import GoalsPage from "./goals/page";
import MediaPage from "./media/page";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Analytics } from "@/components/analytics";
import { Toaster } from "@/components/ui/toaster";
import { FinanceTracker } from "@/components/finance-tracker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import Link from "next/link";
import dynamic from 'next/dynamic';

const AppTour = dynamic(() => import('@/components/app-tour').then(mod => mod.AppTour), {
  ssr: false,
});

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isPage?: boolean;
  tourId?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "habits", label: "Habits", icon: CalendarCheck },
  { id: "mood", label: "Mood", icon: Smile },
  { id: "journal", label: "Journal", icon: BrainCircuit, tourId: "tour-step-5" },
  { id: "todo", label: "To-Do", icon: ListTodo, tourId: "tour-step-3" },
  { id: "media", label: "Media", icon: Clapperboard },
  { id: "routines", label: "Routines", icon: ClipboardList },
  { id: "goals", label: "Goals", icon: Target, tourId: "tour-step-4" },
  { id: "finance", label: "Finance", icon: Wallet },
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, getAuthHeaders, apiUrl } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState("dashboard");
  const [wallpaperUrl, setWallpaperUrl] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchNewWallpaper = async () => {
    if (isShuffling) return;
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
        localStorage.setItem('dashboard-wallpaper', data.urls.regular);
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
    const savedWallpaper = localStorage.getItem('dashboard-wallpaper');
    if (savedWallpaper) {
      setWallpaperUrl(savedWallpaper);
    } else {
      fetchNewWallpaper();
    }
  }, []);

  // Listen for navigation events from Analytics component
  useEffect(() => {
    const handleNavigateEvent = (e: CustomEvent) => {
      const { view } = e.detail;
      if (view) {
        setActiveView(view);
      }
    };

    window.addEventListener('navigate', handleNavigateEvent as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigateEvent as EventListener);
    };
  }, []);

  const handleNavigation = (item: SidebarItem) => {
    if (item.isPage) {
      router.push(`/${item.id}`);
    } else {
      setActiveView(item.id);
    }
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "habits":
        return <GlassCard><HabitTracker /></GlassCard>;
      case "mood":
        return <GlassCard><MoodTracker /></GlassCard>;
      case "journal":
        return <GlassCard><Journal /></GlassCard>;
      case "routines":
        return <GlassCard><RoutinesPage /></GlassCard>;
      case "goals":
        return <GlassCard><GoalsPage /></GlassCard>;
      case "todo":
        return <GlassCard><TodoList /></GlassCard>;
      case "media":
        return <MediaPage />;
      case "finance":
        return <GlassCard><FinanceTracker /></GlassCard>;
      case "dashboard":
      default:
        return (
          <GlassCard>
            <Analytics />
          </GlassCard>
        );
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to delete account');
      }
      
      logout(); // Log out and redirect
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      fetchNewWallpaper();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${wallpaperUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <AppTour />
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div id="tour-step-2" className="hidden border-r border-white/10 bg-black/10 backdrop-blur-md lg:block">
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
              <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      id={item.tourId}
                      onClick={() => handleNavigation(item)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-all hover:bg-white/10",
                        {
                          "bg-white/20": item.isPage ? pathname === `/${item.id}` : activeView === item.id,
                        }
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="mt-auto p-4">
                {/* User button was here, now moved to header */}
              </div>
            </div>
          </div>
        </div>
        <div id="tour-step-1" className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b border-white/10 bg-black/10 px-6 backdrop-blur-md lg:h-[60px] lg:px-6">
            <div className="lg:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    id="tour-step-mobile-1"
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="start"
                  id="tour-step-mobile-2"
                  className="bg-black/20 border-white/10 backdrop-blur-lg text-white"
                >
                  <nav className="grid gap-2 text-lg font-medium">
                    {SIDEBAR_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        id={item.tourId}
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          "flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:bg-white/10",
                          {
                            "bg-white/20":
                              item.isPage
                                ? pathname === `/${item.id}`
                                : activeView === item.id,
                          }
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <form className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full appearance-none bg-white/5 pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={fetchNewWallpaper}
              >
                <Shuffle className={`h-5 w-5 transition-transform duration-500 ${isShuffling ? "animate-spin" : ""}`} />
                <span className="sr-only">Shuffle Wallpaper</span>
              </Button>
              <ModeToggle />
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.profilePicture || ""}
                        alt={user?.name}
                      />
                      <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-white/10 bg-black/80 text-white"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild id="tour-step-6">
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      <Toaster />
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </>
  );
}
