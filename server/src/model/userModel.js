import { query } from '../../boilerplate/db/index.js';

// eslint-disable-next-line import/prefer-default-export


export function toUserProfile(row) {
  return {
    id:             row.id,
    name:           row.name,
    preferredRange: row.preferred_range,
    createdAt:      row.created_at
  };
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function findById(id) {
  const { rows } = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ? toUserProfile(rows[0]) : null;
}

export async function upsert({ id, name, preferredRange = 'C3-G5' }) {
  const { rows } = await query(
    `INSERT INTO users (id, name, preferred_range)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE
       SET name           = EXCLUDED.name,
           preferred_range = EXCLUDED.preferred_range
     RETURNING *`,
    [id, name, preferredRange]
  );
  return toUserProfile(rows[0]);
}

