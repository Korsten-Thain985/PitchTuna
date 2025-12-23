<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-toolbar-title class="text-lemon">PitchTuna</q-toolbar-title>
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
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
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
</style>