import mongoose, { Schema } from "mongoose";

const EmployeeSchema = new Schema({
    id: { type: String, require: true, unique: true },
    fullName: {
        type: String, required: true
    },
    gender: {
        type: String, required: true
    },
    mobileNum: {
        type: Number, unique: true, required: true
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    dob: {
        type: String, required: true
    },
    pinCode: {
        type: Number, required: true
    },
    address: {
        type: String, required: true
    }

}, {
    timestamps: true
})

const EmployeeModel = mongoose.model("Employee", EmployeeSchema)

export default EmployeeModel