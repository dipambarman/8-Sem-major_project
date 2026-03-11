import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser, authorizeRoles(['admin']));

// Provide Content-Range to the frontend CORS
router.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
    next();
});

router.get('/:resource', adminController.getList);
router.get('/:resource/:id', adminController.getOne);
router.put('/:resource/:id', adminController.update);
router.post('/:resource', adminController.create);
router.delete('/:resource/:id', adminController.remove);

export default router;
