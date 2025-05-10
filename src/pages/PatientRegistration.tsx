
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
      <PatientForm />
    </div>
  );
};

export default PatientRegistration;
