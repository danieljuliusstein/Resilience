import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalPerformanceMonitor } from "@/components/ui/performance-monitor";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { getPerformanceMonitor } from "@/lib/performance";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Track from "@/pages/track";
import DatabaseAdmin from "@/pages/database-admin";
import Portfolio from "@/pages/portfolio";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Initialize performance monitoring with optimized budgets
const performanceMonitor = getPerformanceMonitor({
  maxImageSize: 500, // 500KB
  maxBundleSize: 1000, // 1MB
  maxLCP: 2500, // 2.5 seconds
  maxFID: 100, // 100ms
  maxCLS: 0.1 // 0.1 score
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/database" component={DatabaseAdmin} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/track/:magicLink" component={Track} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const serviceWorker = useServiceWorker();

  useEffect(() => {
    // Log service worker status for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Worker Status:', {
        isSupported: serviceWorker.isSupported,
        isRegistered: serviceWorker.isRegistered,
        needsRefresh: serviceWorker.needsRefresh
      });
      
      // Show developer hint for performance monitor
      const timeout = setTimeout(() => {
        console.log('💡 Developer Tip: Press Ctrl/Cmd + Shift + P to toggle Performance Monitor');
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [serviceWorker]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <GlobalPerformanceMonitor />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
