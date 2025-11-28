import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a property
router.post("/", async (req, res) => {
    const property = new Property(req.body);
    try {
        const newProperty = await property.save();
        res.status(201).json(newProperty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a property
router.put("/:id", async (req, res) => {
    try {
        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProperty) return res.status(404).json({ message: "Property not found" });
        res.json(updatedProperty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a property
router.delete("/:id", async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.json({ message: "Property deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
