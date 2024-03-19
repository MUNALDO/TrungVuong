import express from 'express';
import { verifyTokenAdmin } from '../utils/verifyToken.js';
import { createCategory, writeBlog } from '../controllers/adminController.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

// manage blog
router.post('/manage-blog/create', verifyTokenAdmin, upload.array('images'), writeBlog);

// manage category
router.post('/manage-category/create', verifyTokenAdmin, createCategory);

export default router;