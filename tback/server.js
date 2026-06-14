const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper function to read DB
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { tasks: [], users: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { tasks: [], users: [] };
  }
};

// Helper function to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
};

// Mock Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const user = {
    uid: "demo-user-1337",
    displayName: "Demo Architect ✦",
    email: "architect@ultra-t.io",
    photoURL: null,
    providerId: "local",
    isDemo: true
  };
  
  const db = readDB();
  // Register user in db if not exists
  if (!db.users.some(u => u.uid === user.uid)) {
    db.users.push(user);
    writeDB(db);
  }
  
  res.json({ user });
});

// Get all tasks for user
app.get('/api/tasks', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter is required" });
  }
  const db = readDB();
  const userTasks = db.tasks.filter(t => t.userId === userId);
  res.json(userTasks);
});

// Create/Update task
app.post('/api/tasks', (req, res) => {
  const task = req.body;
  if (!task.id || !task.userId) {
    return res.status(400).json({ error: "Task must have id and userId" });
  }

  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === task.id);
  if (index !== -1) {
    // Update existing task
    db.tasks[index] = { ...db.tasks[index], ...task, updatedAt: Date.now() };
  } else {
    // Add new task
    db.tasks.unshift({ ...task, created: Date.now(), updatedAt: Date.now() });
  }
  writeDB(db);
  res.json(db.tasks[index !== -1 ? index : 0]);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  db.tasks.splice(index, 1);
  writeDB(db);
  res.json({ success: true, id });
});

app.listen(PORT, () => {
  console.log(`Backend server running live on port ${PORT}`);
});
