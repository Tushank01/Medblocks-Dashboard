import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getPatients, countPatients, useDatabaseUpdates } from "@/lib/db";
import { useEffect, useState, useCallback, useRef } from "react";
import PatientCard from "@/components/PatientCard";
import { Patient } from "@/lib/schemas";
import { ChevronRight, FileText, PlusCircle, Search, UsersRound } from "lucide-react";
import { MedicalParticles } from "@/components/ui/medical-particles";
import { RetroGrid } from "@/components/ui/retro-grid";

const Index = () => {
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const fetchCountRef = useRef(0);
  
  // Listen to database updates from other tabs
  const dbUpdates = useDatabaseUpdates();
  
  // Create a more robust fetch function for production
  const fetchData = useCallback(async (source = "unknown") => {
    try {
      fetchCountRef.current += 1;
      console.log(`[Index] Fetching data (count: ${fetchCountRef.current}, source: ${source})`);
      
      setLoading(true);
      setError(null);
      
      // Add timeout for production environments
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      // Fetch both simultaneously with timeout
      const [patients, count] = await Promise.race([
        Promise.all([
          getPatients(10, 0),
          countPatients()
        ]),
        timeoutPromise
      ]);
      
      console.log(`[Index] Fetched ${patients.length} patients, total count: ${count}`);
      
      setRecentPatients(patients || []);
      setTotalPatients(count || 0);
    } catch (error) {
      console.error("[Index] Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      // Set default values on error
      setRecentPatients([]);
      setTotalPatients(0);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch data whenever the location (route) changes
  useEffect(() => {
    console.log("[Index] Location changed, fetching data");
    fetchData("location-change");
  }, [location.pathname, location.key, fetchData]); // Added location.key to detect navigation
  
  // Fetch data on database updates
  useEffect(() => {
    if (dbUpdates !== undefined) { // Check for undefined instead of truthy
      console.log("[Index] Database update detected, fetching data");
      fetchData("db-update");
    }
  }, [dbUpdates, fetchData]);
  
  // Initial fetch on mount - simplified
  useEffect(() => {
    console.log("[Index] Component mounted, initial fetch");
    fetchData("initial-mount");
  }, []); // Removed fetchData dependency to avoid multiple calls
  
  // Alternative: Force refresh on route navigation (Vercel-friendly)
  useEffect(() => {
    // Force a data refresh whenever we navigate to this route
    const timer = setTimeout(() => {
      fetchData("route-navigation");
    }, 100); // Small delay to ensure component is fully mounted
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Alternative: Use window.addEventListener for storage events (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('patient')) {
        console.log("[Index] Storage change detected, fetching data");
        fetchData("storage-change");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchData]);
  
  // Focus and visibility listeners for additional refresh triggers
  useEffect(() => {
    const handleFocus = () => {
      console.log("[Index] Window focused, fetching data");
      fetchData("window-focus");
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("[Index] Page visible, fetching data");
        fetchData("visibility-change");
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);
  
  // Manual refresh function (you can call this from a button if needed)
  const handleManualRefresh = () => {
    console.log("[Index] Manual refresh triggered");
    fetchData("manual-refresh");
  };
  
  // Debug info (remove in production)
  useEffect(() => {
    console.log("[Index] State updated:", {
      loading,
      recentPatientsCount: recentPatients.length,
      totalPatients,
      error,
      fetchCount: fetchCountRef.current
    });
  }, [loading, recentPatients.length, totalPatients, error]);
  
  return (
    <div className="space-y-12">

      
      <section className=" rounded-2xl overflow-hidden relative border border-border/50 shadow-2xl">
        <div className="relative h-full w-full">
          <RetroGrid />
          
          <div className="container mx-auto max-w-5xl px-6 py-16 md:py-24 relative z-10">
            <div className="text-center mb-12">
              <h1 className=" text-4xl md:text-6xl font-bold mb-8 leading-tight text-blue-600 tracking-tight drop-shadow-sm">
                MedBlocks 
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                A sophisticated patient registration system with secure local database storage,
                designed for healthcare professionals who value elegant simplicity and reliability.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button asChild size="lg" className="action-button shadow-primary/20 shadow-2xl">
                  <Link to="/register" className="gap-2 px-8">
                    <PlusCircle className="w-5 h-5" />
                    Register New Patient
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="hover:bg-accent/50 border-primary/30 hover:border-primary/50 shadow-2xl">
                  <Link to="/query" className="gap-2 px-8">
                    <Search className="w-5 h-5" />
                    Query Database
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="stats flex flex-wrap justify-center gap-4">
              <div className="stat-card bg-white/90 backdrop-blur-sm px-8 py-6 rounded-xl border border-border/60 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UsersRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">Total Patients</p>
                  <p className="text-2xl font-bold">{loading ? '...' : totalPatients}</p>
                </div>
              </div>
              <div className="stat-card bg-white/90 backdrop-blur-sm px-8 py-6 rounded-xl border border-border/60 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">Recent Records</p>
                  <p className="text-2xl font-bold">{loading ? '...' : recentPatients.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features-section py-12">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold mb-10 text-center">F E A T U R E S</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/register" className="block group">
              <Card className="feature-card transition-all duration-300 border-border/40 group-hover:border-primary/30">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-4 p-3 bg-primary/10 rounded-full inline-block">
                        <PlusCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-serif font-semibold mb-3">Register a New Patient</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Add a new patient to the database with all their details and medical history, securely stored on your device.
                      </p>
                      <span className="text-primary font-medium inline-flex items-center transition-all group-hover:translate-x-1">
                        Get Started
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                    <div className="hidden md:block text-primary/70 animate-float">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/query" className="block group">
              <Card className="feature-card transition-all duration-300 border-border/40 group-hover:border-secondary/40">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-4 p-3 bg-secondary/10 rounded-full inline-block">
                        <Search className="h-6 w-6 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-serif font-semibold mb-3">Query Patient Records</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Execute SQL queries to retrieve, filter, and analyze patient data efficiently with our intuitive interface.
                      </p>
                      <span className="text-secondary font-medium inline-flex items-center transition-all group-hover:translate-x-1">
                        Explore Data
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                    <div className="hidden md:block text-secondary/70 animate-float" style={{animationDelay: "0.5s"}}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="recent-patients-section py-8 mb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-semibold">Recently Added Patients</h2>
            <div className="bg-accent/30 px-4 py-2 rounded-full">
              <p className="text-sm font-medium flex items-center gap-2">
                <UsersRound className="h-4 w-4" />
                Total patients: {totalPatients}
              </p>
            </div>
          </div>
          
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-700">Error loading data: {error}</p>
                <Button onClick={handleManualRefresh} variant="outline" className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse border-border/30">
                  <CardContent className="p-6 h-48">
                    <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          ) : (
            <Card className="elegant-card border-dashed border-2 bg-muted/20">
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground mb-6">
                  No patients have been registered yet. Get started by adding your first patient.
                </p>
                <Button asChild variant="outline" className="border-primary/30 hover:border-primary/50">
                  <Link to="/register" className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Register Your First Patient
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;