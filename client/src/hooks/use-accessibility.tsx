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

// Helper to get stored preferences or default values
const getStoredPreference = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(() =>
    getStoredPreference('accessibility-high-contrast', false)
  );
  const [isLargeText, setIsLargeText] = useState(() =>
    getStoredPreference('accessibility-large-text', false)
  );
  const [isReadAloud, setIsReadAloud] = useState(() =>
    getStoredPreference('accessibility-read-aloud', false)
  );

  // Update document classes when preferences change
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', JSON.stringify(isHighContrast));
  }, [isHighContrast]);

  useEffect(() => {
    if (isLargeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    localStorage.setItem('accessibility-large-text', JSON.stringify(isLargeText));
  }, [isLargeText]);

  useEffect(() => {
    localStorage.setItem('accessibility-read-aloud', JSON.stringify(isReadAloud));
  }, [isReadAloud]);

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
  };

  const value = {
    isAccessibilityPanelOpen,
    toggleAccessibilityPanel,
    isHighContrast,
    toggleHighContrast,
    isLargeText,
    toggleLargeText,
    isReadAloud,
    toggleReadAloud,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}