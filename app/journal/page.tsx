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
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Journal } from "@/components/journal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
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
import Link from "next/link";

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
  { id: "journal", label: "Journal", icon: BrainCircuit, tourId: "tour-step-5", isPage: true },
  { id: "todo", label: "To-Do", icon: ListTodo, tourId: "tour-step-3" },
  { id: "media", label: "Media", icon: Clapperboard },
  { id: "routines", label: "Routines", icon: ClipboardList },
  { id: "goals", label: "Goals", icon: Target, tourId: "tour-step-4" },
  { id: "finance", label: "Finance", icon: Wallet },
];

export default function JournalPage() {
  const { user, isAuthenticated, isLoading, logout, getAuthHeaders, apiUrl } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [wallpaperUrl, setWallpaperUrl] = useState("");
  const [isShuffling, setIsShuffling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
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
        setWallpaperUrl(
          "https://images.unsplash.com/photo-1508599589922-36cf54751041?q=80&w=2070&auto=format&fit=crop"
        );
        return;
      }
      
      const query =
        theme === "dark"
          ? "nature,water,calm,dark"
          : "white,light,minimal,architecture";
      
      const apiUrl = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${accessKey}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (response.ok && data.urls && data.urls.regular) {
        setWallpaperUrl(data.urls.regular);
        localStorage.setItem('dashboard-wallpaper', data.urls.regular);
        setRetryCount(0);
      } else {
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchNewWallpaper();
          }, 1000);
          return;
        } else {
          setRetryCount(0);
          setWallpaperUrl('');
        }
      }
    } catch (error) {
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchNewWallpaper();
        }, 1000);
        return;
      } else {
        setRetryCount(0);
        setWallpaperUrl('');
      }
    } finally {
      setTimeout(() => {
        setIsShuffling(false);
      }, 500);
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

  // Auto-change wallpaper when theme changes
  useEffect(() => {
    if (theme) {
      console.log('🎨 Theme changed to:', theme);
      console.log('🔄 Auto-fetching new wallpaper for theme change');
      fetchNewWallpaper();
    }
  }, [theme]);

  const handleNavigation = (item: SidebarItem) => {
    if (item.isPage) {
      router.push(`/${item.id}`);
    } else {
      router.push('/');
    }
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: wallpaperUrl 
            ? `url(${wallpaperUrl})` 
            : 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        {!wallpaperUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 pointer-events-none" />
        )}
        {wallpaperUrl && (
          <img 
            src={wallpaperUrl} 
            alt=""
            className="hidden"
            onError={() => {
              setWallpaperUrl('');
            }}
          />
        )}
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
                <span>Life OS</span>
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
                          "bg-white/20": item.isPage ? pathname === `/${item.id}` : false,
                        }
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b border-white/10 bg-black/10 px-6 backdrop-blur-md lg:h-[60px] lg:px-6">
            <div className="lg:hidden">
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
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
                            "bg-white/20":
                              item.isPage
                                ? pathname === `/${item.id}`
                                : false,
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
              <h1 className="text-lg font-semibold">Journal</h1>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <form className="hidden lg:block flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full appearance-none bg-white/5 pl-8 shadow-none"
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
                  <DropdownMenuItem asChild>
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
            <GlassCard>
              <Journal />
            </GlassCard>
          </main>
        </div>
      </div>
    </>
  );
}
