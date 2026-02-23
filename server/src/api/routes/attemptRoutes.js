import express from 'express';
import { getAllAttempts, getAttempt, deleteAttempt } from '../../controller/attemptController.js';

const router = express.Router();

router.get(   '/api/attempts',           getAllAttempts);
router.get(   '/api/attempts/:attemptId', getAttempt);
router.delete('/api/attempts/:attemptId', deleteAttempt);

export default router;