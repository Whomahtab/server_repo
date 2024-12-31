import mongoose, { Schema } from "mongoose";


const PackageSchema = new Schema({
    id: { type: String, unique: true, require: true },
    pkg_id: { type: String, unique: true, require: true },
    name: { type: String, require: true, unique: true, },
    description: { type: String, },
    packageListTextItems: [],
    utensils: [
        {
            utensil_id: { type: String, },
            name: { type: String, },
            quantity: { type: Number, },
        }
    ]
    ,
    capacity: { type: String, require: true },
    "price": { type: Number, require: true },
    "policy": { type: String, },
    "status": { type: String, default: "Available" },
    "notes": { type: String, },
}, { timestamps: true })

const PackageModel = mongoose.model("PackageModel", PackageSchema);

export default PackageModel



// name
// description
// utensils: [],
//     capacity,
//     price,


// pkg_id: { type: String, unique: true, require: true },
// name: { type: String, require: true },
// description: { type: String, },
// utensils: [
//     {
//         utensil_id: { type: String, required: true },
//         name: { type: String, required: true },
//         quantity: { type: Number, required: true },
//     }
// ]
// ,
// capacity: { type: String, require: true },
// "price": { type: Number, require: true },
// "policy": { type: String, },
// "status": { type: String, default: "Available" },