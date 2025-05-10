
# MediTrack - Patient Registration App

MediTrack is a frontend-only patient registration application that uses PgLite for client-side data storage. It allows users to register patients, run SQL queries on patient records, and access data across multiple browser tabs simultaneously.

## Features

- **Patient Registration**: Add new patients with comprehensive medical information
- **SQL Query Interface**: Run custom SQL queries on patient data
- **Persistent Storage**: Data is stored locally and persists across page refreshes
- **Multi-tab Support**: Changes made in one tab are synchronized across all open tabs

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- ShadCN UI components
- PgLite (SQLite WASM) for client-side database
- React Router for navigation
- React Query for data fetching
- Broadcast Channel API for multi-tab communication

## Getting Started

### Prerequisites

You need to have Node.js (v16 or newer) and npm installed on your machine.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd meditrack
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:8080`

## Usage

### Patient Registration

1. Navigate to the "Register Patient" page
2. Fill out the patient details form
3. Click "Register Patient" to save the data

### Querying Patient Data

1. Navigate to the "Query Records" page
2. Enter a SQL query in the input field
3. Click "Run Query" to execute the query and view results

Example queries:
- `SELECT * FROM patients LIMIT 10`
- `SELECT first_name, last_name FROM patients WHERE gender = 'female'`
- `SELECT COUNT(*) AS total FROM patients`

## Multi-tab Support

The app uses the Broadcast Channel API to synchronize data across multiple browser tabs. When changes are made in one tab, all other tabs are notified and updated accordingly.

## Storage

Patient data is stored entirely in the browser using PgLite, a WebAssembly version of SQLite. Data persists across page refreshes and browser restarts.

## Development Challenges

1. **Client-side Database Configuration**: Setting up PgLite to work efficiently in a browser environment required careful initialization and error handling.

2. **Multi-tab Synchronization**: Implementing reliable cross-tab communication was challenging, solved using the Broadcast Channel API.

3. **SQL Safety**: Ensuring that users couldn't execute destructive queries while still providing flexibility for data retrieval.

4. **Form Validation**: Creating a robust validation system for patient data that provided clear feedback to users.

## License

This project is licensed under the MIT License.
