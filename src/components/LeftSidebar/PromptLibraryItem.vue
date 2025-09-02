<template>
  <div
    :data-id="prompt.id"
    class="relative mb-2 flex cursor-pointer items-center justify-between rounded-md border p-2 shadow-sm transition-colors duration-150"
    :class="{
      'border-blue-300 bg-blue-50': isSelectedInLibrary,
      'border-gray-200 bg-white hover:bg-gray-50': !isSelectedInLibrary,
    }"
    @click="handleClick"
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
      <!-- 拖拽手柄 -->
      <div class="drag-handle mr-2 cursor-grab active:cursor-grabbing">
        <Bars3Icon class="h-4 w-4 text-gray-400" />
      </div>
      <div class="flex-grow">
        <p class="text-sm font-semibold">
          {{ prompt.name }}
        </p>
        <p class="font-mono text-xs text-gray-500">
          {{ prompt.id }}
        </p>
      </div>
    </div>

    <div class="ml-2 flex-shrink-0">
      <button
        :title="isInOrder ? store.t('promptLibraryItem.removeFromEditor') : store.t('promptLibraryItem.addToEditor')"
        class="rounded-full p-1 transition-colors hover:bg-gray-200"
        @click.stop="addOrNavigate"
      >
        <CheckCircleIcon v-if="isInOrder" class="h-6 w-6 text-green-500 hover:text-red-500" />
        <PlusCircleIcon v-else class="h-6 w-6 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Bars3Icon } from '@heroicons/vue/24/outline';
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
    store.hidePrompt(props.prompt.id);
  } else {
    store.addPromptToOrder(props.prompt.id);
  }
};

const toggleSelection = () => {
  store.toggleLibrarySelection(props.prompt.id);
};
</script>