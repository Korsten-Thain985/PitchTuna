import { query } from '../../boilerplate/db/index.js';

// eslint-disable-next-line import/prefer-default-export


export const findById = async (id) => {
  const { rows } = await query(
    `SELECT id, name, preferred_range, created_at
     FROM users
     WHERE id = $1;`,
    [id]
  );
  return rows[0];
};

export const getAll = async () => {
  const { rows } = await query(
    `SELECT id, name, preferred_range, created_at
     FROM users
     ORDER BY created_at DESC;`
  );
  return rows;
};

export const upsert = async (id, name, preferredRange = 'C3-G5') => {
  // If id is provided, use it; otherwise, generate a string ID
  const userId = id || `user_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

  const { rows } = await query(
    `INSERT INTO users (id, name, preferred_range)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE
       SET name            = EXCLUDED.name,
         preferred_range = EXCLUDED.preferred_range
     RETURNING *;`,
    [userId, name, preferredRange]
  );
  return rows[0];
};


