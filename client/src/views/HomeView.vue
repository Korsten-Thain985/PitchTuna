<template>
  <q-page class="home-view">
    <!-- Main Content -->
    <div class="content-section q-pa-lg">
      <div class="container"> 
        <!-- Welcome Card for First-Time Users -->
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
        <!-- Two Column Layout -->
        <div class="row q-col-gutter-xl">
          <!-- Left Column: Pitch Detector -->
          <div class="col-12 col-lg-7">
            <div class="section-header q-mb-md" id="training-section">
              <div class="text-lemon text-h4 text-weight-bold"> Live Pitch Training</div>
              <div class="text-subtitle1 text-grey-7">
                Verwende dein Microphon um dich einzustimmen
              </div>
            </div>
            
            <PitchDetector ref="pitchDetector" />
          </div>

          <!-- Right Column: Stats & Table -->
          <div class="col-12 col-lg-5">
            <!-- Quick Stats -->
            <q-card class="quick-stats-card q-mb-lg">
              <q-card-section>
                <div class="text-h6 q-mb-md">Deine Versuche </div>
                
                <template v-if="hasAttempts">
                  <div class="row q-col-gutter-md">
                    <div v-for="stat in quickStats" :key="stat.label" class="col-6">
                      <q-card flat class="stat-item">
                        <q-card-section class="text-center q-pa-sm">
                          <div class="text-h5 text-weight-bold" :class="stat.color">
                            {{ stat.value }}
                          </div>
                          <div class="text-caption text-grey-7">{{ stat.label }}</div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                  
                  <!-- Progress Chart -->
                  <div class="q-mt-md">
                    <div class="text-subtitle2 q-mb-sm">Success Rate Trend</div>
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar" 
                        :style="{ width: `${attemptsStore.stats?.successRate || 0}%` }"
                      ></div>
                    </div>
                    <div class="row justify-between text-caption text-grey-7 q-mt-xs">
                      <div>0%</div>
                      <div>Success Rate</div>
                      <div>100%</div>
                    </div>
                  </div>
                </template>
                
                <template v-else>
                  <div class="text-center q-pa-lg">
                    <q-icon name="insights" size="60px" color="grey-4" />
                    <div class="text-h6 q-mt-md">No data yet</div>
                    <div class="text-caption">Complete your first attempt to see stats</div>
                  </div>
                </template>
              </q-card-section>
            </q-card>

            <!-- Recent Attempts -->
            <q-card class="recent-attempts-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-h6">letzte Versuche</div>
                  <q-badge color="primary" :label="`${attemptsStore.attempts.length} total`" />
                </div>
                
                <AttemptsTable v-if="hasAttempts" :limit="5" />
                
                <div v-else class="text-center q-pa-lg">
                  <q-icon name="history" size="60px" color="grey-4" />
                  <div class="text-h6 q-mt-md">No attempts yet</div>
                  <div class="text-caption q-mb-md">Your practice history will appear here</div>
                  <q-btn
                    color="primary"
                    label="Start Training"
                    @click="scrollToTraining"
                    outline
                  />
                </div>
              </q-card-section>
            </q-card>

            
        <div class="quick-actions q-mt-xl text-center">
          <div class="text-h5 q-mb-md">Ready to improve your pitch?</div>
          <div class="row justify-center q-col-gutter-md">
            <div class="col-auto">
              <q-btn
                color="primary"
                label="Start Training"
                icon="mic"
                size="lg"
                @click="scrollToTraining"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAttemptsStore } from '@/stores/attempts'
import PitchDetector from '@/components/PitchDetector.vue'
import AttemptsTable from '@/components/AttemptsTable.vue'

const $q = useQuasar()
const attemptsStore = useAttemptsStore()
const pitchDetector = ref(null)

// Computed Properties
const hasAttempts = computed(() => attemptsStore.attempts.length > 0)

const quickStats = computed(() => {
  if (!attemptsStore.stats) return []
  
  return [
    {
      label: 'Success Rate',
      value: `${attemptsStore.stats.successRate}%`,
      color: attemptsStore.stats.successRate > 70 ? 'text-positive' : 
             attemptsStore.stats.successRate > 40 ? 'text-warning' : 'text-negative'
    },
    {
      label: 'Avg ±Cents',
      value: attemptsStore.stats.avgDeviationCent.toFixed(1),
      color: attemptsStore.stats.avgDeviationCent < 15 ? 'text-positive' : 
             attemptsStore.stats.avgDeviationCent < 30 ? 'text-warning' : 'text-negative'
    },
    {
      label: 'Total Attempts',
      value: attemptsStore.stats.totalAttempts.toString(),
      color: 'text-primary'
    },
    {
      label: 'Today',
      value: attemptsStore.stats.todayAttempts.toString(),
      color: 'text-secondary'
    }
  ]
})

// Methods
function scrollToTraining() {
  const element = document.getElementById('training-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function scrollToStats() {
  const element = document.querySelector('.quick-stats-card')
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

function shareApp() {
  if (navigator.share) {
    navigator.share({
      title: 'Pitch Perfect Pro',
      text: 'Check out this awesome pitch training app!',
      url: window.location.href
    })
  } else {
    $q.notify({
      message: 'Copy this URL to share: ' + window.location.href,
      color: 'info',
      timeout: 3000
    })
    navigator.clipboard.writeText(window.location.href)
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
})
</script>
<style scoped>
.text-lemon {
  font-family: 'LemonMilk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}


</style>