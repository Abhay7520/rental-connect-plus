import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    tenant_id: { type: String, required: true },
    property_id: { type: String, required: true },
    status: { type: String, default: 'pending' },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    total_price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", BookingSchema);
