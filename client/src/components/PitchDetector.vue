<template>
  <div class="pitch-detector q-pa-md">
    <!-- Header -->
    <div class="header q-mb-lg">
      <div class="text-h5 text-weight-bold">🎵 Pitch Training</div>
      <div class="text-subtitle2 text-grey-7">Real-time pitch detection with professional accuracy</div>
    </div>

    <!-- User Profile -->
    <q-card class="q-mb-md">
      <q-card-section class="q-pa-sm">
        <div class="row items-center">
          <div class="col">
            <q-input
              v-model="userName"
              label="Your Name"
              dense
              outlined
              @update:model-value="updateUserName"
            />
          </div>
          <div class="col-auto">
            <q-chip icon="person" color="primary">
              {{ attemptsStore.attempts.length }} attempts
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Target Selection -->
    <div class="target-section q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">🎯 Target Note</div>
      
      <!-- Custom Note Input -->
      <div class="row q-col-gutter-sm q-mb-sm">
        <div class="col-6">
          <q-input
            v-model="customNote"
            label="Enter note (e.g., C4, D#4)"
            outlined
            dense
            @keyup.enter="applyCustomNote"
          >
            <template v-slot:append>
              <q-icon name="music_note" />
            </template>
          </q-input>
        </div>
        <div class="col-3">
          <q-btn
            color="primary"
            label="Set Note"
            @click="applyCustomNote"
            class="full-width full-height"
          />
        </div>
        <div class="col-3">
          <q-btn
            color="secondary"
            label="Random"
            icon="casino"
            @click="selectRandomNote"
            outline
            class="full-width full-height"
          />
        </div>
      </div>
      
      <!-- Target Display -->
      <div class="target-display q-pa-lg text-center bg-blue-1 rounded-borders">
        <div class="text-h2 text-weight-bold text-primary">{{ targetNote }}</div>
        <div class="text-caption text-grey-7 q-mb-md">
          {{ targetPitch.toFixed(2) }} Hz • MIDI: {{ targetMidi }}
        </div>
        
        <!-- Play Target Note Button -->
        <q-btn
          color="positive"
          :label="isPlayingNote ? 'Playing...' : 'Play Target Note'"
          icon="volume_up"
          @click="playTargetNote"
          :loading="isPlayingNote"
          :disable="isPlayingNote"
          size="md"
          rounded
          class="q-mt-sm"
        />
      </div>
    </div>

    <!-- Current Pitch Display -->
    <div class="current-pitch-section q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">📊 Current Detection</div>
      
      <q-card class="current-pitch-card">
        <q-card-section class="text-center">
          <template v-if="isListening && currentPitch">
            <!-- Note Anzeige -->
            <div class="note-display q-mb-md">
              <div class="text-h1 text-weight-bold">{{ currentPitch.note || '--' }}</div>
              <div class="text-h6 text-grey-7">
                {{ currentPitch.frequency.toFixed(1) }} Hz
                <span v-if="currentPitch.confidence" class="q-ml-sm">
                  ({{ (currentPitch.confidence * 100).toFixed(0) }}% conf)
                </span>
              </div>
            </div>
            
            <!-- Deviation Anzeige -->
            <div class="deviation-display q-mb-md">
              <div class="text-h5 q-mb-sm">
                Deviation: 
                <q-badge :color="deviationColor" class="q-ml-sm">
                  {{ deviationCent > 0 ? '+' : '' }}{{ deviationCent.toFixed(1) }} cents
                </q-badge>
              </div>
              <q-linear-progress 
                :value="progressValue"
                :color="deviationColor"
                size="20px"
                class="q-mb-sm"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge :color="deviationColor" text-color="white">
                    {{ Math.abs(deviationCent).toFixed(1) }} cents
                  </q-badge>
                </div>
              </q-linear-progress>
              <div class="row justify-between text-caption text-grey-7">
                <div>Too Low</div>
                <div>Perfect</div>
                <div>Too High</div>
              </div>
            </div>
            
            <!-- Note Vergleich -->
            <div class="note-comparison q-mb-md">
              <div class="row items-center justify-center">
                <div class="col-5 text-right">
                  <div class="text-h6">Target:</div>
                  <div class="text-h4 text-weight-bold">{{ targetNote }}</div>
                </div>
                <div class="col-2 text-center">
                  <q-icon 
                    :name="deviationIcon" 
                    :color="deviationColor" 
                    size="xl"
                  />
                </div>
                <div class="col-5 text-left">
                  <div class="text-h6">You:</div>
                  <div class="text-h4 text-weight-bold">{{ currentPitch.note || '--' }}</div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else-if="isListening">
            <div class="q-pa-xl text-center">
              <q-spinner-audio color="primary" size="50px" />
              <div class="text-h6 q-mt-md">Listening... Sing or play a note</div>
              <div class="text-caption text-grey-7">Make sure your microphone is working</div>
            </div>
          </template>
          
          <template v-else>
            <div class="q-pa-xl text-center">
              <q-icon name="mic_none" size="60px" color="grey-5" />
              <div class="text-h6 q-mt-md">Ready to start</div>
              <div class="text-caption text-grey-7">Click "Start Listening" to begin</div>
            </div>
          </template>
          
          <!-- Timer -->
          <div class="timer-display q-mt-md">
            <q-chip v-if="timer > 0" icon="schedule" color="primary">
              Time: {{ (timer / 1000).toFixed(1) }}s
            </q-chip>
            <q-chip v-else icon="schedule" color="grey">
              Time: 0.0s
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Controls -->
    <div class="controls-section q-mb-lg">
      <div class="row q-col-gutter-sm">
        <div class="col">
          <q-btn
            :color="isListening ? 'negative' : 'positive'"
            :icon="isListening ? 'stop' : 'mic'"
            :label="isListening ? 'Stop' : 'Start Listening'"
            @click="toggleListening"
            class="full-width"
            size="lg"
            :loading="isInitializing"
          />
        </div>
        <div class="col">
          <q-btn
            v-if="currentAttempt"
            color="primary"
            label="Save Attempt"
            icon="save"
            @click="saveAttempt"
            class="full-width"
            size="lg"
            :disable="!currentPitch"
          />
        </div>
      </div>
      
      <div class="row q-col-gutter-sm q-mt-sm">
        <div class="col">
          <q-btn
            v-if="currentAttempt"
            color="grey"
            label="Clear"
            icon="clear"
            @click="clearAttempt"
            outline
            class="full-width"
          />
        </div>
        <div class="col">
          <q-btn
            color="secondary"
            label="Settings"
            @click="showSettings = !showSettings"
            icon="settings"
            class="full-width"
            outline
          />
        </div>
      </div>
    </div>

    <!-- Settings -->
    <q-slide-transition>
      <div v-if="showSettings" class="settings-section q-mb-lg">
        <q-card>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">⚙️ Detection Settings</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select
                  v-model="detectorType"
                  :options="detectorOptions"
                  label="Detector Algorithm"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-toggle
                  v-model="autoSave"
                  label="Auto-save successful attempts"
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-12">
                <q-slider
                  v-model="successThreshold"
                  :min="0"
                  :max="50"
                  label
                  label-always
                  :label-value="`Success threshold: ${successThreshold} cents`"
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-slide-transition>

    <!-- Instructions -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle2">📋 How to use:</div>
        <ol class="q-pl-md q-mb-none">
          <li>Enter your name</li>
          <li>Type a target note (like C4, D#4) or use "Random"</li>
          <li>Click "Play Target Note" to hear the target</li>
          <li>Click "Start Listening"</li>
          <li>Sing or play the target note</li>
          <li>Try to match the green zone (±{{ successThreshold }} cents)</li>
          <li>Click "Save Attempt" to record your progress</li>
        </ol>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAttemptsStore } from '@/stores/attempts'
import { pitchDetector } from '@/services/PitchDetectionService'
import { Note, Midi } from '@tonaljs/tonal'
import * as Tone from 'tone'
import { Notify } from 'quasar'

const attemptsStore = useAttemptsStore()

// State
const targetNote = ref('C4')
const customNote = ref('C4')
const isListening = ref(false)
const isInitializing = ref(false)
const isPlayingNote = ref(false)
const currentPitch = ref(null)
const timer = ref(0)
const startTime = ref(0)
const timerInterval = ref(null)
const showSettings = ref(false)
const userName = ref(attemptsStore.userProfile.name)
const detectorType = ref('yin')
const autoSave = ref(false)
const successThreshold = ref(20)

// Tone.js Synth
let synth = null

// Initialize Tone.js
onMounted(() => {
  synth = new Tone.Synth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8
    }
  }).toDestination()

  // Lade Testdaten wenn keine vorhanden
  if (attemptsStore.attempts.length === 0) {
    attemptsStore.loadTestData()
  }
})

// Cleanup
onUnmounted(() => {
  if (isListening.value) {
    stopListening()
  }
  if (synth) {
    synth.dispose()
  }
})

// Note Options
const noteOptions = computed(() => {
  return pitchDetector.getAllNotesInRange('A3', 'G5').map(note => ({
    label: `${note.name} (${note.frequency.toFixed(1)} Hz)`,
    value: note.name
  }))
})

// Detector Options
const detectorOptions = [
  { label: 'YIN Algorithm', value: 'yin' },
  { label: 'AMDF Algorithm', value: 'amdf' }
]

// Computed
const targetPitch = computed(() => {
  return Note.freq(targetNote.value) || 261.63
})

const targetMidi = computed(() => {
  return Midi.toMidi(targetNote.value) || 60
})

const deviationCent = computed(() => {
  if (!currentPitch.value || !currentPitch.value.centsExact) return 0
  return currentPitch.value.centsExact
})

const progressValue = computed(() => {
  const absDev = Math.abs(deviationCent.value)
  return Math.min(absDev / 100, 1)
})

const deviationColor = computed(() => {
  const absDev = Math.abs(deviationCent.value)
  if (absDev < successThreshold.value) return 'positive'
  if (absDev < successThreshold.value * 2) return 'warning'
  return 'negative'
})

const deviationIcon = computed(() => {
  if (Math.abs(deviationCent.value) < successThreshold.value) return 'check'
  return deviationCent.value > 0 ? 'arrow_upward' : 'arrow_downward'
})

const currentAttempt = computed(() => {
  if (!currentPitch.value || !startTime.value) return null
  
  return {
    targetNote: targetNote.value,
    targetPitch: targetPitch.value,
    achievedPitch: currentPitch.value.frequency,
    noteDetected: currentPitch.value.note,
    deviationHz: currentPitch.value.frequency - targetPitch.value,
    deviationCent: deviationCent.value,
    timeToHitMs: timer.value,
    success: Math.abs(deviationCent.value) < successThreshold.value,
    confidence: currentPitch.value.confidence
  }
})

// Methods
async function playTargetNote() {
  if (!synth || isPlayingNote.value) return
  
  try {
    isPlayingNote.value = true
    
    // Start Tone.js context if not started
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    // Play the note for 2 seconds
    synth.triggerAttackRelease(targetNote.value, '2n')
    
    Notify.create({
      message: `Playing ${targetNote.value}`,
      color: 'positive',
      icon: 'volume_up',
      position: 'top',
      timeout: 2000
    })
    
    // Reset playing state after note finishes
    setTimeout(() => {
      isPlayingNote.value = false
    }, 2000)
    
  } catch (error) {
    console.error('Error playing note:', error)
    isPlayingNote.value = false
    Notify.create({
      message: 'Error playing note',
      color: 'negative',
      icon: 'error'
    })
  }
}

function applyCustomNote() {
  const upperNote = customNote.value.toUpperCase().trim()
  
  // Validate note format (e.g., C4, D#4, Eb5)
  const noteRegex = /^[A-G][#b]?\d$/
  
  if (noteRegex.test(upperNote)) {
    targetNote.value = upperNote
    Notify.create({
      message: `Target note set to ${upperNote}`,
      color: 'positive',
      icon: 'check'
    })
  } else {
    Notify.create({
      message: 'Invalid note format. Please use format like C4, D#4, Eb5',
      color: 'negative',
      icon: 'error'
    })
  }
}

function selectRandomNote() {
  const notes = noteOptions.value
  const randomIndex = Math.floor(Math.random() * notes.length)
  targetNote.value = notes[randomIndex].value
  customNote.value = notes[randomIndex].value
  
  Notify.create({
    message: `Random note: ${targetNote.value}`,
    color: 'info',
    icon: 'casino'
  })
}

async function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    await startListening()
  }
}

async function startListening() {
  try {
    isInitializing.value = true
    
    // Pitch Detector initialisieren
    await pitchDetector.initialize()
    pitchDetector.setDetector(detectorType.value)
    
    // Pitch Detection starten
    pitchDetector.startDetection((pitchData) => {
      currentPitch.value = pitchData
      
      // Auto-save bei Erfolg
      if (autoSave.value && Math.abs(pitchData.centsExact) < successThreshold.value) {
        if (timer.value > 1000) { // Mindestens 1 Sekunde
          saveAttempt()
        }
      }
    })
    
    // Timer starten
    startTime.value = Date.now()
    timerInterval.value = setInterval(() => {
      timer.value = Date.now() - startTime.value
    }, 100)
    
    isListening.value = true
    isInitializing.value = false
    
    Notify.create({
      message: 'Microphone active - Start singing!',
      color: 'positive',
      icon: 'mic'
    })
    
  } catch (error) {
    console.error('Failed to start listening:', error)
    Notify.create({
      message: 'Could not access microphone. Please check permissions.',
      color: 'negative',
      icon: 'error'
    })
    isInitializing.value = false
  }
}

function stopListening() {
  if (pitchDetector) {
    pitchDetector.stop()
  }
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  isListening.value = false
  
  Notify.create({
    message: 'Microphone stopped',
    color: 'info',
    icon: 'stop'
  })
}

function saveAttempt() {
  if (!currentAttempt.value) {
    Notify.create({
      message: 'No pitch detected to save',
      color: 'warning',
      icon: 'warning'
    })
    return
  }
  
  const attempt = attemptsStore.addAttempt(currentAttempt.value)
  
  // Erfolgsmeldung
  if (attempt.success) {
    Notify.create({
      message: '🎉 Perfect! Attempt saved successfully.',
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
  } else {
    Notify.create({
      message: 'Attempt saved. Keep practicing!',
      color: 'info',
      icon: 'save',
      position: 'top'
    })
  }
  
  // Reset für nächsten Versuch
  clearAttempt()
}

function clearAttempt() {
  currentPitch.value = null
  timer.value = 0
  startTime.value = 0
}

function updateUserName(name) {
  attemptsStore.updateUserProfile({ name })
}
</script>

<style scoped>
.pitch-detector {
  max-width: 600px;
  margin: 0 auto;
}

.target-display {
  border: 2px solid #2196f3;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.current-pitch-card {
  border: 2px solid #e0e0e0;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.note-display {
  transition: all 0.3s ease;
}

.controls-section .q-btn {
  height: 48px;
}

.settings-section {
  transition: all 0.3s ease;
}
</style>