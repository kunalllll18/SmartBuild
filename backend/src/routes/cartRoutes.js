const express = require("express");
const Cart = require("../models/Cart");
const Material = require("../models/Material");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// GET CURRENT USER'S CART
router.get("/", authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ customer: req.user.id }).populate(
            "items.material",
            "name category price unit image stock isEcoFriendly"
        );

        if (!cart) {
            cart = await Cart.create({
                customer: req.user.id,
                items: [],
                totalAmount: 0,
            });
        }

        return res.status(200).json({
            cart,
            itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
            totalAmount: cart.totalAmount,
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({
            message: "Failed to retrieve shopping cart.",
            error: error.message,
        });
    }
});

// ADD ITEM TO CART OR UPDATE QUANTITY
router.post("/items", authenticateToken, async (req, res) => {
    try {
        const { materialId, quantity = 1, projectId = null, projectName = "" } = req.body;

        if (!materialId) {
            return res.status(400).json({ message: "Material ID is required." });
        }

        const material = await Material.findById(materialId).populate("supplier");
        if (!material) {
            return res.status(404).json({ message: "Material not found in catalog." });
        }

        let cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            cart = new Cart({ customer: req.user.id, items: [] });
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.material.toString() === materialId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += Number(quantity);
            if (projectId) cart.items[existingItemIndex].project = projectId;
            if (projectName) cart.items[existingItemIndex].projectName = projectName;
        } else {
            cart.items.push({
                material: material._id,
                name: material.name,
                price: material.price,
                unit: material.unit,
                quantity: Number(quantity),
                image: material.image,
                supplier: material.supplier ? material.supplier._id : null,
                supplierName: material.supplierName || (material.supplier ? material.supplier.businessName : "Direct Stockist"),
                project: projectId || null,
                projectName: projectName || "",
            });
        }

        await cart.save();

        return res.status(200).json({
            message: `Added ${material.name} to cart.`,
            cart,
            itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
            totalAmount: cart.totalAmount,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            message: "Failed to update cart.",
            error: error.message,
        });
    }
});

// UPDATE ITEM QUANTITY
router.put("/items/:itemId", authenticateToken, async (req, res) => {
    try {
        const { quantity } = req.body;
        const newQty = Number(quantity);

        if (newQty < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1." });
        }

        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found in cart." });
        }

        item.quantity = newQty;
        await cart.save();

        return res.status(200).json({
            message: "Cart updated.",
            cart,
            itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
            totalAmount: cart.totalAmount,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update item quantity.",
            error: error.message,
        });
    }
});

// REMOVE ITEM FROM CART
router.delete("/items/:itemId", authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        await cart.save();

        return res.status(200).json({
            message: "Item removed from cart.",
            cart,
            itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
            totalAmount: cart.totalAmount,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete item from cart.",
            error: error.message,
        });
    }
});

// CLEAR ENTIRE CART
router.delete("/", authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id });
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
        }

        return res.status(200).json({
            message: "Cart cleared.",
            cart,
            itemCount: 0,
            totalAmount: 0,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to clear cart.",
            error: error.message,
        });
    }
});

module.exports = router;
