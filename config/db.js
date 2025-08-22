import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // Database connected successfully
    } catch (error) {
        throw new Error("Database Connection Error");
    }
};

export default connectDB;
