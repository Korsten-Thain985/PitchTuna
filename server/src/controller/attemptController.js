import asyncHandler from 'express-async-handler';
import * as AttemptModel from '../model/attemptModel.js';
import * as UserModel from '../model/userModel.js';

// eslint-disable-next-line import/prefer-default-export
export const getAttempts = asyncHandler(async (req, res) => {
  res.json(await AttemptModel.findAllByUser(req.params.id));
});

export const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await AttemptModel.findById(req.params.attemptId);
  if (!attempt) throw Object.assign(new Error('Attempt not found'), { status: 404 });
  res.json(attempt);
});

export const getAllAttempts = asyncHandler(async (req, res) => {
  res.json(await AttemptModel.getAll());
});

export const createAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const required = ['userName', 'targetNote', 'targetPitch', 'achievedPitch',
                    'deviationHz', 'deviationCent', 'timeToHitMs', 'success'];
  const missing = required.filter(f => data[f] === undefined);

  if (missing.length) throw Object.assign(new Error(`Fehlende Felder: ${missing.join(', ')}`), { status: 400 });
  if (data.timeToHitMs < 0) throw Object.assign(new Error('timeToHitMs darf nicht negativ sein'), { status: 400 });

  if (!await UserModel.findById(id)) await UserModel.upsert(id, data.userName);

  res.status(201).json(await AttemptModel.create(id, data));
});

export const deleteAttempt = asyncHandler(async (req, res) => {
  const deleted = await AttemptModel.remove(req.params.attemptId);
  if (!deleted) throw Object.assign(new Error('Attempt not found'), { status: 404 });
  res.json(deleted);
});

export const deleteAllAttempts = asyncHandler(async (req, res) => {
  res.json(await AttemptModel.removeAllByUser(req.params.id));
});

export const getStats = asyncHandler(async (req, res) => {
  const s = await AttemptModel.getStatsByUser(req.params.id);
  const total = +s.total_attempts;

  res.json({
    totalAttempts: total,
    todayAttempts: +s.today_attempts,
    successRate: total ? ((+s.successful / total) * 100).toFixed(1) : '0.0',
    avgDeviationCent: +s.avg_deviation_cent || 0,
    avgTimeToHit: +s.avg_time_to_hit || 0
  });
});