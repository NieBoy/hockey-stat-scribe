
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "@/hooks/useAuth";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find the root element");
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
