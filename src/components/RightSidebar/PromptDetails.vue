<template>
  <div v-if="prompt" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Name</label>
      <input type="text" :value="prompt.name" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Identifier</label>
      <input type="text" :value="prompt.identifier" readonly class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Content</label>
      <textarea :value="prompt.content" rows="10" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
    </div>
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
