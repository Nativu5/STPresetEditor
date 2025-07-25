<template>
  <div
    @click="handleClick"
    class="p-2 mb-2 rounded-md shadow-sm border flex items-center justify-between cursor-pointer transition-colors duration-150 relative"
    :class="{
      'bg-blue-50 border-blue-300': isSelectedInLibrary,
      'bg-white border-gray-200 hover:bg-gray-50': !isSelectedInLibrary,
    }"
  >
    <div class="flex items-center flex-grow">
      <input
        v-if="store.isMultiSelectActive"
        type="checkbox"
        :checked="isSelectedInLibrary"
        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 flex-shrink-0"
        @click.stop
        @change="toggleSelection"
      />
      <div class="flex-grow">
        <p class="font-semibold text-sm">{{ prompt.name }}</p>
        <p class="text-xs text-gray-500 font-mono">{{ prompt.id }}</p>
      </div>
    </div>

    <div class="flex-shrink-0 ml-2">
      <button
        @click.stop="addOrNavigate"
        :title="isInOrder ? 'Prompt is already in the editor' : 'Add prompt to editor'"
        class="p-1 rounded-full hover:bg-gray-200 transition-colors"
        :disabled="isInOrder"
      >
        <CheckCircleIcon v-if="isInOrder" class="h-6 w-6 text-green-500" />
        <PlusCircleIcon v-else class="h-6 w-6 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const isSelectedInLibrary = computed(() => {
  return store.selectedLibraryPrompts.has(props.prompt.id);
});

const isInOrder = computed(() => {
  return store.isPromptInOrder(props.prompt.id);
});

const handleClick = () => {
  if (store.isMultiSelectActive) {
    toggleSelection();
  } else {
    // In single-select mode, clicking the main body still navigates
    store.navigateToPrompt(props.prompt.id);
  }
};

const addOrNavigate = () => {
  if (isInOrder.value) {
    store.navigateToPrompt(props.prompt.id);
  } else {
    store.addPromptToOrder(props.prompt.id);
  }
};

const toggleSelection = () => {
  store.toggleLibrarySelection(props.prompt.id);
};
</script>
