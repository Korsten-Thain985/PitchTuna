import asyncHandler from 'express-async-handler';
import * as UserModel from '../model/userModel.js';
// eslint-disable-next-line import/prefer-default-export
export const getUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.getAll();
  res.status(200).json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, preferredRange } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name darf nicht leer sein');
  }

  const user = await UserModel.upsert(null, name, preferredRange);
  res.status(201).json(user);
});

export const upsertUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, preferredRange } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error('Name darf nicht leer sein');
  }

  const user = await UserModel.upsert(id, name, preferredRange);
  res.status(200).json(user);
});