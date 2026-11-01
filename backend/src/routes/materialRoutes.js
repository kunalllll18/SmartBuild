const express = require("express");
const Material = require("../models/Material");
const Supplier = require("../models/Supplier");
const PriceHistory = require("../models/PriceHistory");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL MATERIALS (WITH SEARCH, CATEGORY, ECO-FRIENDLY FILTERS, & SORTING)
router.get("/", async (req, res) => {
    try {
        const {
            search = "",
            category = "All Materials",
            ecoOnly = "false",
            sort = "popular", // 'popular' | 'price-asc' | 'price-desc' | 'sustainability'
            page = 1,
            limit = 24,
        } = req.query;

        const query = {};

        // Search in name or description
        if (search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
                { category: { $regex: search.trim(), $options: "i" } },
            ];
        }

        // Category filter
        if (category && category !== "All Materials") {
            query.category = category;
        }

        // Eco-friendly filter
        if (ecoOnly === "true") {
            query.isEcoFriendly = true;
        }

        // Sorting options
        let sortOption = { createdAt: -1 };
        if (sort === "price-asc") {
            sortOption = { price: 1 };
        } else if (sort === "price-desc") {
            sortOption = { price: -1 };
        } else if (sort === "sustainability") {
            sortOption = { sustainabilityScore: -1 };
        }

        const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

        const [materials, totalCount] = await Promise.all([
            Material.find(query)
                .populate("supplier", "businessName rating reliabilityScore isVerified")
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Material.countDocuments(query),
        ]);

        return res.status(200).json({
            count: materials.length,
            total: totalCount,
            page: Number(page),
            totalPages: Math.ceil(totalCount / Number(limit)) || 1,
            materials,
        });
    } catch (error) {
        console.error("Error fetching materials:", error);
        return res.status(500).json({
            message: "Failed to retrieve materials.",
            error: error.message,
        });
    }
});

// GET CATEGORIES WITH MATERIAL COUNTS
router.get("/categories", async (req, res) => {
    try {
        const counts = await Material.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        const totalMaterials = counts.reduce((acc, curr) => acc + curr.count, 0);

        const categoryIcons = {
            Cement: "◈",
            Steel: "▤",
            Bricks: "▦",
            Sand: "△",
            Timber: "▧",
            Aggregates: "❖",
            Finishing: "◎",
            Other: "✳",
        };

        const result = [
            {
                name: "All Materials",
                icon: "✳",
                count: totalMaterials < 10 ? `0${totalMaterials}` : `${totalMaterials}`,
            },
            ...counts.map((c) => ({
                name: c._id,
                icon: categoryIcons[c._id] || "◇",
                count: c.count < 10 ? `0${c.count}` : `${c.count}`,
            })),
        ];

        return res.status(200).json({ categories: result });
    } catch (error) {
        console.error("Error getting categories:", error);
        return res.status(500).json({
            message: "Failed to aggregate categories.",
            error: error.message,
        });
    }
});

// GET SINGLE MATERIAL DETAILS (WITH POPULATED SUPPLIER & PRICE HISTORY)
router.get("/:id", async (req, res) => {
    try {
        const material = await Material.findById(req.params.id).populate(
            "supplier",
            "businessName contactEmail phone location rating reliabilityScore onTimeDeliveryRate isVerified description"
        );

        if (!material) {
            return res.status(404).json({
                message: "Material not found.",
            });
        }

        // Fetch recent 6 months price history
        const priceHistory = await PriceHistory.find({ material: material._id })
            .sort({ recordedAt: 1 })
            .limit(12);

        return res.status(200).json({
            material,
            priceHistory,
        });
    } catch (error) {
        console.error("Error fetching material details:", error);
        return res.status(500).json({
            message: "Failed to retrieve material details.",
            error: error.message,
        });
    }
});

// GET PRICE HISTORY FOR A SPECIFIC MATERIAL
router.get("/:id/price-history", async (req, res) => {
    try {
        const history = await PriceHistory.find({ material: req.params.id })
            .sort({ recordedAt: 1 });

        return res.status(200).json({
            materialId: req.params.id,
            count: history.length,
            history,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch price trend data.",
            error: error.message,
        });
    }
});

// CREATE NEW MATERIAL (PROTECTED: SUPPLIERS AND ADMINS ONLY)
router.post(
    "/",
    authenticateToken,
    authorizeRoles("supplier", "admin"),
    async (req, res) => {
        try {
            const {
                name,
                category,
                price,
                unit = "/ unit",
                description,
                image,
                tag = "Popular",
                specs = {},
                stock = 100,
                isEcoFriendly = false,
                sustainabilityScore = 60,
                carbonFootprint = "Standard",
                supplierId,
            } = req.body;

            if (!name || !category || price === undefined || !description) {
                return res.status(400).json({
                    message: "Material name, category, price, and description are required.",
                });
            }

            let resolvedSupplierId = supplierId;
            let resolvedSupplierName = "Direct Verified Supplier";

            // If user is a supplier, associate with their supplier profile if exists
            if (req.user.role === "supplier") {
                const supplierProfile = await Supplier.findOne({ user: req.user.id });
                if (supplierProfile) {
                    resolvedSupplierId = supplierProfile._id;
                    resolvedSupplierName = supplierProfile.businessName;
                } else if (req.user.companyName) {
                    resolvedSupplierName = req.user.companyName;
                }
            }

            const newMaterial = await Material.create({
                name: name.trim(),
                category: category.trim(),
                price: Number(price),
                unit: unit.trim(),
                description: description.trim(),
                image:
                    image ||
                    "https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&w=800&q=85",
                tag: tag.trim(),
                specs,
                stock: Number(stock),
                isEcoFriendly: Boolean(isEcoFriendly),
                sustainabilityScore: Number(sustainabilityScore),
                carbonFootprint: carbonFootprint.trim(),
                supplier: resolvedSupplierId || null,
                supplierName: resolvedSupplierName,
            });

            // Record initial price point in PriceHistory
            await PriceHistory.create({
                material: newMaterial._id,
                materialName: newMaterial.name,
                price: newMaterial.price,
                marketNote: "Initial catalog listing price",
            });

            return res.status(201).json({
                message: "Material listed successfully!",
                material: newMaterial,
            });
        } catch (error) {
            console.error("Error creating material:", error);
            return res.status(500).json({
                message: "Failed to create material listing.",
                error: error.message,
            });
        }
    }
);

// UPDATE MATERIAL (PROTECTED: SUPPLIER OWNER OR ADMIN)
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("supplier", "admin"),
    async (req, res) => {
        try {
            const material = await Material.findById(req.params.id);
            if (!material) {
                return res.status(404).json({ message: "Material not found." });
            }

            const {
                name,
                category,
                price,
                unit,
                description,
                image,
                tag,
                stock,
                specs,
                isEcoFriendly,
                sustainabilityScore,
            } = req.body;

            const updates = {};
            if (name) updates.name = name.trim();
            if (category) updates.category = category.trim();
            if (unit) updates.unit = unit.trim();
            if (description) updates.description = description.trim();
            if (image) updates.image = image;
            if (tag) updates.tag = tag.trim();
            if (stock !== undefined) updates.stock = Number(stock);
            if (specs) updates.specs = specs;
            if (isEcoFriendly !== undefined) updates.isEcoFriendly = Boolean(isEcoFriendly);
            if (sustainabilityScore !== undefined) updates.sustainabilityScore = Number(sustainabilityScore);

            // If price changed, record historical data point
            if (price !== undefined && Number(price) !== material.price) {
                updates.price = Number(price);
                const oldPrice = material.price;
                const newPrice = Number(price);
                const trend = newPrice > oldPrice ? "rising" : "falling";

                await PriceHistory.create({
                    material: material._id,
                    materialName: updates.name || material.name,
                    price: newPrice,
                    trend,
                    marketNote: `Supplier adjusted price from ₹${oldPrice} to ₹${newPrice}`,
                });
            }

            const updatedMaterial = await Material.findByIdAndUpdate(
                req.params.id,
                { $set: updates },
                { new: true }
            );

            return res.status(200).json({
                message: "Material updated successfully.",
                material: updatedMaterial,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to update material.",
                error: error.message,
            });
        }
    }
);

// DELETE MATERIAL (PROTECTED: SUPPLIERS AND ADMINS)
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("supplier", "admin"),
    async (req, res) => {
        try {
            const material = await Material.findByIdAndDelete(req.params.id);
            if (!material) {
                return res.status(404).json({ message: "Material not found." });
            }

            // Clean up related price history
            await PriceHistory.deleteMany({ material: req.params.id });

            return res.status(200).json({
                message: "Material listing removed successfully.",
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to delete material.",
                error: error.message,
            });
        }
    }
);

module.exports = router;
