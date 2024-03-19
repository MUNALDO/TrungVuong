import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        parent_category: {
            type: String
        },
        sub_category: [],
    },
    { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);