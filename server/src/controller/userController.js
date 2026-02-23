import asyncHandler from 'express-async-handler';
import * as UserModel from '../model/userModel.js';
// eslint-disable-next-line import/prefer-default-export
export async function getUser(req, res) {
  try {
    log('getUser %s', req.params.id);
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function upsertUser(req, res) {
  try {
    const { name, preferredRange } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    log('upsertUser %s', req.params.id);
    const user = await UserModel.upsert({
      id: req.params.id,
      name,
      preferredRange
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upsert user' });
  }
}

