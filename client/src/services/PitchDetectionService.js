import { Note, Midi } from '@tonaljs/tonal'
import { YIN, AMDF } from 'pitchfinder'

export class PitchDetectionService {
  constructor(options = {}) {
    this.options = {
      minFrequency: 80,
      maxFrequency: 1000,
      sampleRate: 44100,
      probabilityThreshold: 0.1,
      ...options
    }
    
    // Mehrere Detektoren für bessere Ergebnisse
    this.detectors = {
      yin: YIN({
        minFrequency: this.options.minFrequency,
        maxFrequency: this.options.maxFrequency,
        probabilityThreshold: this.options.probabilityThreshold,
        sampleRate: this.options.sampleRate
      }),
      amdf: AMDF({
        minFrequency: this.options.minFrequency,
        maxFrequency: this.options.maxFrequency,
        sampleRate: this.options.sampleRate
      })
    }
    
    this.audioContext = null
    this.analyser = null
    this.source = null
    this.processor = null  // BACK TO SCRIPTPROCESSOR - more reliable than AudioWorklet
    this.isRunning = false
    this.currentDetector = 'yin'
  }

  async initialize() {
    try {
      // Audio Context erstellen
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.options.sampleRate
      })
      
      // Mikrofon Zugriff
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        }
      })
      
      // Audio Nodes erstellen
      this.source = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      
      // Analyser konfigurieren
      this.analyser.fftSize = 4096
      this.analyser.smoothingTimeConstant = 0.3
      this.analyser.minDecibels = -100
      this.analyser.maxDecibels = -10
      
      // Verbinden
      this.source.connect(this.analyser)
      
      // Script Processor für Echtzeit-Verarbeitung (RELIABLE APPROACH)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
      this.analyser.connect(this.processor)
      this.processor.connect(this.audioContext.destination)
      
      this.isRunning = true
      return true
    } catch (error) {
      console.error('Failed to initialize audio:', error)
      throw error
    }
  }

  startDetection(onPitchDetected) {
    if (!this.processor || !this.isRunning) {
      throw new Error('Service not initialized')
    }
    
    const bufferLength = this.analyser.fftSize
    const timeDomainBuffer = new Float32Array(bufferLength)
    
    this.processor.onaudioprocess = () => {
      // Zeitbereichsdaten abrufen
      this.analyser.getFloatTimeDomainData(timeDomainBuffer)
      
      // Pitch erkennen
      const detector = this.detectors[this.currentDetector]
      const frequency = detector(timeDomainBuffer)
      
      if (frequency && frequency >= this.options.minFrequency && frequency <= this.options.maxFrequency) {
        const pitchData = this.analyzeFrequency(frequency)
        onPitchDetected(pitchData)
      }
    }
  }

  analyzeFrequency(frequency) {
    // MIDI Note berechnen
    const midi = 69 + 12 * Math.log2(frequency / 440)
    const roundedMidi = Math.round(midi)
    const exactMidi = midi
    
    // Note Information
    const detectedNote = Note.fromMidi(roundedMidi)
    const noteInfo = Note.get(detectedNote)
    
    // Cents Abweichung von der genauen Note
    const centsFromExact = 1200 * Math.log2(frequency / noteInfo.freq)
    const centsFromRounded = Math.round(centsFromExact * 10) / 10
    
    // Oktave
    const octave = Math.floor(roundedMidi / 12) - 1
    
    // Note Name mit Oktave
    const fullNoteName = `${noteInfo.letter}${noteInfo.acc}${octave}`
    
    // Frequenz der nächstgelegenen Note
    const closestNoteFreq = Note.freq(fullNoteName)
    
    return {
      frequency,
      midi: roundedMidi,
      exactMidi,
      note: fullNoteName,
      name: noteInfo.name,
      octave,
      cents: centsFromRounded,
      centsExact: centsFromExact,
      frequencyOfNote: closestNoteFreq,
      letter: noteInfo.letter,
      acc: noteInfo.acc,
      isSharp: noteInfo.alt > 0,
      isFlat: noteInfo.alt < 0,
      confidence: this.calculateConfidence(frequency, centsFromRounded)
    }
  }

  calculateConfidence(frequency, cents) {
    // Confidence basierend auf Cents Abweichung und Frequenz-Stabilität
    const centsScore = Math.max(0, 1 - Math.abs(cents) / 50)
    return Math.min(1, centsScore * 0.8 + 0.2) 
  }

  getNoteInfo(noteName) {
    return Note.get(noteName)
  }

  getFrequencyForNote(noteName) {
    return Note.freq(noteName)
  }

  calculateCents(frequency, targetFrequency) {
    if (!frequency || !targetFrequency) return 0
    return 1200 * Math.log2(frequency / targetFrequency)
  }

  getNoteFromFrequency(frequency) {
    return this.analyzeFrequency(frequency)
  }

  getAllNotesInRange(startNote = 'A3', endNote = 'G4') {
    const startMidi = Note.midi(startNote) || 57
    const endMidi = Note.midi(endNote) || 67
    
    const notes = []
    for (let midi = startMidi; midi <= endMidi; midi++) {
      const note = Note.fromMidi(midi)
      const noteInfo = Note.get(note)
      notes.push({
        name: noteInfo.name,
        midi,
        frequency: Note.freq(note),
        octave: Math.floor(midi / 12) - 1
      })
    }
    return notes
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect()
      this.processor.onaudioprocess = null
    }
    if (this.source) {
      this.source.disconnect()
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    this.isRunning = false
  }

  setDetector(detectorName) {
    if (this.detectors[detectorName]) {
      this.currentDetector = detectorName
    }
  }
}

// Singleton Instanz
export const pitchDetector = new PitchDetectionService()