import { Link, useLocation } from "wouter";
import { useAccessibility } from "@/hooks/use-accessibility";
import { Bell, HelpCircle, Settings, Star } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();
  const { toggleAccessibilityPanel } = useAccessibility();
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-neutral-600">EcoManage</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className={`px-3 py-2 font-medium rounded-md flex items-center space-x-1 ${location === '/' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link href="/projects" className={`px-3 py-2 font-medium rounded-md flex items-center space-x-1 ${location === '/projects' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Projects</span>
            </Link>
            <Link href="/tasks" className={`px-3 py-2 font-medium rounded-md flex items-center space-x-1 ${location === '/tasks' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Tasks</span>
            </Link>
            <Link href="/team" className={`px-3 py-2 font-medium rounded-md flex items-center space-x-1 ${location === '/team' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Team</span>
            </Link>
            <Link href="/reports" className={`px-3 py-2 font-medium rounded-md flex items-center space-x-1 ${location === '/reports' ? 'text-primary bg-primary bg-opacity-10' : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Reports</span>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-neutral-100 relative" aria-label="Notifications" title="Notifications">
            <Bell className="h-6 w-6 text-neutral-500" />
            <span className="absolute top-1 right-1 bg-danger text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-neutral-100" aria-label="Help" title="Help">
            <HelpCircle className="h-6 w-6 text-neutral-500" />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-neutral-100" 
            aria-label="Accessibility Options" 
            title="Accessibility Options"
            onClick={toggleAccessibilityPanel}
          >
            <Settings className="h-6 w-6 text-neutral-500" />
          </button>
          
          <div className="ml-3 relative">
            <div>
              <button type="button" className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" id="user-menu" aria-expanded="false" aria-haspopup="true">
                <span className="font-medium">Margaret W.</span>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="text-sm font-semibold">MW</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
