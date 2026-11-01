const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true,
        },
        materialName: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
        demandFactor: {
            type: Number,
            default: 1.0, // Multiplier for market demand pressure
        },
        trend: {
            type: String,
            enum: ["rising", "stable", "falling"],
            default: "stable",
        },
        marketNote: {
            type: String,
            default: "Standard quarterly wholesale benchmark",
        },
    },
    {
        timestamps: true,
    }
);

priceHistorySchema.index({ material: 1, recordedAt: -1 });

module.exports = mongoose.model("PriceHistory", priceHistorySchema);
