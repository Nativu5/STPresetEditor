<template>
  <div v-if="prompt" class="space-y-4">
    <div>
      <label for="prompt-name" class="block text-sm font-medium text-gray-700">Name</label>
      <input
        id="prompt-name"
        type="text"
        :value="prompt.name"
        class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
        @input="updateDetail('name', $event.target.value)"
      />
    </div>
    <div>
      <label for="prompt-id" class="block text-sm font-medium text-gray-700">Identifier</label>
      <input
        id="prompt-id"
        type="text"
        :value="prompt.identifier"
        readonly
        class="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm"
      />
    </div>
    <div>
      <label for="prompt-content" class="block text-sm font-medium text-gray-700">Content</label>
      <textarea
        id="prompt-content"
        :value="prompt.content"
        rows="15"
        class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
        @input="updateDetail('content', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
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
    value,
  });
};
</script>
