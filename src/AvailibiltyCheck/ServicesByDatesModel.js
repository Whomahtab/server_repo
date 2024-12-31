import mongoose, { Mongoose, Schema } from "mongoose";


const DateBetweenOrderSchema = new Schema({
    from: { type: string, required: true },
    to: { type: string, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "areaPinAvailability" }
}, { timestamps: true })

const DateBetweenOrderModel = mongoose.model('DateBetweenOrderSchema', DateBetweenOrderSchema)