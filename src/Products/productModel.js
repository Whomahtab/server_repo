import mongoose from "mongoose";


const ProductSchema = mongoose.Schema({
    name: { type: String, require: true },
    price: { type: Number, require: true },
    size: { type: String, require: true },
    stock: { type: String, require: true },
    material: { type: string, require: true },
    category: { type: String, require: true, unique: true },
    images: { type: [], require: true },
    url: { type: String, },
    description: { type: String, require: true }

}, { timestamps: true })

const ProductModel = mongoose.model('Product', ProductSchema)
export default ProductModel
