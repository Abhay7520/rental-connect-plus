const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "db.json";

// Helper: read DB
function readDB() {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

// Helper: write DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// -------------------- PROPERTIES API --------------------

// Get all properties
app.get("/properties", (req, res) => {
  const db = readDB();
  res.json(db.properties);
});

// Add property
app.post("/properties", (req, res) => {
  const db = readDB();
  const newProperty = {
    id: Date.now(),
    ...req.body
  };
  db.properties.push(newProperty);
  writeDB(db);
  res.json({ message: "Property added!", property: newProperty });
});

// Delete property
app.delete("/properties/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.properties = db.properties.filter(p => p.id !== id);
  writeDB(db);
  res.json({ message: "Property deleted!" });
});

// -------------------- USERS API --------------------

// Register user
app.post("/users/register", (req, res) => {
  const db = readDB();
  const user = {
    id: Date.now(),
    ...req.body
  };
  db.users.push(user);
  writeDB(db);
  res.json({ message: "User registered!", user });
});

// Login user
app.post("/users/login", (req, res) => {
  const db = readDB();
  const { email, password } = req.body;

  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ message: "Login successful!", user });
});

// -------------------- BOOKINGS API --------------------

// Create booking
app.post("/bookings", (req, res) => {
  const db = readDB();
  const booking = {
    id: Date.now(),
    ...req.body
  };
  db.bookings.push(booking);
  writeDB(db);
  res.json({ message: "Booking successful!", booking });
});

// Fetch user bookings
app.get("/bookings/:userId", (req, res) => {
  const db = readDB();
  const userId = parseInt(req.params.userId);
  const userBookings = db.bookings.filter(b => b.userId === userId);
  res.json(userBookings);
});

// ------------------------------------------------------

app.listen(5000, () => {
  console.log("Local Renteazy backend running at http://localhost:5000");
});
