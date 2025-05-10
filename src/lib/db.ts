import { PGlite } from '@electric-sql/pglite';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

let db: PGlite | null = null;
const DB_NAME = 'meditrack';

// In-memory fallback when PGlite fails to initialize
let inMemoryPatients: any[] = [];
let useInMemoryOnly = false;

export const initDB = async () => {
  // If we've already decided to use in-memory only, don't try PGlite again
  if (useInMemoryOnly) {
    console.log('Using in-memory storage only (skipping PGlite)');
    return null;
  }
  
  if (db) return db;
  
  try {
    // Initialize the PGlite database with persistence to IndexedDB
    db = new PGlite(`idb://${DB_NAME}`);
    
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Set up broadcast channel for multi-tab communication
    initBroadcastChannel();
    
    console.log('PGlite database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    console.log('Falling back to in-memory storage');
    
    // Set the flag to avoid trying PGlite again
    useInMemoryOnly = true;
    
    // Load any data from localStorage to in-memory
    loadInMemoryFromLocalStorage();
    
    return null; // Return null to indicate fallback to in-memory
  }
};

// Function to load in-memory data from localStorage
const loadInMemoryFromLocalStorage = () => {
  try {
    const storedPatients = localStorage.getItem('meditrack_patients');
    if (storedPatients) {
      inMemoryPatients = JSON.parse(storedPatients);
      console.log(`Loaded ${inMemoryPatients.length} patients from localStorage`);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
};

// Broadcast channel for multi-tab synchronization
let broadcastChannel: BroadcastChannel;

const initBroadcastChannel = () => {
  try {
    broadcastChannel = new BroadcastChannel('meditrack-db-channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'db-updated') {
        // Notify any listeners about the database update
        window.dispatchEvent(new CustomEvent('db-updated', {
          detail: event.data.operation
        }));
      }
    };
  } catch (error) {
    console.error('Error initializing broadcast channel:', error);
  }
};

export const notifyDatabaseUpdate = (operation: string) => {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'db-updated',
        operation
      });
    } catch (error) {
      console.error('Error posting message to broadcast channel:', error);
    }
  }
  
  // Also dispatch an event for the current tab
  window.dispatchEvent(new CustomEvent('db-updated', {
    detail: operation
  }));
};

// Patient methods
export const registerPatient = async (patientData: any) => {
  try {
    // Only try to use PGlite if we haven't already decided to use in-memory only
    const dbInstance = !useInMemoryOnly ? await initDB() : null;
    
    if (dbInstance) {
      // PGlite storage - Fix the SQL query construction
      // Filter out undefined values and handle SQL parameter binding properly
      const filteredData: Record<string, any> = {};
      Object.entries(patientData).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredData[key] = value;
        }
      });
      
      const columns = Object.keys(filteredData).join(', ');
      const placeholders = Object.keys(filteredData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(filteredData);
      
      console.log(`INSERT INTO patients (${columns}) VALUES (${placeholders})`, values);
      
      await dbInstance.query(
        `INSERT INTO patients (${columns}) VALUES (${placeholders})`,
        values
      );
    } else {
      // In-memory fallback
      const newPatient = {
        ...patientData,
        id: Date.now(), // Simple ID generation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      inMemoryPatients.push(newPatient);
      
      // Save to localStorage as well
      try {
        localStorage.setItem('meditrack_patients', JSON.stringify(inMemoryPatients));
        console.log('Patient saved to in-memory storage and localStorage');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    
    notifyDatabaseUpdate('register');
    return true;
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};

export const executeQuery = async (sqlQuery: string) => {
  try {
    // Check if sqlQuery is a string before calling toLowerCase
    if (typeof sqlQuery !== 'string') {
      throw new Error('Query must be a string');
    }
    
    const originalQuery = sqlQuery;
    const lowerQuery = sqlQuery.toLowerCase().trim();
    
    // Basic SQL syntax validation
    if (!lowerQuery) {
      throw new Error('Query cannot be empty');
    }
    
    // Validate that the query contains a FROM clause if it's a SELECT query
    if (lowerQuery.startsWith('select') && !lowerQuery.includes(' from ')) {
      throw new Error('Invalid SELECT query: Missing FROM clause');
    }

    // Verify that SELECT queries have proper syntax
    if (lowerQuery.startsWith('select')) {
      const fromMatch = /\bfrom\s+(\w+)/i.exec(lowerQuery);
      if (!fromMatch || !fromMatch[1]) {
        throw new Error('Invalid SELECT query: Cannot determine target table');
      }
      
      const tableName = fromMatch[1].toLowerCase();
      if (tableName !== 'patients') {
        throw new Error(`Table '${tableName}' does not exist. Only 'patients' table is available`);
      }
    }
    
    // Add safety checks to prevent destructive queries
    if (lowerQuery.includes('drop table') || 
        lowerQuery.includes('delete from') ||
        lowerQuery.includes('truncate')) {
      throw new Error('Destructive queries are not allowed');
    }
    
    // Only try to use PGlite if we haven't already decided to use in-memory only
    const dbInstance = !useInMemoryOnly ? await initDB() : null;
    
    if (dbInstance) {
      try {
        // PGlite query
        const result = await dbInstance.query(originalQuery);
        return result.rows;
      } catch (sqlError) {
        console.error('SQL execution error:', sqlError);
        throw new Error(`SQL Error: ${sqlError.message || 'Unknown error'}`);
      }
    } else {
      // In-memory fallback - more complete query support
      // Load from localStorage if available
      loadInMemoryFromLocalStorage();
      
      // Check if query is valid for in-memory mode
      // In-memory mode requires a valid SQL structure
      if (!lowerQuery.includes('from patients')) {
        throw new Error('Query must include "FROM patients" clause');
      }
      
      // Very basic query filtering for in-memory mode
      let filteredPatients = [...inMemoryPatients];
      
      // Basic filtering by gender
      if (lowerQuery.includes('where gender')) {
        const genderMatch = lowerQuery.match(/gender\s*=\s*['"]([^'"]+)['"]/i);
        if (genderMatch && genderMatch[1]) {
          const gender = genderMatch[1].toLowerCase();
          filteredPatients = filteredPatients.filter(p => 
            p.gender && p.gender.toLowerCase() === gender
          );
        }
      }
      
      // Basic filtering by name
      if (lowerQuery.includes('where first_name')) {
        const nameMatch = lowerQuery.match(/first_name\s*=\s*['"]([^'"]+)['"]/i);
        if (nameMatch && nameMatch[1]) {
          const name = nameMatch[1].toLowerCase();
          filteredPatients = filteredPatients.filter(p => 
            p.first_name && p.first_name.toLowerCase() === name
          );
        }
      }
      
      // Basic LIKE support
      if (lowerQuery.includes('like')) {
        const likeMatch = lowerQuery.match(/(\w+)\s+like\s+['"]%([^%]+)%['"]/i);
        if (likeMatch && likeMatch[1] && likeMatch[2]) {
          const field = likeMatch[1];
          const term = likeMatch[2].toLowerCase();
          filteredPatients = filteredPatients.filter(p => 
            p[field] && String(p[field]).toLowerCase().includes(term)
          );
        }
      }
      
      // Support for COUNT
      if (lowerQuery.includes('count(*)')) {
        return [{ count: filteredPatients.length }];
      }
      
      // Handle SELECT specific fields
      if (lowerQuery.startsWith('select') && !lowerQuery.includes('select *')) {
        const fieldMatch = lowerQuery.match(/select\s+(.+?)\s+from/i);
        if (fieldMatch && fieldMatch[1]) {
          const fields = fieldMatch[1].split(',').map(f => {
            const trimmed = f.trim();
            const asMatch = trimmed.match(/(.+?)\s+as\s+(.+)/i);
            return asMatch ? { original: asMatch[1].trim(), alias: asMatch[2].trim() } : { original: trimmed, alias: trimmed };
          });
          
          return filteredPatients.map(patient => {
            const result: Record<string, any> = {};
            fields.forEach(field => {
              result[field.alias] = patient[field.original];
            });
            return result;
          });
        }
      }
      
      // Handle ORDER BY
      if (lowerQuery.includes('order by')) {
        const orderMatch = lowerQuery.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/i);
        if (orderMatch && orderMatch[1]) {
          const field = orderMatch[1];
          const direction = orderMatch[2]?.toLowerCase() === 'desc' ? 'desc' : 'asc';
          
          filteredPatients.sort((a, b) => {
            if (a[field] === b[field]) return 0;
            if (direction === 'asc') {
              return a[field] < b[field] ? -1 : 1;
            } else {
              return a[field] > b[field] ? -1 : 1;
            }
          });
        }
      }
      
      // Handle LIMIT
      let limit = filteredPatients.length;
      const limitMatch = lowerQuery.match(/limit\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        limit = parseInt(limitMatch[1], 10);
      }
      
      // Handle OFFSET
      let offset = 0;
      const offsetMatch = lowerQuery.match(/offset\s+(\d+)/i);
      if (offsetMatch && offsetMatch[1]) {
        offset = parseInt(offsetMatch[1], 10);
      }
      
      return filteredPatients.slice(offset, offset + limit);
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

export const getPatients = async (limit = 10, offset = 0) => {
  try {
    // Only try to use PGlite if we haven't already decided to use in-memory only
    const dbInstance = !useInMemoryOnly ? await initDB() : null;
    
    if (dbInstance) {
      // PGlite storage
      const result = await dbInstance.query(
        'SELECT * FROM patients ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows;
    } else {
      // In-memory fallback
      // Load from localStorage if available
      loadInMemoryFromLocalStorage();
      
      return inMemoryPatients.slice(offset, offset + limit);
    }
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

export const countPatients = async () => {
  try {
    // Only try to use PGlite if we haven't already decided to use in-memory only
    const dbInstance = !useInMemoryOnly ? await initDB() : null;
    
    if (dbInstance) {
      // PGlite storage - Fix the type issue here
      const result = await dbInstance.query('SELECT COUNT(*) as count FROM patients');
      
      // Add proper type checking and conversion to resolve the error
      if (result.rows && result.rows.length > 0) {
        const countValue = result.rows[0] as { count: string | number };
        return typeof countValue.count === 'string' 
          ? parseInt(countValue.count, 10) 
          : countValue.count;
      }
      return 0;
    } else {
      // In-memory fallback
      return inMemoryPatients.length;
    }
  } catch (error) {
    console.error('Error counting patients:', error);
    throw error;
  }
};

// Hook to listen to database updates
export const useDatabaseUpdates = () => {
  const [updateCount, setUpdateCount] = useState(0);
  
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      console.log(`Database updated: ${event.detail}`);
      setUpdateCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: 'Database Updated',
        description: `Another tab performed a ${event.detail} operation`,
      });
    };
    
    window.addEventListener('db-updated', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('db-updated', handleUpdate as EventListener);
    };
  }, []);
  
  return updateCount;
};
