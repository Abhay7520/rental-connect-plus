import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['festival', 'maintenance', 'event'], required: true },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Announcement", AnnouncementSchema);
