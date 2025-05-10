import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { getPatients, countPatients, useDatabaseUpdates } from "@/lib/db";
import { useEffect, useState } from "react";
import PatientCard from "@/components/PatientCard";
import { Patient } from "@/lib/schemas";

const Index = () => {
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // Listen to database updates from other tabs
  const dbUpdates = useDatabaseUpdates();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patients = await getPatients(5, 0);
        const count = await countPatients();
        
        setRecentPatients(patients);
        setTotalPatients(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dbUpdates]);
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Two-column layout for main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left column - Hero content */}
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="text-blue-600">MedBlocks</span> 
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            A secure, efficient solution for managing patient records with
            local database storage and intuitive interfaces.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button asChild size="lg" className="shadow-sm">
              <Link to="/register">Register Patient</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/query">Search Records</Link>
            </Button>
          </div> */}
          
          <div className="mt-8 flex items-center space-x-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <p>Total patients in database: <span className="font-medium text-foreground">{totalPatients}</span></p>
          </div>
        </div>
        
        {/* Right column - Feature cards */}
        <div className="space-y-6">
          <Link to="/register" className="block">
            <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium mb-2">Patient Registration</h2>
                    <p className="text-muted-foreground text-sm">
                      Add new patients with complete medical history and details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/query" className="block">
            <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium mb-2">Query Database</h2>
                    <p className="text-muted-foreground text-sm">
                      Execute SQL queries to filter and analyze patient data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {/* <Link to="/stats" className="block">
            <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium mb-2">Analytics</h2>
                    <p className="text-muted-foreground text-sm">
                      Visualize patient trends and important metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link> */}
        </div>
      </div>
      
      {/* Recent patients section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium">Recent Patients</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/query" className="flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 h-40">
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
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">No patients registered</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first patient record to get started.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/register">Register Patient</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;