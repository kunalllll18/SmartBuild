const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to authenticate requests using JWT
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Authentication required. No token provided.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid session. User no longer exists.",
            });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            phone: user.phone,
            companyName: user.companyName,
            specialization: user.specialization,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(403).json({
            message: "Session expired or invalid token. Please log in again.",
        });
    }
};

/**
 * Middleware to enforce Role-Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles ('customer', 'supplier', 'engineer', 'admin')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of the following roles: ${roles.join(", ")}. Your current role is '${req.user ? req.user.role : "unauthenticated"}'.`,
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};
