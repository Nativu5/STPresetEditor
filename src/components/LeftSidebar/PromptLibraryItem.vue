<template>
  <div 
    @click="handleClick"
    class="p-2 mb-2 rounded-md shadow-sm border flex items-center cursor-pointer transition-colors duration-150"
    :class="{
      'bg-blue-50 border-blue-300': isSelected,
      'bg-white border-gray-200 hover:bg-gray-50': !isSelected
    }"
  >
    <input 
      v-if="store.isMultiSelectActive"
      type="checkbox"
      :checked="isSelected"
      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
      @click.stop
      @change="toggleSelection"
    />
    <div class="flex-grow">
      <p class="font-semibold text-sm">{{ prompt.name }}</p>
      <p class="text-xs text-gray-500 font-mono">{{ prompt.id }}</p>
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

const isSelected = computed(() => {
  return store.selectedLibraryPrompts.has(props.prompt.id);
});

const handleClick = () => {
  if (store.isMultiSelectActive) {
    toggleSelection();
  } else {
    store.navigateToPrompt(props.prompt.id);
  }
};

const toggleSelection = () => {
  store.toggleLibrarySelection(props.prompt.id);
};

</script>