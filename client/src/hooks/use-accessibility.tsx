import React, { createContext, useContext, useState, useEffect } from 'react';

type AccessibilityContextType = {
  isAccessibilityPanelOpen: boolean;
  toggleAccessibilityPanel: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isLargeText: boolean;
  toggleLargeText: () => void;
  isReadAloud: boolean;
  toggleReadAloud: () => void;
};

// Default values for the context
const defaultAccessibilityContext: AccessibilityContextType = {
  isAccessibilityPanelOpen: false,
  toggleAccessibilityPanel: () => {},
  isHighContrast: false,
  toggleHighContrast: () => {},
  isLargeText: false,
  toggleLargeText: () => {},
  isReadAloud: false,
  toggleReadAloud: () => {},
};

const AccessibilityContext = createContext<AccessibilityContextType>(defaultAccessibilityContext);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isReadAloud, setIsReadAloud] = useState(false);
  
  const toggleAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen);
  };
  
  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };
  
  const toggleLargeText = () => {
    setIsLargeText(!isLargeText);
  };
  
  const toggleReadAloud = () => {
    setIsReadAloud(!isReadAloud);
    if (!isReadAloud) {
      // In a real implementation, this would integrate with the device's screen reader
      alert('Screen reader mode activated. This would integrate with the device\'s screen reader in a real implementation.');
    }
  };
  
  // Apply accessibility classes to the body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
    
    if (isLargeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
  }, [isHighContrast, isLargeText]);
  
  return (
    <AccessibilityContext.Provider
      value={{
        isAccessibilityPanelOpen,
        toggleAccessibilityPanel,
        isHighContrast,
        toggleHighContrast,
        isLargeText,
        toggleLargeText,
        isReadAloud,
        toggleReadAloud
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
