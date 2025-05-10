
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PatientRegistration from "./pages/PatientRegistration";
import PatientQuery from "./pages/PatientQuery";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import { useEffect, useState } from "react";
import { initDB } from "./lib/db";

const queryClient = new QueryClient();

const App = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // Try to initialize DB (may fall back to in-memory)
        await initDB();
        
        // Check if we have localStorage data
        try {
          localStorage.getItem('meditrack_test');
        } catch (e) {
          console.warn('localStorage may not be available:', e);
        }
      } catch (error) {
        console.error('Error during setup:', error);
        // Continue anyway, we'll use in-memory fallback
      }
      
      // Set app as ready regardless of DB initialization success
      // since we have in-memory fallback
      setAppReady(true);
    };
    
    setupApp().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <NavBar />
            <div className="container px-4 py-8">
              {appReady ? (
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/register" element={<PatientRegistration />} />
                  <Route path="/query" element={<PatientQuery />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              ) : (
                <div className="flex h-[70vh] items-center justify-center">
                  <div className="text-center animate-pulse">
                    <h2 className="text-2xl font-semibold mb-4">Initializing Application...</h2>
                    <p className="text-muted-foreground">Please wait while we set up your environment.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
