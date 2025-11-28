import express from "express";
import Payment from "../models/Payment.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { tenant_id, property_id } = req.query;
        let query = {};
        if (tenant_id) query.tenant_id = tenant_id;
        if (property_id) query.property_id = property_id;

        const payments = await Payment.find(query).sort({ created_at: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const payment = new Payment(req.body);
        const newPayment = await payment.save();
        res.status(201).json(newPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPayment) return res.status(404).json({ message: "Payment not found" });
        res.json(updatedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a payment
router.delete("/:id", async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.json({ message: "Payment deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
