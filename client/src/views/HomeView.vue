<template>
  <q-page class="home-view">
    <!-- Main Content -->
    <div class="content-section q-pa-lg">
      <div class="container"> 

        <q-slide-transition>
          <q-card v-if="!hasAttempts" class="welcome-card q-mb-xl">
            <q-card-section>
              <div class="row items-center">
                <div class="col-auto">
                  <q-avatar color="primary" text-color="white" icon="waving_hand" />
                </div>
                <div class="col">
                  <div class="text-h6">Welcome to Pitch Perfect Pro!</div>
                  <div class="text-caption">
                    Start by selecting a target note and clicking "Start Listening"
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-slide-transition>
      </div>
      </div>

        <div class="row justify-center">
          <div class="col-12 col-lg-7">
            <div class="section-header q-mb-md" id="training-section">
              <div class="text-lemon text-h4 text-weight-bold"> Live Pitch Training</div>
              <div class="text-subtitle1 text-grey-7">
                Verwende dein Microphon um dich einzustimmen
              </div>
            </div>
            
            <PitchDetector ref="pitchDetector" />
          </div>
        </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAttemptsServerStore } from '@/stores/attemptsServer'
import PitchDetector from '@/components/PitchDetector.vue'

const $q = useQuasar()
const attemptsStore = useAttemptsServerStore()
const pitchDetector = ref(null)

// Computed Properties
const hasAttempts = computed(() => attemptsStore.attempts.length > 0)

// Methods
function scrollToTraining() {
  const element = document.getElementById('training-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function testRandomNote() {
  if (pitchDetector.value && pitchDetector.value.selectRandomNote) {
    pitchDetector.value.selectRandomNote()
    scrollToTraining()
    
    // Notification
    $q.notify({
      message: 'Random note selected!',
      color: 'positive',
      icon: 'shuffle',
      position: 'top'
    })
  }
}

// Lifecycle
onMounted(() => {
  // Check for PWA installation
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running as PWA')
  }
  
  // Show welcome message for first-time users
  if (!hasAttempts.value) {
    setTimeout(() => {
      $q.notify({
        message: 'Welcome! Select a note and click "Start Listening" to begin.',
        color: 'info',
        icon: 'info',
        position: 'top',
        timeout: 5000
      })
    }, 1000)
  }
    // load latest attempts from server
    attemptsStore.fetchAll().catch(() => {})
})
</script>
<style scoped>
.text-lemon {
  font-family: 'LemonMilk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}


</style>