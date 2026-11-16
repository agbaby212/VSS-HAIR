import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./styles/index.css";

// Only when VITE_USE_MOCKS="true". The mock must be ready before the first request
async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCKS !== "true") return;
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledFrame: "bypass", // fonts, images and Vite's own files pass through untouched
  });
}

void enableMocks().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});