import express from 'express';
import { getMessages, createMessage } from '../../controllers/message/index.js';
import authMiddleware from '../../middleware/auth.js';
import { catchErrors } from '../../errorHandler/index.js';
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', catchErrors(getMessages));
router.post('/', catchErrors(createMessage));

export default router;