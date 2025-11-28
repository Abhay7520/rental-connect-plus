import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    image: { type: String },
    rsvps: [{
        user_id: String,
        status: String
    }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", EventSchema);
