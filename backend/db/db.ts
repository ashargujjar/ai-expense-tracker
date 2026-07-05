import mongoose from "mongoose";
export const connectDb = () => {
    try {
        mongoose.connect(process.env.MONGO_URI!)
        console.log("database connected")
    } catch (error: any) {
        console.log("database connection failed", error)
    }
}

