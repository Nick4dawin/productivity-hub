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
import { LogOut, Settings, Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
import Link from "next/link";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isPage?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "habits", label: "Habits", icon: CalendarCheck },
  { id: "mood", label: "Mood", icon: Smile },
  { id: "journal", label: "Journal", icon: BrainCircuit },
  { id: "todo", label: "To-Do", icon: ListTodo },
  { id: "media", label: "Media", icon: Clapperboard },
  { id: "routines", label: "Routines", icon: ClipboardList },
  { id: "goals", label: "Goals", icon: Target },
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
      const response = await fetch(`${apiUrl}/user`, {
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
              <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
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
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center justify-between gap-4 border-b border-white/10 bg-black/10 backdrop-blur-md px-6">
            <div className="lg:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="bottom" 
                  align="start"
                  className="bg-black/20 border-white/10 backdrop-blur-lg text-white"
                >
                  <nav className="grid gap-2 text-lg font-medium">
                    {SIDEBAR_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          "flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:bg-white/10",
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1 lg:hidden">
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
            <div className="hidden flex-1 lg:block">
              <h1 className="text-lg font-semibold">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <form className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px] bg-transparent"
                  />
                </div>
              </form>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={fetchNewWallpaper}
                disabled={isShuffling}
              >
                <Shuffle className="h-5 w-5" />
                <span className="sr-only">Shuffle Wallpaper</span>
              </Button>
              <ModeToggle />
              {isAuthenticated && user ? (
                <div onMouseEnter={() => setIsMenuOpen(true)} onMouseLeave={() => setIsMenuOpen(false)}>
                  <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePicture} alt={user.name} />
                          <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-white/5 border-white/10 backdrop-blur-md text-white"
                    >
                      <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                      <DropdownMenuLabel className="text-xs font-normal text-white/60">{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)} 
                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Account</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={logout}
                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
      <Toaster />
    </>
  );
}
