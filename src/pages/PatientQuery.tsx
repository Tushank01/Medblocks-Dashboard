
import QueryInterface from "@/components/QueryInterface";
import { useDatabaseUpdates } from "@/lib/db";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatabaseIcon } from "lucide-react";

const PatientQuery = () => {
  // Listen to database updates from other tabs
  const dbUpdates = useDatabaseUpdates();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <DatabaseIcon className="h-8 w-8 text-primary" /> Query Patient Records
        </h1>
        <p className="text-muted-foreground">
          Use PostgreSQL to query patient data in the PGlite database.
          Most query types are supported for educational purposes.
        </p>
      </div>
      
      <div className="mb-6">
        <Alert className="bg-card border-primary/20">
          <AlertDescription>
            <p className="font-medium">Example queries:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm mt-2">
              <li><code className="bg-muted/50 px-1 py-0.5 rounded">SELECT * FROM patients LIMIT 10</code> - Get the latest 10 patients</li>
              <li><code className="bg-muted/50 px-1 py-0.5 rounded">SELECT first_name, last_name FROM patients WHERE gender = 'female'</code> - Get all female patients</li>
              <li><code className="bg-muted/50 px-1 py-0.5 rounded">SELECT COUNT(*) AS total FROM patients</code> - Count all patients</li>
              <li><code className="bg-muted/50 px-1 py-0.5 rounded">SELECT * FROM patients WHERE medical_history LIKE '%diabetes%'</code> - Find patients with diabetes</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
      
      <QueryInterface />
    </div>
  );
};

export default PatientQuery;
