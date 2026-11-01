const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const materialRoutes = require("./routes/materialRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const cartRoutes = require("./routes/cartRoutes");
const projectRoutes = require("./routes/projectRoutes");
const orderRoutes = require("./routes/orderRoutes");
const mlRoutes = require("./routes/mlRoutes");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API health check route
app.get("/", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

    res.json({
        message: "Welcome to the SmartBuild API!",
        status: "Backend is running successfully",
        port: PORT,
        database: dbStatusMap[dbState] || "unknown",
        endpoints: [
            "/api/auth",
            "/api/materials",
            "/api/materials/categories",
            "/api/suppliers",
            "/api/cart",
            "/api/projects",
            "/api/orders",
            "/api/ml",
        ],
    });
});

// Mounted API routes
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ml", mlRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        message: "An internal server error occurred.",
        error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
});

// Database connection & Server initialization
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }

        // Start listening on port first so the HTTP server is alive and reachable
        const server = app.listen(PORT, () => {
            console.log(`\n=================================================`);
            console.log(`🏗️  SmartBuild backend running at http://localhost:${PORT}`);
            console.log(`=================================================\n`);
        });

        // Connect to MongoDB Atlas
        try {
            console.log("Connecting to MongoDB Atlas...");
            await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            console.log("✅ MongoDB connected successfully!");
        } catch (dbErr) {
            console.warn("\n⚠️  MongoDB Atlas Connection Warning:", dbErr.message);
            console.warn("👉 Action Required: If running for the first time or from a new Wi-Fi network,");
            console.warn("   add your current IP address to the MongoDB Atlas Network Access whitelist:\n   https://cloud.mongodb.com -> Network Access -> Add IP Address (or 0.0.0.0/0)\n");
        }
    } catch (error) {
        console.error("Failed to start SmartBuild backend:", error.message);
        process.exit(1);
    }
}

// Only start listening if run directly (allows importing in tests)
if (require.main === module) {
    startServer();
}

module.exports = app;
