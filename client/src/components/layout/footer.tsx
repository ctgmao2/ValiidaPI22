import { useIsMobile } from "@/hooks/use-mobile";

export default function Footer() {
  const isMobile = useIsMobile();
  
  // Add extra padding at the bottom on mobile to account for the navigation bar
  const paddingClass = isMobile ? 'pb-20' : '';
  
  return (
    <footer className={`border-t bg-background mt-auto ${paddingClass}`}>
      <div className="container px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center mb-3 sm:mb-0">
          <p>&copy; {new Date().getFullYear()} RedmineClone. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Help</a>
        </div>
      </div>
    </footer>
  );
}