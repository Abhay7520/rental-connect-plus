import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const event = new Event(req.body);
    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/:id/rsvp", async (req, res) => {
    try {
        const { userId, status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const existingRsvpIndex = event.rsvps.findIndex(r => r.user_id === userId);
        if (existingRsvpIndex > -1) {
            event.rsvps[existingRsvpIndex].status = status;
        } else {
            event.rsvps.push({ user_id: userId, status });
        }

        await event.save();
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an event
router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
