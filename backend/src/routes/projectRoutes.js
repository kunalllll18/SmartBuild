const express = require("express");
const Project = require("../models/Project");
const Material = require("../models/Material");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET PROJECTS (ROLE-AWARE: CUSTOMER SEES THEIRS, ENGINEER & ADMIN SEES ALL)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const query = {};

        if (req.user.role === "customer") {
            query.customer = req.user.id;
        }

        const projects = await Project.find(query)
            .populate("customer", "name email phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: projects.length,
            projects,
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({
            message: "Failed to retrieve projects.",
            error: error.message,
        });
    }
});

// GET SINGLE PROJECT DETAILS
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("customer", "name email phone")
            .populate("materialsRequired.material", "name price unit category image stock");

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Access check: Customer can only access their own project; Engineers & Admins can review all
        if (
            req.user.role === "customer" &&
            project.customer._id.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied to this project." });
        }

        return res.status(200).json({ project });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch project details.",
            error: error.message,
        });
    }
});

// CREATE NEW PROJECT
router.post("/", authenticateToken, async (req, res) => {
    try {
        const {
            name,
            projectType = "Residential",
            budget = 0,
            location = {},
            timeline = {},
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Project title is required." });
        }

        // Generate default initial AI recommendations based on project type
        const defaultRecommendations = [
            {
                name:
                    projectType === "Commercial" || projectType === "Industrial"
                        ? "Fe550D High-Ductility Corrosion Resistant Steel"
                        : "Fly-Ash Portland Pozzolana Cement (PPC 53)",
                benefit:
                    projectType === "Commercial" || projectType === "Industrial"
                        ? "High seismic load resistance and 40+ year structural durability"
                        : "Cuts carbon emissions by 24% while resisting thermal hydration cracking",
                estimatedSavings: projectType === "Commercial" ? 45000 : 18000,
                isEcoFriendly: true,
                engineerStatus: "Pending Review",
                engineerNote: "",
            },
            {
                name: "Autoclaved Aerated Concrete (AAC) Lightweight Blocks",
                benefit: "Reduces dead structural load by 50% and provides superior thermal insulation",
                estimatedSavings: 32000,
                isEcoFriendly: true,
                engineerStatus: "Pending Review",
                engineerNote: "",
            },
        ];

        const newProject = await Project.create({
            customer: req.user.id,
            name: name.trim(),
            projectType,
            budget: Number(budget) || 0,
            location: {
                address: location.address || "",
                city: location.city || "Pune",
                state: location.state || "Maharashtra",
                zipCode: location.zipCode || "",
            },
            status: "Planning",
            materialsRequired: [],
            recommendations: defaultRecommendations,
            timeline: {
                startDate: timeline.startDate || new Date(),
                targetCompletionDate: timeline.targetCompletionDate || null,
            },
        });

        return res.status(201).json({
            message: "Project created successfully!",
            project: newProject,
        });
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({
            message: "Failed to create project.",
            error: error.message,
        });
    }
});

// UPDATE PROJECT
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        if (
            req.user.role === "customer" &&
            project.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied." });
        }

        const { name, projectType, budget, location, status, timeline } = req.body;
        const updates = {};

        if (name) updates.name = name.trim();
        if (projectType) updates.projectType = projectType;
        if (budget !== undefined) updates.budget = Number(budget);
        if (location) updates.location = location;
        if (status) updates.status = status;
        if (timeline) updates.timeline = timeline;

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        return res.status(200).json({
            message: "Project updated successfully.",
            project: updated,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update project.",
            error: error.message,
        });
    }
});

// ADD MATERIAL TO PROJECT CHECKLIST
router.post("/:id/materials", authenticateToken, async (req, res) => {
    try {
        const { materialId, materialName, quantity, unit, category } = req.body;

        if (!materialName || !quantity) {
            return res.status(400).json({
                message: "Material name and required quantity are mandatory.",
            });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        if (
            req.user.role === "customer" &&
            project.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied." });
        }

        project.materialsRequired.push({
            material: materialId || null,
            materialName: materialName.trim(),
            category: category || "General",
            quantity: Number(quantity),
            unit: unit || "unit",
            status: "Needed",
        });

        // Set status to Procurement Active if materials are added
        if (project.status === "Planning") {
            project.status = "Procurement Active";
        }

        await project.save();

        return res.status(200).json({
            message: "Material added to project requirements checklist.",
            project,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to add material requirement.",
            error: error.message,
        });
    }
});

// ENGINEER RECOMMENDATION VERIFICATION ROUTE
router.put(
    "/:id/recommendations/:recId",
    authenticateToken,
    authorizeRoles("engineer", "admin"),
    async (req, res) => {
        try {
            const { engineerStatus, engineerNote = "" } = req.body;

            if (!["Approved", "Modified", "Rejected"].includes(engineerStatus)) {
                return res.status(400).json({
                    message: "Status must be Approved, Modified, or Rejected.",
                });
            }

            const project = await Project.findById(req.params.id);
            if (!project) {
                return res.status(404).json({ message: "Project not found." });
            }

            const rec = project.recommendations.id(req.params.recId);
            if (!rec) {
                return res.status(404).json({ message: "Recommendation not found." });
            }

            rec.engineerStatus = engineerStatus;
            rec.engineerNote =
                engineerNote.trim() ||
                `Technical review completed by Eng. ${req.user.name} (${req.user.specialization || "Civil Engineer"}).`;

            await project.save();

            return res.status(200).json({
                message: `Recommendation marked as ${engineerStatus}.`,
                project,
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed to update engineering verification.",
                error: error.message,
            });
        }
    }
);

// DELETE PROJECT
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        if (
            req.user.role === "customer" &&
            project.customer.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "Access denied." });
        }

        await Project.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete project.",
            error: error.message,
        });
    }
});

module.exports = router;
