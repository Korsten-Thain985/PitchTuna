import { query } from '../../boilerplate/db/index.js';

// eslint-disable-next-line import/prefer-default-export
export const findAllByUser = async (userId) => {
  const { rows } = await query(
    `SELECT *
     FROM attempts
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [userId]
  );
  return rows;
};

export const findById = async (attemptId) => {
  const { rows } = await query(
    `SELECT *
     FROM attempts
     WHERE attempt_id = $1;`,
    [attemptId]
  );
  return rows[0];
};

export const create = async (userId, data) => {
  const { rows } = await query(
    `INSERT INTO attempts
       (user_id, user_name, target_note, target_pitch, achieved_pitch,
        deviation_hz, deviation_cent, time_to_hit_ms, success, confidence, note_detected)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *;`,
    [
      userId,
      data.userName,
      data.targetNote,
      data.targetPitch,
      data.achievedPitch,
      data.deviationHz,
      data.deviationCent,
      data.timeToHitMs,
      data.success,
      data.confidence ?? 0,
      data.noteDetected ?? null,
    ]
  );
  return rows[0];
};

export const remove = async (attemptId) => {
  const { rows } = await query(
    `DELETE FROM attempts
     WHERE attempt_id = $1
     RETURNING *;`,
    [attemptId]
  );
  return rows[0];
};

export const removeAllByUser = async (userId) => {
  const { rows } = await query(
    `DELETE FROM attempts
     WHERE user_id = $1
     RETURNING *;`,
    [userId]
  );
  return rows;
};

export const getAll = async () => {
  const { rows } = await query(
    `SELECT *
     FROM attempts
     ORDER BY created_at DESC;`
  );
  return rows;
};

export const getStatsByUser = async (userId) => {
  const { rows } = await query(
    `SELECT
       COUNT(*)                                               AS total_attempts,
       COUNT(*)  FILTER (WHERE success)                      AS successful,
       AVG(ABS(deviation_cent))                              AS avg_deviation_cent,
       AVG(time_to_hit_ms)                                   AS avg_time_to_hit,
       COUNT(*)  FILTER (WHERE created_at::date = CURRENT_DATE) AS today_attempts
     FROM attempts
     WHERE user_id = $1;`,
    [userId]
  );
  return rows[0];
};