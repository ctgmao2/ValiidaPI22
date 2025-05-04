import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart3, Home, LayoutGrid, ListChecks, Settings, Users } from 'lucide-react';

export default function MobileNav() {
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
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 z-40 w-full border-t bg-background">
      <nav className="grid grid-cols-5 gap-1 py-2">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 text-xs',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}