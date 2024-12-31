import mongoose, { Schema } from "mongoose";

// Testing for
// 1. 211006
// 2. ⁠211001

// Refer to another model for Data Info like kab se kab tak services Chahiye..
const areaPinAvailability = new Schema({
    areaPin: { type: String, unique: true },
    isAvailable: { type: Boolean },
    role: { type: String }
}, {
    timestamps: true
})

const areaPinAvailabilityModel = mongoose.model('areaPinAvailability', areaPinAvailability)


export default areaPinAvailabilityModel;