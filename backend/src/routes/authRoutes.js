const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const ALLOWED_ROLES = ["customer", "supplier", "engineer", "admin"];

// REGISTER API
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role = "customer",
            phone = "",
            companyName = "",
            specialization = "",
            adminSecretKey = "",
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Full name, email, and password are required.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters.",
            });
        }

        const normalizedRole = role.toLowerCase().trim();
        if (!ALLOWED_ROLES.includes(normalizedRole)) {
            return res.status(400).json({
                message: `Invalid role selected. Allowed roles: ${ALLOWED_ROLES.join(", ")}`,
            });
        }

        // Admin creation safeguard: require secret key if requesting admin role
        if (normalizedRole === "admin") {
            const expectedAdminKey = process.env.ADMIN_SECRET_KEY || "smartbuild_admin_2026";
            if (adminSecretKey !== expectedAdminKey) {
                return res.status(403).json({
                    message: "Invalid admin invitation secret key.",
                });
            }
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: normalizedRole,
            phone: phone.trim(),
            companyName: companyName.trim(),
            specialization: specialization.trim(),
            isVerified: normalizedRole === "supplier" ? false : true,
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            message: `Account created successfully as ${newUser.role}!`,
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified,
                phone: newUser.phone,
                companyName: newUser.companyName,
                specialization: newUser.specialization,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong during registration.",
            error: error.message,
        });
    }
});

// LOGIN API
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        // Compare entered password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role || "customer" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "customer",
                isVerified: user.isVerified,
                phone: user.phone || "",
                companyName: user.companyName || "",
                specialization: user.specialization || "",
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong during login.",
            error: error.message,
        });
    }
});

// GET CURRENT AUTHENTICATED USER
router.get("/me", authenticateToken, async (req, res) => {
    try {
        return res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch user session.",
        });
    }
});

// UPDATE PROFILE
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { name, phone, companyName, specialization, address } = req.body;
        const updates = {};

        if (name && name.trim()) updates.name = name.trim();
        if (phone !== undefined) updates.phone = phone.trim();
        if (companyName !== undefined) updates.companyName = companyName.trim();
        if (specialization !== undefined) updates.specialization = specialization.trim();
        if (address) updates.address = address;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select("-passwordHash");

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.isVerified,
                phone: updatedUser.phone,
                companyName: updatedUser.companyName,
                specialization: updatedUser.specialization,
                address: updatedUser.address,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update profile.",
            error: error.message,
        });
    }
});

// ROLE-BASED ACCESS VERIFICATION DEMO ENDPOINTS
router.get("/admin/test", authenticateToken, authorizeRoles("admin"), (req, res) => {
    return res.json({
        message: "Welcome, Administrator. You have access to administrative operations.",
        user: req.user,
    });
});

router.get("/engineer/test", authenticateToken, authorizeRoles("engineer", "admin"), (req, res) => {
    return res.json({
        message: "Welcome, Engineer. You have access to technical project review.",
        user: req.user,
    });
});

router.get("/supplier/test", authenticateToken, authorizeRoles("supplier", "admin"), (req, res) => {
    return res.json({
        message: "Welcome, Supplier. You have access to supplier inventory and orders.",
        user: req.user,
    });
});

module.exports = router;
