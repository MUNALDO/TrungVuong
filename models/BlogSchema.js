import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  owner_category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: { // Storing the Markdown content
    type: String,
    required: true
  }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
