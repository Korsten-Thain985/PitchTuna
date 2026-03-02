<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-toolbar-title class="text-lemon">
         <q-avatar size="32px" class="q-mr-sm">
      <img src="/PitchTuna.png">
    </q-avatar>
          PitchTuna</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="left" bordered>
      <q-list>
        <q-item v-ripple to="/" exact clickable>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item v-ripple to="/about" exact clickable>
          <q-item-section avatar><q-icon name="info" /></q-item-section>
          <q-item-section>About</q-item-section>
        </q-item>
        <q-item v-ripple to="/attempts" exact clickable>
          <q-item-section avatar><q-icon name="history" /></q-item-section>
          <q-item-section>Attempts</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="page-content q-pa-md">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
const left = ref(false)
</script>

<style scoped>
.text-lemon {
  font-family: 'LemonMilk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Container für bessere Strukturierung */
.page-content {
  max-width: 1200rem;
  margin: 0 auto;
  width: 100%;
}

/* Responsive: auf kleineren Bildschirmen volle Breite */
@media (max-width: 768rem) {
  .page-content {
    max-width: 100%;
  }
}
</style>