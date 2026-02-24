import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Note } from '@tonaljs/tonal'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

function normalizeAttemptFromServer(r) {
  if (!r) return r
  return {
    attemptId: r.attempt_id ?? r.attemptId ?? r.id,
    userID: r.user_id ?? r.userID,
    userName: r.user_name ?? r.userName,
    targetNote: r.target_note ?? r.targetNote,
    targetPitch: r.target_pitch !== undefined ? Number(r.target_pitch) : r.targetPitch,
    achievedPitch: r.achieved_pitch !== undefined ? Number(r.achieved_pitch) : r.achievedPitch,
    deviationHz: r.deviation_hz !== undefined ? Number(r.deviation_hz) : r.deviationHz,
    deviationCent: r.deviation_cent !== undefined ? Number(r.deviation_cent) : r.deviationCent,
    timeToHitMs: r.time_to_hit_ms ?? r.timeToHitMs,
    success: r.success === true || r.success === 't' || r.success === 1,
    confidence: r.confidence !== undefined ? Number(r.confidence) : (r.confidence ?? 0),
    noteDetected: r.note_detected ?? r.noteDetected ?? null,
    timestamp: r.created_at ?? r.timestamp
  }
}

export const useAttemptsServerStore = defineStore('attemptsServer', () => {
  const attempts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const userProfile = ref({
    name: 'User',
    id: 'user_' + Date.now(),
    preferredRange: 'C3-G5'
  })

  const stats = computed(() => {
    if (!attempts.value || attempts.value.length === 0) return null

    const successful = attempts.value.filter(a => a.success)
    const today = new Date().toDateString()
    const todayAttempts = attempts.value.filter(a => new Date(a.timestamp).toDateString() === today)

    // Durchschnittliche Abweichung nach Note
    const notesStats = {}
    attempts.value.forEach(attempt => {
      if (!notesStats[attempt.targetNote]) {
        notesStats[attempt.targetNote] = {
          count: 0,
          totalCents: 0,
          successes: 0
        }
      }
      notesStats[attempt.targetNote].count++
      notesStats[attempt.targetNote].totalCents += Math.abs(attempt.deviationCent)
      if (attempt.success) notesStats[attempt.targetNote].successes++
    })

    const avgDeviationCent = attempts.value.reduce((sum, a) => sum + Math.abs(a.deviationCent), 0) / attempts.value.length
    const avgTimeToHit = attempts.value.reduce((sum, a) => sum + a.timeToHitMs, 0) / attempts.value.length

    const bestNote = Object.entries(notesStats).reduce((best, [note, s]) => {
      const avgCents = s.totalCents / s.count
      const successRate = (s.successes / s.count) * 100
      if (!best || successRate > best.successRate) {
        return { note, successRate, avgCents }
      }
      return best
    }, null)

    return {
      totalAttempts: attempts.value.length,
      todayAttempts: todayAttempts.length,
      successRate: (successful.length / attempts.value.length * 100).toFixed(1),
      avgDeviationCent,
      avgTimeToHit,
      bestNote,
      notesStats
    }
  })

  function normalizeAttemptPayload(attemptData, userName) {
    return {
      userName: userName || attemptData.userName,
      targetNote: attemptData.targetNote,
      targetPitch: Note.freq(attemptData.targetNote) || attemptData.targetPitch,
      achievedPitch: attemptData.achievedPitch,
      deviationHz: attemptData.deviationHz,
      deviationCent: attemptData.deviationCent,
      timeToHitMs: attemptData.timeToHitMs,
      success: attemptData.success,
      confidence: attemptData.confidence ?? 0,
      noteDetected: attemptData.noteDetected ?? null
    }
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/attempts`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = await res.json()
      attempts.value = Array.isArray(rows) ? rows.map(normalizeAttemptFromServer) : []
      return attempts.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchByUser(userId) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/attempts`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rows = await res.json()
      attempts.value = Array.isArray(rows) ? rows.map(normalizeAttemptFromServer) : []
      return attempts.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('pitchAttempts', JSON.stringify(attempts.value))
    localStorage.setItem('pitchUserProfile', JSON.stringify(userProfile.value))
  }

  function loadFromLocalStorage() {
    const savedAttempts = localStorage.getItem('pitchAttempts')
    const savedProfile = localStorage.getItem('pitchUserProfile')
    if (savedAttempts) attempts.value = JSON.parse(savedAttempts)
    if (savedProfile) userProfile.value = JSON.parse(savedProfile)
  }

  function updateUserProfile(profile) {
    userProfile.value = { ...userProfile.value, ...profile }
    saveToLocalStorage()
  }

  async function getAttempt(attemptId) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/attempts/${attemptId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const row = await res.json()
      return normalizeAttemptFromServer(row)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAttempt(userId, attemptData, userName) {
    loading.value = true
    error.value = null
    try {
      const id = userId || userProfile.value.id
      const name = userName || userProfile.value.name
      const payload = normalizeAttemptPayload(attemptData, name)
      const res = await fetch(`${API_BASE}/api/users/${id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const text = await res.text().catch(() => null)
        throw new Error(`Create failed: ${res.status} ${text || ''}`)
      }
      const created = await res.json()
      const normalized = normalizeAttemptFromServer(created)
      // prefer server's returned object; add locally for immediate UI
      attempts.value.unshift(normalized)
      saveToLocalStorage()
      return normalized
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAttempt(attemptId) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/attempts/${attemptId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      await res.json().catch(() => null)
      attempts.value = attempts.value.filter(a => a.attemptId !== attemptId && a.id !== attemptId)
      saveToLocalStorage()
      return true
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAllByUser(userId) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/attempts`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete all failed: ${res.status}`)
      attempts.value = attempts.value.filter(a => String(a.userID || a.user_id) !== String(userId))
      saveToLocalStorage()
      return true
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // Load persisted profile/attempts if present
  loadFromLocalStorage()

  return {
    attempts,
    loading,
    error,
    userProfile,
    stats,
    fetchAll,
    fetchByUser,
    getAttempt,
    createAttempt,
    deleteAttempt,
    deleteAllByUser,
    updateUserProfile,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})




