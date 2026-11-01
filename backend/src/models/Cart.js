const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            default: "/ unit",
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        image: {
            type: String,
            default: "",
        },
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            default: null,
        },
        supplierName: {
            type: String,
            default: "Certified SmartBuild Supplier",
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
        projectName: {
            type: String,
            default: "",
        },
    },
    { _id: true }
);

const cartSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Auto calculate totalAmount before saving
cartSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    next();
});

module.exports = mongoose.model("Cart", cartSchema);
