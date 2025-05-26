const express = require("express");
const cors = require("cors");
const { authenticateUser } = require("./middlewares/authenticateUser");
const { adminAuth } = require("./middlewares/adminAuth");

// Import Routes
const eventRoutes = require("./routes/events");
const clubRoutes = require("./routes/clubs");
const profileRoutes = require("./routes/profiles");
const authRoutes = require("./routes/auth"); 
const usersRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json()); 

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Use Routes
app.use("/events", authenticateUser, eventRoutes);
app.use("/clubs", authenticateUser, clubRoutes);
app.use("/profiles", authenticateUser, profileRoutes);
app.use("/auth", authRoutes); 
app.use("/users", usersRoutes);

// Handle Unmatched Routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
