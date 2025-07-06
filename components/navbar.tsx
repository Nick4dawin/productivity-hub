"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ModeToggle } from './mode-toggle';

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

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4 sm:space-x-8">
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
