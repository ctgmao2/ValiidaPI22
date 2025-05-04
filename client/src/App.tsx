import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Tasks from "@/pages/tasks";
import Team from "@/pages/team";
import Reports from "@/pages/reports";
import Admin from "@/pages/admin";
import Header from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import { AccessibilityProvider } from "@/hooks/use-accessibility";
import { AccessibilityButton } from "@/components/accessibility/accessibility-panel";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/team" component={Team} />
      <Route path="/reports" component={Reports} />
      <Route path="/admin" component={Admin} />
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <WouterRouter base="">
            <div className="min-h-screen flex flex-col">
              <Toaster />
              <AccessibilityButton />
              <Header />
              <MobileNav />
              <AppRoutes />
              <Footer />
            </div>
          </WouterRouter>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
