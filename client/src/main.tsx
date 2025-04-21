import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AccessibilityProvider } from "./hooks/use-accessibility";

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <App />
  </AccessibilityProvider>
);
