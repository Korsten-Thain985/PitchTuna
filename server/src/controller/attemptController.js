import asyncHandler from 'express-async-handler';
import * as AttemptModel from '../model/attemptModel.js';
import * as UserModel from '../model/userModel.js';

// eslint-disable-next-line import/prefer-default-export
export async function getAttempts(req, res) {
  try {
    log('getAttempts for user %s', req.params.id);
    const attempts = await AttemptModel.findAllByUser(req.params.id);
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
}

// GET /api/attempts/:attemptId
export async function getAttempt(req, res) {
  try {
    log('getAttempt %s', req.params.attemptId);
    const attempt = await AttemptModel.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    res.json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
}

// POST /api/users/:id/attempts
export async function createAttempt(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Validate required fields
    const required = ['userName', 'targetNote', 'targetPitch', 'achievedPitch',
                      'deviationHz', 'deviationCent', 'timeToHitMs', 'success'];
    const missing = required.filter(f => data[f] === undefined);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }

    // Auto-create user if they don't exist yet
    const user = await UserModel.findById(id);
    if (!user) {
      await UserModel.upsert({ id, name: data.userName });
    }

    log('createAttempt for user %s note %s', id, data.targetNote);
    const attempt = await AttemptModel.create(id, data);
    res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create attempt' });
  }
}

// DELETE /api/attempts/:attemptId
export async function deleteAttempt(req, res) {
  try {
    log('deleteAttempt %s', req.params.attemptId);
    const deleted = await AttemptModel.remove(req.params.attemptId);
    if (!deleted) return res.status(404).json({ error: 'Attempt not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete attempt' });
  }
}

// DELETE /api/users/:id/attempts
export async function deleteAllAttempts(req, res) {
  try {
    log('deleteAllAttempts for user %s', req.params.id);
    const count = await AttemptModel.removeAllByUser(req.params.id);
    res.json({ deleted: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete attempts' });
  }
}

// GET /api/users/:id/stats
export async function getStats(req, res) {
  try {
    log('getStats for user %s', req.params.id);
    const stats = await AttemptModel.getStatsByUser(req.params.id);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
}

