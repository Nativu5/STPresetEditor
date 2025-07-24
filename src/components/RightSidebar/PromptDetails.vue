<template>
  <div v-if="prompt" class="space-y-4">
    <div>
      <label for="prompt-name" class="block text-sm font-medium text-gray-700">Name</label>
      <input 
        type="text" 
        id="prompt-name"
        :value="prompt.name" 
        @input="updateDetail('name', $event.target.value)"
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
      >
    </div>
    <div>
      <label for="prompt-id" class="block text-sm font-medium text-gray-700">Identifier</label>
      <input 
        type="text" 
        id="prompt-id"
        :value="prompt.identifier" 
        readonly 
        class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
      >
    </div>
    <div>
      <label for="prompt-content" class="block text-sm font-medium text-gray-700">Content</label>
      <textarea 
        id="prompt-content"
        :value="prompt.content" 
        @input="updateDetail('content', $event.target.value)"
        rows="15" 
        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono transition"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const updateDetail = (field, value) => {
    store.updatePromptDetail({
        promptId: props.prompt.id,
        field,
        value
    });
};

</script>