import express from 'express';
import { getUser, upsertUser }         from '../../controller/userController.js';
import { getAttempts, createAttempt,
         deleteAllAttempts, getStats } from '../../controller/attemptController.js';

const router = express.Router();

// ── User profile ───────────────────────────────────────────────────────────────
router.get('/api/users/:id',         getUser);
router.put('/api/users/:id',         upsertUser);

// ── Attempts (nested under user) ───────────────────────────────────────────────
router.get(   '/api/users/:id/attempts', getAttempts);
router.post(  '/api/users/:id/attempts', createAttempt);
router.delete('/api/users/:id/attempts', deleteAllAttempts);

// ── Stats (nested under user) ──────────────────────────────────────────────────
router.get('/api/users/:id/stats',   getStats);

export default router;