import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
// import { Toaster } from "@/components/ui/sonner"
import App from "./App";
//main.tsx
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Toaster position="top-center"
  richColors
  theme="dark"
  duration={3000}
  visibleToasts={4}
  / >
    <App />
  </React.StrictMode>,
);
