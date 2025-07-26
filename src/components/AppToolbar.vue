<template>
  <div class="flex w-full items-center justify-between">
    <h1 class="text-xl font-bold text-gray-800">📝 SillyTavern Preset Editor</h1>
    <div class="flex items-center space-x-3">
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        @click="$emit('open-import')"
      >
        <ArrowDownTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        Import
      </button>
      <button
        class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        @click="$emit('open-export')"
      >
        <ArrowUpTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        Export
      </button>
      <button
        class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        @click="resetToDefault"
      >
        <ArrowPathIcon class="mr-2 -ml-1 h-5 w-5" />
        Reset to Default
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePresetStore } from '../stores/presetStore';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/vue/20/solid';

defineEmits(['open-import', 'open-export']);

const store = usePresetStore();

const resetToDefault = () => {
  if (
    window.confirm(
      'Are you sure you want to reset all data and return to the factory default? This will permanently delete all your changes and cannot be undone.',
    )
  ) {
    store.resetToFactoryDefault();
  }
};
</script>
