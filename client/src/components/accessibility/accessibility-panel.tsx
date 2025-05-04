import React from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, Type, Volume2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AccessibilityPanelProps {
  trigger?: React.ReactNode;
}

export function AccessibilityPanel({ trigger }: AccessibilityPanelProps) {
  const {
    isAccessibilityPanelOpen,
    toggleAccessibilityPanel,
    isHighContrast,
    toggleHighContrast,
    isLargeText,
    toggleLargeText,
    isReadAloud,
    toggleReadAloud,
  } = useAccessibility();

  return (
    <Dialog open={isAccessibilityPanelOpen} onOpenChange={toggleAccessibilityPanel}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" aria-label="Accessibility Options">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Accessibility Options</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="high-contrast" className="font-medium">
                  High Contrast
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={isHighContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="large-text" className="font-medium">
                  Large Text
                </Label>
                <p className="text-sm text-muted-foreground">
                  Increase text size for easier reading
                </p>
              </div>
            </div>
            <Switch
              id="large-text"
              checked={isLargeText}
              onCheckedChange={toggleLargeText}
              aria-label="Toggle large text mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="read-aloud" className="font-medium">
                  Screen Reader Support
                </Label>
                <p className="text-sm text-muted-foreground">
                  Optimize for screen readers
                </p>
              </div>
            </div>
            <Switch
              id="read-aloud"
              checked={isReadAloud}
              onCheckedChange={toggleReadAloud}
              aria-label="Toggle screen reader optimization"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple button to toggle the accessibility panel
export function AccessibilityButton() {
  const { toggleAccessibilityPanel } = useAccessibility();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleAccessibilityPanel}
      aria-label="Accessibility Options"
      className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg"
    >
      <Eye className="h-5 w-5" />
    </Button>
  );
}