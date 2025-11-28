import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { tenant_id, property_id } = req.query;
        let query = {};
        if (tenant_id) query.tenant_id = tenant_id;
        if (property_id) query.property_id = property_id;

        const bookings = await Booking.find(query);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const booking = new Booking(req.body);
    try {
        const newBooking = await booking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
