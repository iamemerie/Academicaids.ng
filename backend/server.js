const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require('express-rate-limit');

// Route Imports
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const aiRoutes = require("./routes/ai");
const verificationRoutes = require("./routes/verification");
const reviewRoutes = require("./routes/reviews");

const app = express();

// 1. Proxy settings for Render deployment hosting
app.set("trust proxy", 1); 

// 2. Standard Parsers & CORS
app.use(cors());
app.use(express.json());

// 3. Define Security Rate Limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Bumped slightly to allow parallel dashboard metric requests
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false,  
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, 
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Apply Global Limiter to general API endpoints
app.use("/api", limiter);

// 5. Apply Specific Auth Limiters strictly before the Auth Router
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// 6. Mount All Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes); // Admin dashboard endpoints
app.use("/api/ai", aiRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/reviews", reviewRoutes);

// Base Test route
app.get("/", (req, res) => {
  res.send("AcademiQ API is running safely...");
});

// 7. Global Catch-All Error Handler (Crucial for debugging dashboard toasts)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR STACK:", err.stack);
  res.status(500).json({
    message: "An internal server error occurred",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });