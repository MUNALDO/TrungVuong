import { CREATED, NOT_FOUND } from "../constant/HttpStatus.js";
import AccountSchema from "../models/AccountSchema.js";
import BlogSchema from "../models/BlogSchema.js";
import CategorySchema from "../models/CategorySchema.js";
import { s3Client } from "../awsConfig.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

async function uploadImageToS3(file) {
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${file.originalname}-${Date.now()}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    } catch (error) {
        throw error;
    }
}

export const writeBlog = async (req, res, next) => {
    const adminName = req.query.adminName;
    const categoryName = req.query.categoryName;
    const title = req.body.title;
    let content = req.body.content;
    try {
        const admin = await AccountSchema.findOne({ name: adminName });
        if (!admin) return res.status(NOT_FOUND).json({ message: "Admin not found" });

        const owner_category = await CategorySchema.findOne({ name: categoryName });
        if (!owner_category) return res.status(NOT_FOUND).json({ message: "Category not found" });


        // If files are uploaded, handle them
        if (req.files && req.files.length > 0) {
            // Parse the Markdown to find image references
            const tokens = md.parse(content, {});

            for (const file of req.files) {
                const imageUrl = await uploadImageToS3(file);

                // Search for the corresponding image reference in the tokens
                for (const token of tokens) {
                    if (token.type === 'image' && token.attrs) {
                        const srcIndex = token.attrs.findIndex(attr => attr[0] === 'src');
                        if (token.attrs[srcIndex][1] === file.originalname) {
                            // Replace the local file reference with the S3 URL
                            token.attrs[srcIndex][1] = imageUrl;
                        }
                    }
                }
            }

            // Re-render the Markdown content with updated image URLs
            content = md.renderer.render(tokens, md.options);
        }

        // Create a new blog entry
        const newBlog = new BlogSchema({
            owner_category: categoryName,
            author: adminName,
            title: title,
            content: content
        });

        // Save the blog post
        await newBlog.save();
        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newBlog
        });
    } catch (err) {
        next(err);
    }
}

export const createCategory = async (req, res, next) => {
    try {
        if (req.body.parent_category) {
            const parent_category = await CategorySchema.findOne({ name: req.body.parent_category });
            const newCategory = new CategorySchema({
                name: req.body.name,
                parent_category: parent_category.name
            });
            await newCategory.save();

            parent_category.sub_category.push({
                _id: newCategory._id,
                name: newCategory.name
            })
            await parent_category.save();

            res.status(CREATED).json({
                success: true,
                status: CREATED,
                message: newCategory, parent_category
            });
        }

        const newCategory = new CategorySchema({
            name: req.body.name,
        });
        await newCategory.save();

        res.status(CREATED).json({
            success: true,
            status: CREATED,
            message: newCategory
        });
    } catch (err) {
        next(err);
    }
}
