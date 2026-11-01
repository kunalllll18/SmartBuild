const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
            enum: [
                "Cement",
                "Steel",
                "Bricks",
                "Sand",
                "Timber",
                "Aggregates",
                "Finishing",
                "Other",
            ],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
            trim: true,
            default: "/ unit",
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            default: "Popular",
        },
        specs: {
            type: Map,
            of: String,
            default: {},
        },
        stock: {
            type: Number,
            default: 100,
            min: 0,
        },
        isEcoFriendly: {
            type: Boolean,
            default: false,
        },
        sustainabilityScore: {
            type: Number,
            default: 60,
            min: 0,
            max: 100,
        },
        carbonFootprint: {
            type: String,
            default: "Standard baseline emission",
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
        isAvailable: {
            type: Boolean,
            default: true,
        },
        minOrderQuantity: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Index for high performance search and category filtering
materialSchema.index({ name: "text", description: "text", category: 1 });

module.exports = mongoose.model("Material", materialSchema);
