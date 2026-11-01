const express = require("express");
const Supplier = require("../models/Supplier");
const Material = require("../models/Material");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL SUPPLIERS (PUBLIC)
router.get("/", async (req, res) => {
    try {
        const { verifiedOnly = "false", category = "", search = "" } = req.query;

        const query = {};
        if (verifiedOnly === "true") {
            query.isVerified = true;
        }

        if (category) {
            query.categoriesSupplied = category;
        }

        if (search.trim()) {
            query.$or = [
                { businessName: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
                { "location.city": { $regex: search.trim(), $options: "i" } },
            ];
        }

        const suppliers = await Supplier.find(query).sort({
            isVerified: -1,
            reliabilityScore: -1,
        });

        return res.status(200).json({
            count: suppliers.length,
            suppliers,
        });
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return res.status(500).json({
            message: "Failed to fetch suppliers.",
            error: error.message,
        });
    }
});

// GET SINGLE SUPPLIER WITH THEIR LISTED MATERIALS
router.get("/:id", async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        const materials = await Material.find({ supplier: supplier._id });

        return res.status(200).json({
            supplier,
            materials,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch supplier details.",
            error: error.message,
        });
    }
});

// GET SUPPLIER PERFORMANCE METRICS (FOR ML EVALUATION & SUPPLIER MONITORING)
router.get("/:id/performance", async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        const materialsCount = await Material.countDocuments({ supplier: supplier._id });

        return res.status(200).json({
            supplierId: supplier._id,
            businessName: supplier.businessName,
            isVerified: supplier.isVerified,
            rating: supplier.rating,
            reliabilityScore: supplier.reliabilityScore,
            onTimeDeliveryRate: supplier.onTimeDeliveryRate,
            catalogCount: materialsCount,
            performanceTier:
                supplier.reliabilityScore >= 95
                    ? "Tier-1 Premier Partner"
                    : supplier.reliabilityScore >= 85
                    ? "Verified Standard Partner"
                    : "Probationary Listing",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to calculate supplier performance metrics.",
            error: error.message,
        });
    }
});

// CREATE / REGISTER SUPPLIER PROFILE (PROTECTED)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("supplier", "admin"),
    async (req, res) => {
        try {
            const {
                businessName,
                contactEmail,
                phone = "",
                location = {},
                description = "",
                categoriesSupplied = ["Cement", "Steel", "Bricks", "Sand"],
            } = req.body;

            if (!businessName || !contactEmail) {
                return res.status(400).json({
                    message: "Business name and contact email are required.",
                });
            }

            const existing = await Supplier.findOne({
                contactEmail: contactEmail.trim().toLowerCase(),
            });

            if (existing) {
                return res.status(409).json({
                    message: "A supplier with this contact email already exists.",
                });
            }

            const newSupplier = await Supplier.create({
                user: req.user.id,
                businessName: businessName.trim(),
                contactEmail: contactEmail.trim().toLowerCase(),
                phone: phone.trim(),
                location: {
                    address: location.address || "",
                    city: location.city || "Pune",
                    state: location.state || "Maharashtra",
                    zipCode: location.zipCode || "",
                },
                description: description.trim(),
                categoriesSupplied,
                isVerified: req.user.role === "admin", // Auto-verify if admin creates it
            });

            return res.status(201).json({
                message: "Supplier profile registered successfully!",
                supplier: newSupplier,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to register supplier.",
                error: error.message,
            });
        }
    }
);

// ADMIN VERIFICATION TOGGLE (ADMIN ONLY)
router.put(
    "/:id/verify",
    authenticateToken,
    authorizeRoles("admin"),
    async (req, res) => {
        try {
            const supplier = await Supplier.findById(req.params.id);
            if (!supplier) {
                return res.status(404).json({ message: "Supplier not found." });
            }

            supplier.isVerified = !supplier.isVerified;
            await supplier.save();

            return res.status(200).json({
                message: `Supplier verification status updated to: ${
                    supplier.isVerified ? "Verified" : "Unverified"
                }`,
                supplier,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to update supplier verification status.",
                error: error.message,
            });
        }
    }
);

module.exports = router;
