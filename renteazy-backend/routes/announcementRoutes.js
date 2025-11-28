import express from "express";
import Announcement from "../models/Announcement.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find();
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const announcement = new Announcement(req.body);
    try {
        const newAnnouncement = await announcement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an announcement
router.delete("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ message: "Announcement not found" });
        res.json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
