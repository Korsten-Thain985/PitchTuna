import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Note } from '@tonaljs/tonal'

export const useAttemptsStore = defineStore('attempts', () => {
  const attempts = ref([])
  const userProfile = ref({
    name: 'User',
    id: 'user_' + Date.now(),
    preferredRange: 'C3-G5'
  })

  // Lade Testdaten
  function loadTestData() {
    const testData = [
      {
        attemptId: 1,
        userName: "Zhang",
        userID: "Zhang",
        targetNote: "C4",
        targetPitch: 261.63,
        achievedPitch: 261.50,
        deviationHz: -0.13,
        deviationCent: -0.9,
        timeToHitMs: 3200,
        success: true,
        timestamp: new Date().toISOString()
      },
      {
        attemptId: 2,
        userName: "Patrick",
        userID: "Patrick",
        targetNote: "G4",
        targetPitch: 392.00,
        achievedPitch: 390.10,
        deviationHz: -1.90,
        deviationCent: -8.4,
        timeToHitMs: 5100,
        success: false,
        timestamp: new Date().toISOString()
      },
      {
        attemptId: 3,
        userName: "Tom",
        userID: "Tom",
        targetNote: "A3",
        targetPitch: 220.00,
        achievedPitch: 220.05,
        deviationHz: 0.05,
        deviationCent: 0.4,
        timeToHitMs: 1800,
        success: true,
        timestamp: new Date().toISOString()
      },
      {
        attemptId: 4,
        userName: "Mia",
        userID: "Mia",
        targetNote: "F#4",
        targetPitch: 369.99,
        achievedPitch: 370.20,
        deviationHz: 0.21,
        deviationCent: 1.0,
        timeToHitMs: 2700,
        success: true,
        timestamp: new Date().toISOString()
      }
    ]
    attempts.value = testData
  }

  // Statistik berechnen
  const stats = computed(() => {
    if (attempts.value.length === 0) return null
    
    const successful = attempts.value.filter(a => a.success)
    const today = new Date().toDateString()
    const todayAttempts = attempts.value.filter(a => 
      new Date(a.timestamp).toDateString() === today
    )
    
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
    
    return {
      totalAttempts: attempts.value.length,
      todayAttempts: todayAttempts.length,
      successRate: (successful.length / attempts.value.length * 100).toFixed(1),
      avgDeviationCent: attempts.value.reduce((sum, a) => sum + Math.abs(a.deviationCent), 0) / attempts.value.length,
      avgTimeToHit: attempts.value.reduce((sum, a) => sum + a.timeToHitMs, 0) / attempts.value.length,
      bestNote: Object.entries(notesStats).reduce((best, [note, stats]) => {
        const avgCents = stats.totalCents / stats.count
        const successRate = (stats.successes / stats.count) * 100
        if (!best || successRate > best.successRate) {
          return { note, successRate, avgCents }
        }
        return best
      }, null),
      notesStats
    }
  })

  function addAttempt(attemptData) {
    const newAttempt = {
      attemptId: attempts.value.length + 1,
      userName: userProfile.value.name,
      userID: userProfile.value.id,
      targetNote: attemptData.targetNote,
      targetPitch: Note.freq(attemptData.targetNote) || attemptData.targetPitch,
      achievedPitch: attemptData.achievedPitch,
      deviationHz: attemptData.deviationHz,
      deviationCent: attemptData.deviationCent,
      timeToHitMs: attemptData.timeToHitMs,
      success: attemptData.success,
      confidence: attemptData.confidence || 0,
      noteDetected: attemptData.noteDetected,
      timestamp: new Date().toISOString()
    }
    attempts.value.unshift(newAttempt)
    saveToLocalStorage()
    return newAttempt
  }

  function deleteAttempt(id) {
    attempts.value = attempts.value.filter(a => a.attemptId !== id)
    saveToLocalStorage()
  }

  function clearAllAttempts() {
    attempts.value = []
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem('pitchAttempts', JSON.stringify(attempts.value))
    localStorage.setItem('pitchUserProfile', JSON.stringify(userProfile.value))
  }

  function loadFromLocalStorage() {
    const savedAttempts = localStorage.getItem('pitchAttempts')
    const savedProfile = localStorage.getItem('pitchUserProfile')
    
    if (savedAttempts) {
      attempts.value = JSON.parse(savedAttempts)
    }
    if (savedProfile) {
      userProfile.value = JSON.parse(savedProfile)
    }
  }

  function updateUserProfile(profile) {
    userProfile.value = { ...userProfile.value, ...profile }
    saveToLocalStorage()
  }

  // Initial laden
  loadFromLocalStorage()

  return {
    attempts,
    userProfile,
    stats,
    loadTestData,
    addAttempt,
    deleteAttempt,
    clearAllAttempts,
    updateUserProfile,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})