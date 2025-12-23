<template>
  <div class="simple-attempts-table">
    <div v-if="store.attempts.length === 0" class="empty-state">
      <q-icon name="history" size="50px" color="grey-4" class="q-mb-md" />
      <div class="text-h6">No attempts yet</div>
      <div class="text-caption text-grey-7">Your attempts will appear here</div>
    </div>
    
    <div v-else>
      <!-- Letzte 5 Versuche anzeigen -->
      <div class="attempts-list">
        <div v-for="attempt in recentAttempts" :key="attempt.attemptId" class="attempt-item q-pa-sm">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="row items-center">
                <q-icon 
                  :name="attempt.success ? 'check_circle' : 'cancel'"
                  :color="attempt.success ? 'positive' : 'negative'"
                  size="sm"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-weight-bold">{{ attempt.targetNote }}</div>
                  <div class="text-caption text-grey-7">
                    {{ (attempt.timeToHitMs / 1000).toFixed(1) }}s • 
                    {{ attempt.deviationCent > 0 ? '+' : '' }}{{ attempt.deviationCent.toFixed(1) }}¢
                  </div>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <q-badge :color="getDeviationColor(attempt.deviationCent)">
                {{ attempt.success ? 'Success' : 'Miss' }}
              </q-badge>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center q-mt-md">
        <q-btn
          color="primary"
          label="View All"
          @click="$router.push({ name: 'home' })"
          flat
          dense
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAttemptsStore } from '@/stores/attempts'

const store = useAttemptsStore()

// Letzte 5 Versuche
const recentAttempts = computed(() => {
  return store.attempts.slice(0, 5)
})

function getDeviationColor(value) {
  const absValue = Math.abs(value)
  if (absValue < 10) return 'positive'
  if (absValue < 25) return 'warning'
  return 'negative'
}
</script>

<style scoped>
.simple-attempts-table {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.attempts-list {
  max-height: 300px;
  overflow-y: auto;
}

.attempt-item {
  border-bottom: 1px solid #e0e0e0;
}

.attempt-item:last-child {
  border-bottom: none;
}

.attempt-item:hover {
  background-color: #f5f5f5;
}
</style>