<template>
  <div class="flex items-center space-x-2">
    <h1 class="text-xl font-bold mr-6">Tavern Preset Editor</h1>
    <button @click="$emit('open-import')" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
      Import JSON
    </button>
    <button @click="$emit('open-export')" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
      Export JSON
    </button>
    <button @click="resetState" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
      Reset
    </button>
  </div>
</template>

<script setup>
import { usePresetStore } from '../stores/presetStore';

const emit = defineEmits(['open-import', 'open-export']);

const store = usePresetStore();

const resetState = () => {
  if (confirm('Are you sure you want to reset all changes to the original state?')) {
    store.resetState();
  }
};
</script>