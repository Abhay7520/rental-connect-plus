import express from "express";
import Poll from "../models/Poll.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const polls = await Poll.find();
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/", async (req, res) => {
    const poll = new Poll(req.body);
    try {
        const newPoll = await poll.save();
        res.status(201).json(newPoll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/:id/vote", async (req, res) => {
    try {
        const { optionIndex, userId } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.voters.includes(userId)) {
            return res.status(400).json({ message: "User already voted" });
        }

        poll.votes[optionIndex]++;
        poll.voters.push(userId);

        await poll.save();
        res.json(poll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a poll
router.delete("/:id", async (req, res) => {
    try {
        const poll = await Poll.findByIdAndDelete(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        res.json({ message: "Poll deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
