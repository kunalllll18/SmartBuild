const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        projectType: {
            type: String,
            enum: ["Residential", "Commercial", "Industrial", "Infrastructure"],
            default: "Residential",
            required: true,
        },
        budget: {
            type: Number,
            default: 0,
            min: 0,
        },
        location: {
            address: { type: String, default: "" },
            city: { type: String, default: "Pune" },
            state: { type: String, default: "Maharashtra" },
            zipCode: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: [
                "Planning",
                "Procurement Active",
                "In Progress",
                "Completed",
                "On Hold",
            ],
            default: "Planning",
        },
        materialsRequired: [
            {
                material: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Material",
                    default: null,
                },
                materialName: { type: String, required: true },
                category: { type: String, default: "General" },
                quantity: { type: Number, required: true, min: 1 },
                unit: { type: String, default: "unit" },
                procuredQuantity: { type: Number, default: 0 },
                status: {
                    type: String,
                    enum: ["Needed", "Ordered", "In Transit", "Delivered"],
                    default: "Needed",
                },
            },
        ],
        recommendations: [
            {
                material: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Material",
                    default: null,
                },
                name: { type: String, required: true },
                benefit: { type: String, required: true },
                estimatedSavings: { type: Number, default: 0 },
                isEcoFriendly: { type: Boolean, default: false },
                engineerStatus: {
                    type: String,
                    enum: ["Pending Review", "Approved", "Modified", "Rejected"],
                    default: "Pending Review",
                },
                engineerNote: { type: String, default: "" },
            },
        ],
        timeline: {
            startDate: { type: Date, default: Date.now },
            targetCompletionDate: { type: Date, default: null },
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
