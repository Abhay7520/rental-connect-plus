import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
    tenant_id: { type: String, required: true },
    property_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'open' },
    priority: { type: String, default: 'medium' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Issue", IssueSchema);
