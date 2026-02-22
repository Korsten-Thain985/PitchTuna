import { YIN, AMDF } from 'pitchfinder'

class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.detector = null
    this.currentDetector = 'yin'
    this.options = {}
    this.port.onmessage = (event) => {
      const { type, detectorName, options } = event.data
      if (type === 'setDetector') {
        this.setDetector(detectorName, options)
      }
    }
  }

  process(inputs, outputs) {
    const input = inputs[0][0]
    if (input && this.detector) {
      const frequency = this.detector(input)
      if (frequency && frequency >= this.options.minFrequency && frequency <= this.options.maxFrequency) {
        this.port.postMessage({ frequency })
      }
    }
    return true
  }

  setDetector(detectorName, options) {
    this.currentDetector = detectorName
    this.options = options
    if (detectorName === 'yin') {
      this.detector = YIN({
        minFrequency: options.minFrequency,
        maxFrequency: options.maxFrequency,
        probabilityThreshold: options.probabilityThreshold,
        sampleRate: options.sampleRate
      })
    } else if (detectorName === 'amdf') {
      this.detector = AMDF({
        minFrequency: options.minFrequency,
        maxFrequency: options.maxFrequency,
        sampleRate: options.sampleRate
      })
    }
  }
}

registerProcessor('pitch-processor', PitchProcessor)