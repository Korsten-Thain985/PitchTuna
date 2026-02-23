import express from 'express';
import { getAttempt, deleteAttempt } from '../../controller/attemptController.js';

const router = express.Router();

// ── Single attempt (by attemptId) ─────────────────────────────────────────────
router.get(   '/api/attempts/:attemptId', getAttempt);
router.delete('/api/attempts/:attemptId', deleteAttempt);

export default router;