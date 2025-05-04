import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  Settings,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AccessibilityButton } from "@/components/accessibility/accessibility-panel";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close the mobile nav when changing location
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Don't render on desktop
  if (!isMobile) return null;

  const closeSheet = () => setOpen(false);

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="p-0 w-9 h-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetHeader className="flex justify-between items-center mb-4">
            <SheetTitle>Menu</SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeSheet}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetHeader>

          <Separator className="mb-4" />
          
          <div className="flex flex-col gap-1 mb-auto">
            <MobileNavLink
              href="/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard className="mr-2 h-4 w-4" />}
              active={location === "/dashboard"}
              onClick={closeSheet}
            />
            <MobileNavLink
              href="/tasks"
              label="Tasks"
              icon={<ListTodo className="mr-2 h-4 w-4" />}
              active={location === "/tasks"}
              onClick={closeSheet}
            />
            <MobileNavLink
              href="/projects"
              label="Projects"
              icon={<FolderKanban className="mr-2 h-4 w-4" />}
              active={location === "/projects"}
              onClick={closeSheet}
            />
            <MobileNavLink
              href="/team"
              label="Team"
              icon={<Users className="mr-2 h-4 w-4" />}
              active={location === "/team"}
              onClick={closeSheet}
            />
            <MobileNavLink
              href="/reports"
              label="Reports"
              icon={<BarChart3 className="mr-2 h-4 w-4" />}
              active={location === "/reports"}
              onClick={closeSheet}
            />
            <MobileNavLink
              href="/admin"
              label="Admin"
              icon={<Settings className="mr-2 h-4 w-4" />}
              active={location === "/admin"}
              onClick={closeSheet}
            />
          </div>
          
          <div className="mt-4">
            <Separator className="mb-4" />
            <div className="px-1">
              <AccessibilityButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function MobileNavLink({ href, label, icon, active, onClick }: MobileNavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          active ? "bg-accent text-accent-foreground" : "transparent"
        )}
        onClick={onClick}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}