import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { tenant_id, property_id } = req.query;
        let query = {};
        if (tenant_id) query.tenant_id = tenant_id;
        if (property_id) query.property_id = property_id;

        const issues = await Issue.find(query);
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const issue = new Issue(req.body);
    try {
        const newIssue = await issue.save();
        res.status(201).json(newIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedIssue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an issue
router.delete("/:id", async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });
        res.json({ message: "Issue deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
