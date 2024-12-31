import mongoose from "mongoose";
import { config } from './_config.js'

const connectDb = async () => {
    try {
        const db = await mongoose.connect(config.DB_URL)
        console.log('Database Connected...');
    } catch (error) {
        console.log(error.message);
        return;
    }
}

export default connectDb;