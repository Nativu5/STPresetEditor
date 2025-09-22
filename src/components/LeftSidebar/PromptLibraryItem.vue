<template>
  <div
    :data-id="prompt.id"
    class="relative mb-2 flex cursor-pointer items-center justify-between rounded-md border p-2 shadow-sm transition-colors duration-150"
    :class="{
      'border-blue-300 bg-blue-50': isSelectedInLibrary,
      'border-gray-200 bg-white hover:bg-gray-50': !isSelectedInLibrary,
    }"
    @click="handleClick"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex flex-grow items-center">
      <input
        v-if="store.isMultiSelectActive"
        type="checkbox"
        :checked="isSelectedInLibrary"
        class="mr-3 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        @click.stop
        @change="toggleSelection"
      />
      <!-- 状态指示按钮 -->
      <button
        :title="isInOrder ? store.t('promptLibraryItem.removeFromEditor') : store.t('promptLibraryItem.addToEditor')"
        class="mr-3 rounded-full p-1 transition-all duration-200 flex-shrink-0"
        :class="{
          'bg-green-100 hover:bg-green-200': isInOrder,
          'hover:bg-gray-200': !isInOrder
        }"
        @click.stop="addOrNavigate"
      >
        <CheckCircleIcon v-if="isInOrder" class="h-5 w-5 text-green-600" />
        <PlusCircleIcon v-else class="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </button>
      <div class="flex-grow min-w-0">
        <p 
          class="text-sm font-semibold truncate" 
          :title="prompt.name"
        >
          {{ prompt.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const isSelectedInLibrary = computed(() => {
  return store.selectedLibraryPrompts.includes(props.prompt.id);
});

const isInOrder = computed(() => {
  return store.isPromptInOrder(props.prompt.id);
});

const handleClick = () => {
  if (store.isMultiSelectActive) {
    // Multi-select mode: toggle selection via main area click
    toggleSelection();
  } else {
    // Single-select mode: navigate to prompt in editor
    store.navigateToPrompt(props.prompt.id);
  }
};

const addOrNavigate = () => {
  if (isInOrder.value) {
    // If prompt is already in editor, remove it (uncheck)
    store.hidePrompt(props.prompt.id);
  } else {
    // Otherwise add it to the editor
    store.addPromptToOrder(props.prompt.id);
  }
};

const toggleSelection = () => {
  store.toggleLibrarySelection(props.prompt.id);
};

// Drag from library to editor
const onDragStart = (event) => {
  event.dataTransfer.setData('text/plain', props.prompt.id);
  // Mark source for drop target to optionally use
  try {
    event.dataTransfer.setData('application/x-stpe-source', 'library');
  } catch (e) {}
  event.dataTransfer.effectAllowed = 'copyMove';
};

const onDragEnd = () => {
  // No-op for now
};
</script>