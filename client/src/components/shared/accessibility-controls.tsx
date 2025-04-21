import { useAccessibility } from "@/hooks/use-accessibility";

export default function AccessibilityControls() {
  const { 
    isAccessibilityPanelOpen, 
    toggleAccessibilityPanel, 
    isHighContrast,
    toggleHighContrast,
    isLargeText,
    toggleLargeText,
    isReadAloud,
    toggleReadAloud 
  } = useAccessibility();
  
  if (!isAccessibilityPanelOpen) {
    return null;
  }
  
  return (
    <div id="accessibilityControls" className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-md z-50 border border-neutral-200">
      <h3 className="font-semibold mb-2 text-neutral-600">Accessibility Options</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="highContrastMode" 
            className="w-4 h-4"
            checked={isHighContrast}
            onChange={toggleHighContrast}
          />
          <label htmlFor="highContrastMode" className="text-sm">High Contrast</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="largeTextMode" 
            className="w-4 h-4"
            checked={isLargeText}
            onChange={toggleLargeText}
          />
          <label htmlFor="largeTextMode" className="text-sm">Large Text</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="readAloudMode" 
            className="w-4 h-4"
            checked={isReadAloud}
            onChange={toggleReadAloud}
          />
          <label htmlFor="readAloudMode" className="text-sm">Screen Reader Support</label>
        </div>
        <button 
          className="text-xs text-primary hover:underline mt-2"
          onClick={toggleAccessibilityPanel}
        >
          Close
        </button>
      </div>
    </div>
  );
}
