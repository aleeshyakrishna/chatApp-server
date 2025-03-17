import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoDBConnect = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('🟢 MongoDB connected');
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        await mongoose.connect(process.env.MONGO_URI, {
            readPreference: "secondaryPreferred",
            retryWrites: true,
            w: "majority"
        });

        console.log('✅ Database Connected Successfully to Replica Set');

        const admin = mongoose.connection.db.admin();
        admin.command({ replSetGetStatus: 1 }, (err, info) => {
            if (err) {
                console.error("❌ Error fetching replica set status:", err);
            } else {
                console.log("🔄 Replica Set Status:", info);
            }
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

export default mongoDBConnect;

