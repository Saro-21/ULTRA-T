# ULTRA T Backend Server (tback)

This is a lightweight Node.js Express server to handle guest session simulation and persistent tasks CRUD storage locally using a JSON file database.

## Prerequisites
- Node.js (v16 or higher recommended)

## Installation & Running

1. Open a terminal inside this `tback` directory:
   ```bash
   cd tback
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Start the backend server live:
   ```bash
   npm start
   ```

The backend server runs live on port `5000` (`http://localhost:5000/`).
All data is persistently saved in the local JSON file database `db.json`.
