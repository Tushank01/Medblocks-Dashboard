
import { useEffect, useState } from "react";
import PatientForm from "@/components/PatientForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const PatientRegistration = () => {
  const [storageMode, setStorageMode] = useState<string>("Initializing...");
  
  useEffect(() => {
    // Check localStorage for any stored patients to determine if we're using in-memory
    const checkStorageMode = () => {
      try {
        const hasLocalStorage = localStorage.getItem('meditrack_patients') !== null;
        if (hasLocalStorage) {
          setStorageMode("In-memory storage (localStorage)");
        } else {
          // Try to access IndexedDB to see if we're using PGlite
          const request = indexedDB.open('meditrack');
          request.onsuccess = () => {
            setStorageMode("PGlite database (IndexedDB)");
            request.result.close();
          };
          request.onerror = () => {
            setStorageMode("In-memory storage");
          };
        }
      } catch (e) {
        setStorageMode("In-memory storage");
      }
    };
    
    // Give the app a moment to initialize
    const timer = setTimeout(checkStorageMode, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Register New Patient</h1>
        <p className="text-muted-foreground mb-4">
          Fill out the form below to add a new patient to the database. 
          Fields marked with an asterisk (*) are required.
        </p>
        
        <Alert className="mb-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Currently using: <span className="font-medium">{storageMode}</span>
            </AlertDescription>
          </div>
        </Alert>
      </div>
      
      <PatientForm />
    </div>
  );
};

export default PatientRegistration;
