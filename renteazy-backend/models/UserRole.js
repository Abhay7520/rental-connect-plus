import mongoose from "mongoose";

const UserRoleSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: String, default: 'system' },
});

export default mongoose.model("UserRole", UserRoleSchema);
