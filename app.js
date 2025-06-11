// app.js
const express = require("express");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Store simple data in memory (in production, use a database)
let visitors = 0;
let messages = [];

// Routes
app.get("/", (req, res) => {
  visitors++;
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/info", (req, res) => {
  res.json({
    message: "Hello from AWS EC2!",
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: os.uptime(),
    visitors: visitors,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required" });
  }

  const newMessage = {
    id: Date.now(),
    name: name,
    message: message,
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);

  // Keep only last 10 messages
  if (messages.length > 10) {
    messages = messages.slice(-10);
  }

  res.status(201).json(newMessage);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
  console.log(`🖥️  Hostname: ${os.hostname()}`);
});
