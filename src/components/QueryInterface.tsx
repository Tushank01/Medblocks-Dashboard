
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { executeQuery } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles } from "lucide-react";

const QueryInterface = () => {
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM patients LIMIT 10");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const { toast } = useToast();

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  const runQuery = async () => {
    if (!sqlQuery || typeof sqlQuery !== 'string' || !sqlQuery.trim()) {
      setError("Query cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      const result = await executeQuery(sqlQuery);
      
      if (result && result.length > 0) {
        // Extract column names from the first result
        setColumns(Object.keys(result[0]));
        setQueryResult(result);
        
        toast({
          title: "Query executed successfully",
          description: `${result.length} record(s) returned`,
        });
      } else {
        setColumns([]);
        setQueryResult([]);
        
        toast({
          title: "Query executed successfully",
          description: "No records found",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Query Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "SELECT * FROM patients LIMIT 10",
    "SELECT * FROM patients WHERE gender = 'Male' LIMIT 5",
    "SELECT first_name, last_name, date_of_birth FROM patients ORDER BY date_of_birth DESC LIMIT 5",
    "SELECT COUNT(*) as total_count FROM patients",
    "SELECT * FROM patients WHERE medical_history LIKE '%allergy%'",
    "SELECT gender, COUNT(*) as count FROM patients GROUP BY gender"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-2 text-gradient-primary flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" /> SQL Query Interface
        </h2>
        <p className="text-muted-foreground mb-4">
          Execute SQL queries against the patient database to retrieve specific information.
        </p>
        
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <Textarea
            value={sqlQuery}
            onChange={handleQueryChange}
            placeholder="Enter SQL query..."
            className="font-mono text-sm h-40 resize-none focus:ring-primary/50 transition-all border-border"
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <div className="flex-1">
              <HoverCard>
                <HoverCardTrigger>
                  <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                    Available query examples
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Example Queries:</h4>
                    <ul className="text-xs space-y-1">
                      {exampleQueries.map((query, index) => (
                        <li 
                          key={index} 
                          className="p-1.5 rounded hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => setSqlQuery(query)}
                        >
                          <code className="text-xs">{query}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <p className="text-xs text-muted-foreground mt-1">
                Note: All SELECT queries are supported, UPDATE and simple INSERT queries are also allowed
              </p>
            </div>
            <Button 
              onClick={runQuery} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:shadow-md"
            >
              {loading ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  Running Query...
                </>
              ) : (
                "Execute Query"
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-fade-in">
          <p className="font-medium">Error:</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {queryResult && columns.length > 0 && (
        <div className="border rounded-lg overflow-auto animate-fade-in shadow-sm">
          <div className="bg-muted/50 p-3 border-b">
            <h3 className="font-medium">Query Results</h3>
            <p className="text-xs text-muted-foreground">{queryResult.length} record(s) returned</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="bg-muted font-medium">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>
                      {row[column] !== null && row[column] !== undefined
                        ? String(row[column])
                        : "NULL"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {queryResult && queryResult.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted/10 animate-fade-in">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
