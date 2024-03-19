import express from 'express';
import { loginAdmin, logoutAdmin, registerAdmin } from '../controllers/authController.js';
import { verifyTokenAdmin } from '../utils/verifyToken.js';
const router = express.Router();

// authen admin
router.post('/manage-admin/register-admin', registerAdmin);
router.post('/manage-admin/login-admin', loginAdmin);
router.post('/manage-admin/logout-admin', verifyTokenAdmin, logoutAdmin);

export default router;