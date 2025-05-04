import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AccessibilityPanel } from '@/components/accessibility/accessibility-panel';
import {
  BarChart3,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/projects', label: 'Projects', icon: LayoutGrid },
    { href: '/tasks', label: 'Tasks', icon: ListChecks },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin', label: 'Admin', icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <ListChecks className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">RedmineClone</span>
          </Link>
        </div>

        {!isMobile && (
          <nav className="mx-6 flex flex-1 items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center space-x-2">
          <AccessibilityPanel />
          <Button size="sm" className="ml-4">
            Sign In
          </Button>
        </div>
      </div>

      {isMobile && isMobileMenuOpen && (
        <div className="border-t px-4 py-2">
          <nav className="grid gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                  onClick={toggleMobileMenu}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}