<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <h2 class="text-xl font-bold mb-4">Import JSON</h2>
      <p class="text-sm text-gray-600 mb-4">Paste the content of your preset.json file below.</p>
      <textarea 
        v-model="jsonInput"
        class="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-sm"
        placeholder='{
  "prompts": [...],
  "prompt_order": [...]
}'
      ></textarea>
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
        <button @click="importJson" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Import</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close', 'import']);
const jsonInput = ref('');

const importJson = () => {
  emit('import', jsonInput.value);
  emit('close');
};
</script>
