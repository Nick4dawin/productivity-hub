"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, Settings, User, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteAccountDialog } from './delete-account-dialog';
import { useToast } from './ui/use-toast';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/todos', label: 'Todos' },
  { href: '/habits', label: 'Habits' },
  { href: '/moods', label: 'Mood Tracker' },
  { href: '/journal', label: 'Journal' },
  { href: '/routines', label: 'Routines' },
  { href: '/goals', label: 'Goals' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, getAuthHeaders } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to delete account');
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      logout(); // Log out and redirect
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.profilePicture} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="bg-white/5 border-white/10 backdrop-blur-md text-white"
                >
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </>
  );
}
