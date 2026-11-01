const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        location: {
            address: { type: String, default: "" },
            city: { type: String, default: "Pune" },
            state: { type: String, default: "Maharashtra" },
            zipCode: { type: String, default: "" },
        },
        description: {
            type: String,
            default: "Certified construction material distributor and wholesale partner.",
        },
        rating: {
            type: Number,
            default: 4.8,
            min: 1,
            max: 5,
        },
        reliabilityScore: {
            type: Number,
            default: 95, // percentage
            min: 0,
            max: 100,
        },
        onTimeDeliveryRate: {
            type: Number,
            default: 97.5, // percentage
            min: 0,
            max: 100,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        categoriesSupplied: {
            type: [String],
            default: ["Cement", "Steel", "Bricks", "Sand"],
        },
        avatar: {
            type: String,
            default: "🏭",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Supplier", supplierSchema);
