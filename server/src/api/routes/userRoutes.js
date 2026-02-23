import express from 'express';
import { getUser, getAllUsers, createUser, upsertUser }         from '../../controller/userController.js';
import { getAttempts, createAttempt,
         deleteAllAttempts, getStats } from '../../controller/attemptController.js';

const router = express.Router();

router.get(   '/api/users',             getAllUsers);
router.post(  '/api/users',             createUser);
router.get(   '/api/users/:id',          getUser);
router.put(   '/api/users/:id',          upsertUser);

router.get(   '/api/users/:id/attempts', getAttempts);
router.post(  '/api/users/:id/attempts', createAttempt);
router.delete('/api/users/:id/attempts', deleteAllAttempts);

router.get(   '/api/users/:id/stats',    getStats);

export default router;