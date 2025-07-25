<template>
  <div class="flex items-center justify-between w-full">
    <h1 class="text-xl font-bold text-gray-800">📝 SillyTavern Preset Editor</h1>
    <div class="flex items-center space-x-3">
      <button
        @click="$emit('open-import')"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <ArrowDownTrayIcon class="-ml-1 mr-2 h-5 w-5" />
        Import
      </button>
      <button
        @click="$emit('open-export')"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        <ArrowUpTrayIcon class="-ml-1 mr-2 h-5 w-5" />
        Export
      </button>
      <button
        @click="resetState"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
      >
        <ArrowPathIcon class="-ml-1 mr-2 h-5 w-5" />
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePresetStore } from '../stores/presetStore';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/vue/20/solid';

defineEmits(['open-import', 'open-export']);

const store = usePresetStore();

const resetState = () => {
  if (confirm('Are you sure you want to reset all changes to the original state?')) {
    store.resetState();
  }
};
</script>
