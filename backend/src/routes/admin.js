import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticate, authorizeRoles(['admin']));

// Expose Content-Range header for react-admin
router.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
  next();
});

// Generic CRUD for admin dashboard (react-admin compatible)
router.get('/:resource', adminController.getList);
router.get('/:resource/:id', adminController.getOne);
router.put('/:resource/:id', adminController.update);
router.post('/:resource', adminController.create);
router.delete('/:resource/:id', adminController.remove);

export default router;
