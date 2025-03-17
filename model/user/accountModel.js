import mongoose from "mongoose";

const Schema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Indexes
Schema.index({ email: 1 }, { unique: true });
Schema.index({ email: 1, password: 1 });

const AccountModel = mongoose.model("accounts", Schema);

export default AccountModel; 
