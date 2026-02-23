import express from 'express';
import { getTest } from '../../controller/testController.js';

const router = express.Router();

router.get('/test', getTest);

export default router;
