const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        unit: { type: String, default: "/ unit" },
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            default: null,
        },
        supplierName: { type: String, default: "SmartBuild Verified Supplier" },
    },
    { _id: true }
);

const trackingStepSchema = new mongoose.Schema(
    {
        step: { type: String, required: true },
        description: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { _id: false }
);

const defaultTrackingSteps = [
    {
        step: "Order Placed",
        description: "Procurement request submitted and manifest created",
        isCompleted: true,
        completedAt: new Date(),
    },
    {
        step: "Supplier Confirmed",
        description: "Stock allocated by regional distributor",
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
        description: "Logistics vehicle dispatched to construction site",
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

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
        projectName: { type: String, default: "General Site Procurement" },
        items: [orderItemSchema],
        shippingAddress: {
            recipientName: { type: String, default: "" },
            street: { type: String, default: "" },
            city: { type: String, default: "Pune" },
            state: { type: String, default: "Maharashtra" },
            zipCode: { type: String, default: "" },
            phone: { type: String, default: "" },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Cash on Delivery", "Escrow Held"],
            default: "Cash on Delivery",
        },
        orderStatus: {
            type: String,
            enum: [
                "Placed",
                "Confirmed",
                "Processing",
                "In Transit",
                "Delivered",
                "Cancelled",
            ],
            default: "Placed",
        },
        trackingSteps: {
            type: [trackingStepSchema],
            default: defaultTrackingSteps,
        },
        currentStepIndex: {
            type: Number,
            default: 0, // 0: Placed, 1: Confirmed, 2: Processing, 3: In Transit, 4: Delivered
            min: 0,
            max: 4,
        },
        deliveryNotes: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model("Order", orderSchema);
