<script setup lang="ts">
defineProps<{
  cards: Array<{
    label: string
    value: number
    note: string
    valueClass?: string
  }>
  columns?: string
}>()
</script>

<template>
  <div class="grid gap-4" :class="columns ?? 'lg:grid-cols-3'">
    <div v-for="card in cards" :key="card.label" class="erp-stat-card">
      <div class="erp-stat-label">{{ card.label }}</div>
      <div class="erp-stat-value" :class="card.valueClass">{{ card.value }}</div>
      <div class="erp-stat-note">{{ card.note }}</div>
    </div>
  </div>
</template>
