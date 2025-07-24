<template>
  <div class="p-2 mb-2 bg-white rounded-md shadow-sm border border-gray-200">
    <p class="font-semibold text-sm">{{ prompt.name }}</p>
    <p class="text-xs text-gray-500">ID: {{ prompt.identifier }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});
</script>
