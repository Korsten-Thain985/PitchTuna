import { query } from '../../boilerplate/db/index.js';

// eslint-disable-next-line import/prefer-default-export
export const getTest = async () => {
  const { rows } = await query("SELECT 'It works' as test");
  return rows;
};


export function toAttempt(row) {
  return {
    attemptId:     row.attempt_id,
    userID:        row.user_id,
    userName:      row.user_name,
    targetNote:    row.target_note,
    targetPitch:   parseFloat(row.target_pitch),
    achievedPitch: parseFloat(row.achieved_pitch),
    deviationHz:   parseFloat(row.deviation_hz),
    deviationCent: parseFloat(row.deviation_cent),
    timeToHitMs:   row.time_to_hit_ms,
    success:       row.success,
    confidence:    parseFloat(row.confidence ?? 0),
    noteDetected:  row.note_detected,
    timestamp:     row.created_at
  };
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function findAllByUser(userId) {
  const { rows } = await query(
    'SELECT * FROM attempts WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(toAttempt);
}

export async function findById(attemptId) {
  const { rows } = await query(
    'SELECT * FROM attempts WHERE attempt_id = $1',
    [attemptId]
  );
  return rows[0] ? toAttempt(rows[0]) : null;
}

export async function create(userId, data) {
  const { rows } = await query(
    `INSERT INTO attempts
       (user_id, user_name, target_note, target_pitch, achieved_pitch,
        deviation_hz, deviation_cent, time_to_hit_ms, success, confidence, note_detected)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
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
      data.noteDetected ?? null
    ]
  );
  return toAttempt(rows[0]);
}

export async function remove(attemptId) {
  const { rowCount } = await query(
    'DELETE FROM attempts WHERE attempt_id = $1',
    [attemptId]
  );
  return rowCount > 0;
}

export async function removeAllByUser(userId) {
  const { rowCount } = await query(
    'DELETE FROM attempts WHERE user_id = $1',
    [userId]
  );
  return rowCount;
}

export async function getStatsByUser(userId) {
  const { rows } = await query(
    `SELECT
       COUNT(*)                                          AS total_attempts,
       COUNT(*) FILTER (WHERE success)                   AS successful,
       AVG(ABS(deviation_cent))                          AS avg_deviation_cent,
       AVG(time_to_hit_ms)                               AS avg_time_to_hit,
       COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today_attempts
     FROM attempts
     WHERE user_id = $1`,
    [userId]
  );

  const s = rows[0];
  const total = parseInt(s.total_attempts);

  return {
    totalAttempts:    total,
    todayAttempts:    parseInt(s.today_attempts),
    successRate:      total > 0
                        ? ((parseInt(s.successful) / total) * 100).toFixed(1)
                        : '0.0',
    avgDeviationCent: parseFloat(s.avg_deviation_cent ?? 0),
    avgTimeToHit:     parseFloat(s.avg_time_to_hit ?? 0)
  };
}