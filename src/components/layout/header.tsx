// Header Component
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/plans', label: 'Plans', icon: 'plans' },
  { href: '/decisions', label: 'Decisions', icon: 'decisions' },
  { href: '/runs', label: 'Agent Runs', icon: 'runs' },
  { href: '/tools', label: 'Tools', icon: 'tools' },
  { href: '/evaluations', label: 'Evaluations', icon: 'evaluations' },
];

export function Header() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      const { authService } = await import('@/services/auth');
      await authService.logout();
      useAuthStore.getState().logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border' : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="font-orbitron text-sm font-bold text-primary-foreground">K</span>
                </div>
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-neon-red pulse-glow" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-orbitron text-lg font-bold tracking-wider text-foreground">
                  KAIROS
                </h1>
                <p className="text-[10px] font-techno text-muted-foreground -mt-1 tracking-[0.2em]">
                  AUTOMATION PLATFORM
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-[10px] font-techno text-muted-foreground">
                    NERV OPERATOR
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center border border-border">
                  <span className="text-xs font-bold text-foreground">
                    {getInitials(user.display_name || user.username)}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="hidden sm:flex"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 mt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}