import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    tenant_id: { type: String, required: true },
    property_id: { type: String, required: true },
    booking_id: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    razorpay_payment_id: { type: String },
    date: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", PaymentSchema);
