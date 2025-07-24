<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 class="text-xl font-bold mb-4">Export JSON</h2>
      <p class="text-sm text-gray-600 mb-4">This is the generated JSON based on your edits. Click the button to copy it to your clipboard.</p>
      <textarea 
        :value="finalJson"
        readonly
        class="w-full h-64 p-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
      ></textarea>
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
        <button @click="copyToClipboard" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">{{ copyButtonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePresetStore } from '../stores/presetStore';

const emit = defineEmits(['close']);
const store = usePresetStore();

const finalJson = computed(() => store.finalJson);
const copyButtonText = ref('Copy to Clipboard');

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(finalJson.value);
    copyButtonText.value = 'Copied!';
    setTimeout(() => {
      copyButtonText.value = 'Copy to Clipboard';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
    copyButtonText.value = 'Failed to copy';
  }
};
</script>
