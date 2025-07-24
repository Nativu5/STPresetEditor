<template>
  <div 
    class="p-4 mb-4 rounded-lg shadow border relative"
    @click="selectPrompt"
    :class="[
      isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300',
      prompt.enabled === false ? 'bg-gray-200 border-gray-400' : 'bg-white',
    ]"
  >
    <div class="flex justify-between items-start">
      <div class="cursor-grab flex-grow">
        <h3 
          class="font-bold text-md mb-2"
          :class="{ 'text-gray-500': prompt.enabled === false }"
        >
          {{ prompt.name }}
        </h3>
        <p 
          class="text-sm whitespace-pre-wrap"
          :class="{ 'text-gray-600': prompt.enabled === false }"
        >
          {{ prompt.content }}
        </p>
      </div>
      <div class="flex flex-col space-y-1 ml-2 flex-shrink-0">
        <button @click.stop="toggleEnabled" class="p-1 text-xs text-white rounded" :class="[prompt.enabled === false ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500']">
          {{ prompt.enabled === false ? 'Enable' : 'Disable' }}
        </button>
        <button @click.stop="hidePrompt" class="p-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600">Hide</button>
        <button @click.stop="removePrompt" class="p-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const isSelected = computed(() => store.selectedPromptId === props.prompt.id);

const selectPrompt = () => {
  store.selectPrompt(props.prompt.id);
};

const hidePrompt = () => {
  store.hidePrompt(props.prompt.id);
};

const removePrompt = () => {
  if (confirm(`Are you sure you want to permanently delete "${props.prompt.name}"?`)) {
    store.removePrompt(props.prompt.id);
  }
};

const toggleEnabled = () => {
  store.togglePromptEnabled(props.prompt.id);
};

</script>
