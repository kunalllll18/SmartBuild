const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Material = require("../models/Material");
const Project = require("../models/Project");
const Supplier = require("../models/Supplier");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const STEP_MAPPING = {
    Placed: 0,
    Confirmed: 1,
    Processing: 2,
    "In Transit": 3,
    Delivered: 4,
};

// CHECKOUT API: CONVERT CART INTO ACTIVE PURCHASE ORDER
router.post("/checkout", authenticateToken, async (req, res) => {
    try {
        const { shippingAddress = {}, projectId = null, paymentMethod = "Cash on Delivery", notes = "" } = req.body;

        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Your shopping cart is empty. Please add materials before checking out.",
            });
        }

        let projectName = "General Site Procurement";
        let linkedProject = null;
        if (projectId) {
            linkedProject = await Project.findById(projectId);
            if (linkedProject) {
                projectName = linkedProject.name;
            }
        }

        const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        const orderItems = cart.items.map((item) => ({
            material: item.material,
            name: item.name,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            supplier: item.supplier,
            supplierName: item.supplierName || "Certified SmartBuild Supplier",
        }));

        const totalAmount = orderItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

        const trackingSteps = [
            {
                step: "Order Placed",
                description: "Procurement request submitted and manifest generated",
                isCompleted: true,
                completedAt: new Date(),
            },
            {
                step: "Supplier Confirmed",
                description: "Stock allocated by regional commercial stockist",
                isCompleted: false,
                completedAt: null,
            },
            {
                step: "Processing & Batching",
                description: "Materials packaged and loaded onto freight transport",
                isCompleted: false,
                completedAt: null,
            },
            {
                step: "In Transit",
                description: "Consignment dispatched to project site",
                isCompleted: false,
                completedAt: null,
            },
            {
                step: "Delivered & Inspected",
                description: "Consignment safely delivered and accepted at site",
                isCompleted: false,
                completedAt: null,
            },
        ];

        const order = await Order.create({
            orderNumber,
            customer: req.user.id,
            customerName: req.user.name,
            customerEmail: req.user.email,
            project: projectId || null,
            projectName,
            items: orderItems,
            shippingAddress: {
                recipientName: shippingAddress.recipientName || req.user.name,
                street: shippingAddress.street || "",
                city: shippingAddress.city || "Pune",
                state: shippingAddress.state || "Maharashtra",
                zipCode: shippingAddress.zipCode || "",
                phone: shippingAddress.phone || req.user.phone || "",
            },
            totalAmount,
            paymentStatus: paymentMethod === "Online Payment" ? "Paid" : "Cash on Delivery",
            orderStatus: "Placed",
            trackingSteps,
            currentStepIndex: 0,
            deliveryNotes: notes,
        });

        // Deduct material inventory stocks
        for (const item of orderItems) {
            await Material.findByIdAndUpdate(item.material, {
                $inc: { stock: -item.quantity },
            });
        }

        // If linked to a project, update project materials checklist
        if (linkedProject) {
            for (const item of orderItems) {
                const existing = linkedProject.materialsRequired.find(
                    (m) => m.materialName.toLowerCase() === item.name.toLowerCase()
                );
                if (existing) {
                    existing.procuredQuantity += item.quantity;
                    existing.status = "Ordered";
                } else {
                    linkedProject.materialsRequired.push({
                        material: item.material,
                        materialName: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        procuredQuantity: item.quantity,
                        status: "Ordered",
                    });
                }
            }
            linkedProject.status = "Procurement Active";
            await linkedProject.save();
        }

        // Empty user's cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        return res.status(201).json({
            message: `Purchase Order ${orderNumber} placed successfully!`,
            order,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return res.status(500).json({
            message: "Failed to process checkout.",
            error: error.message,
        });
    }
});

// GET ORDERS (ROLE-AWARE FILTERING)
router.get("/", authenticateToken, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "customer") {
            query.customer = req.user.id;
        } else if (req.user.role === "supplier") {
            // Find supplier profile if exists
            const supplierProfile = await Supplier.findOne({ user: req.user.id });
            if (supplierProfile) {
                query.$or = [
                    { "items.supplier": supplierProfile._id },
                    { "items.supplierName": supplierProfile.businessName },
                ];
            } else if (req.user.companyName) {
                query["items.supplierName"] = req.user.companyName;
            }
        }
        // Admins see all orders

        const orders = await Order.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            message: "Failed to retrieve orders.",
            error: error.message,
        });
    }
});

// GET SINGLE ORDER DETAILS
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.material", "name category price unit image")
            .populate("project", "name projectType location");

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (
            req.user.role === "customer" &&
            order.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied to this order manifest." });
        }

        return res.status(200).json({ order });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order details.",
            error: error.message,
        });
    }
});

// UPDATE ORDER DELIVERY STATUS (SUPPLIERS AND ADMINS ONLY)
router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles("supplier", "admin"),
    async (req, res) => {
        try {
            const { status } = req.body;

            if (!STEP_MAPPING.hasOwnProperty(status)) {
                return res.status(400).json({
                    message: `Invalid order status. Allowed: ${Object.keys(STEP_MAPPING).join(", ")}`,
                });
            }

            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: "Order not found." });
            }

            const nextIndex = STEP_MAPPING[status];
            order.orderStatus = status;
            order.currentStepIndex = nextIndex;

            // Mark all steps up to nextIndex as completed
            order.trackingSteps = order.trackingSteps.map((s, idx) => {
                if (idx <= nextIndex) {
                    return {
                        step: s.step,
                        description: s.description,
                        isCompleted: true,
                        completedAt: s.completedAt || new Date(),
                    };
                }
                return s;
            });

            // If delivered, update payment status if COD
            if (status === "Delivered" && order.paymentStatus === "Cash on Delivery") {
                order.paymentStatus = "Paid";
            }

            await order.save();

            // If linked to a project and delivered, update project material status
            if (status === "Delivered" && order.project) {
                const project = await Project.findById(order.project);
                if (project) {
                    for (const item of order.items) {
                        const target = project.materialsRequired.find(
                            (m) => m.materialName.toLowerCase() === item.name.toLowerCase()
                        );
                        if (target) {
                            target.status = "Delivered";
                        }
                    }
                    await project.save();
                }
            }

            return res.status(200).json({
                message: `Order status advanced to '${status}' successfully.`,
                order,
            });
        } catch (error) {
            console.error("Error updating order status:", error);
            return res.status(500).json({
                message: "Failed to update order status.",
                error: error.message,
            });
        }
    }
);

// CANCEL ORDER
router.put("/:id/cancel", authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (
            req.user.role === "customer" &&
            order.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied." });
        }

        if (order.orderStatus === "In Transit" || order.orderStatus === "Delivered") {
            return res.status(400).json({
                message: "Orders already in transit or delivered cannot be cancelled.",
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // Restock inventory
        for (const item of order.items) {
            await Material.findByIdAndUpdate(item.material, {
                $inc: { stock: item.quantity },
            });
        }

        return res.status(200).json({
            message: "Order cancelled and materials returned to stock.",
            order,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to cancel order.",
            error: error.message,
        });
    }
});

module.exports = router;
