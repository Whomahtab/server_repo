import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    order_id: { type: String, unique: true },

    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    isPackage: {
        type: Boolean, require: true,
    },
    order_date: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Success', 'Cancelled', 'Returned', 'Refunded', 'Failed', 'On Hold', 'Awaiting Payment', 'Out for Delivery', 'Declined'],
        default: "Pending",
        required: true,
    },
    payment_method: {
        type: String,
        enum: ['COD', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet'],
        required: true,
    },

    products: [
        {
            productId: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    // shipment_method: {
    //     type: String,
    //     required: true,
    // },

    total_amount: {
        type: Number,
        required: true,
    },
    // transaction: { type: String }
}, { timestamps: true });

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel






