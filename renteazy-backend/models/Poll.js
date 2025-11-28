import mongoose from "mongoose";

const PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    votes: [{ type: Number, default: 0 }],
    voters: [{ type: String }], // Array of user IDs who voted
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Poll", PollSchema);
