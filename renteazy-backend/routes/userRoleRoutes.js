import express from "express";
import UserRole from "../models/UserRole.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const userRole = await UserRole.findOne({ userId: req.params.userId });
        if (!userRole) return res.status(404).json({ message: "Role not found" });
        res.json(userRole);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { userId, role } = req.body;
        const userRole = await UserRole.findOneAndUpdate(
            { userId },
            { role, assignedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json(userRole);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
