<template>
  <div class="attempts-table">
    <!-- Tabelle nur anzeigen, wenn attempts vorhanden sind -->
    <div v-if="attempts.length > 0">
      <q-table
        :rows="displayedAttempts"
        :columns="columns"
        row-key="attemptId"
        flat
        bordered
        dense
        hide-pagination
        :pagination="{ rowsPerPage: limit || 50 }"
      >
        <template v-slot:body-cell-success="props">
          <q-td :props="props">
            <q-badge 
              :color="props.row.success ? 'positive' : 'negative'"
              :label="props.row.success ? 'Success' : 'Miss'"
            />
          </q-td>
        </template>
        
        <template v-slot:body-cell-deviationCent="props">
          <q-td :props="props">
            <div :class="getDeviationClass(props.row.deviationCent)">
              {{ props.row.deviationCent > 0 ? '+' : '' }}{{ props.row.deviationCent.toFixed(1) }}¢
            </div>
          </q-td>
        </template>
        
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              icon="delete"
              size="sm"
              flat
              dense
              color="negative"
              @click="deleteAttempt(props.row.attemptId)"
            />
          </q-td>
        </template>
      </q-table>
      
      <!-- "View All" Button entfernen, da wir bereits alle anzeigen -->
    </div>
    
    <!-- Leerer State -->
    <div v-else class="empty-state text-center q-pa-lg">
      <q-icon name="history" size="60px" color="grey-4" class="q-mb-md" />
      <div class="text-h6">No attempts yet</div>
      <div class="text-caption text-grey-7">Your attempts will appear here</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAttemptsServerStore } from '@/stores/attemptsServer'

const props = defineProps({
  limit: {
    type: Number,
    default: 0 // 0 means no limit
  }
})

const store = useAttemptsServerStore()

onMounted(() => {
  if (!store.attempts || store.attempts.length === 0) {
    store.fetchAll().catch(() => {})
  }
})

// Direkt auf store.attempts zugreifen
const attempts = computed(() => store.attempts)

const displayedAttempts = computed(() => {
  if (props.limit > 0) {
    return attempts.value.slice(0, props.limit)
  }
  return attempts.value
})

const columns = [
  {
    name: 'attemptId',
    label: 'Attempt ID',
    field: 'attemptId',
    align: 'left',
    sortable: true
  },
  {
    name: 'userID',
    label: 'User ID',
    field: 'userID',
    align: 'left',
    sortable: true
  },
  {
    name: 'targetNote',
    label: 'Note',
    field: 'targetNote',
    align: 'left',
    sortable: true
  },
  {
    name: 'deviationCent',
    label: 'Deviation',
    field: 'deviationCent',
    align: 'center',
    sortable: true
  },
  {
    name: 'timeToHitMs',
    label: 'Time',
    field: row => (row.timeToHitMs / 1000).toFixed(1) + 's',
    align: 'center',
    sortable: true
  },
  {
    name: 'success',
    label: 'Result',
    field: 'success',
    align: 'center'
  },
  {
    name: 'timestamp',
    label: 'Date',
    field: row => new Date(row.timestamp).toLocaleDateString(),
    align: 'right',
    sortable: true
  },
  {
    name: 'actions',
    label: '',
    align: 'right'
  }
]

function getDeviationClass(value) {
  const absValue = Math.abs(value)
  if (absValue < 10) return 'text-positive text-weight-bold'
  if (absValue < 25) return 'text-warning text-weight-bold'
  return 'text-negative text-weight-bold'
}

function deleteAttempt(id) {
  store.deleteAttempt(id).catch(() => {})
}
</script>

<style scoped>
.attempts-table {
  min-height: 200px;
}

.text-lemon {
  font-family: 'LemonMilk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.empty-state {
  opacity: 0.7;
}
</style>