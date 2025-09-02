<template>
  <div class="flex h-full flex-col">
    <!-- Library Toolbar -->
    <div class="mb-2 flex flex-shrink-0 items-center justify-between">
      <h2 class="text-lg font-semibold">{{ store.t('promptLibrary.title') }}</h2>
      <div class="flex items-center space-x-1">
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          :title="store.t('promptLibrary.newPrompt')"
          @click="store.createNewPrompt()"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          :class="{ 'bg-blue-100 text-blue-600': store.isMultiSelectActive }"
          :title="store.t('promptLibrary.multiSelect')"
          @click="store.toggleMultiSelect()"
        >
          <ClipboardDocumentCheckIcon class="h-5 w-5" />
        </button>
        <button
          :disabled="store.selectedLibraryPrompts.size === 0"
          class="rounded-full p-2 text-gray-500 transition-colors"
          :class="{
            'hover:bg-red-500 hover:text-white': store.selectedLibraryPrompts.size > 0,
            'cursor-not-allowed opacity-50': store.selectedLibraryPrompts.size === 0,
          }"
          :title="store.t('promptLibrary.deleteSelected')"
          @click="store.deleteSelectedPrompts()"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Search Box -->
    <div class="relative mb-4 flex-shrink-0">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        :value="store.librarySearchTerm"
        class="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-gray-300 transition ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-inset sm:text-sm sm:leading-6"
        :placeholder="store.t('promptLibrary.searchPlaceholder')"
        @input="onSearch"
      />
    </div>

    <!-- Prompt List -->
    <div class="overflow-y-auto">
      <draggable 
        v-model="libraryPrompts" 
        tag="div" 
        item-key="id" 
        class="space-y-2"
        group="prompts"
        :sort="false"
        :pull="true"
        :put="false"
        handle=".drag-handle"
      >
        <template #item="{ element }">
          <PromptLibraryItem :prompt="element" />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import {
    ClipboardDocumentCheckIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/vue/24/outline';
import { debounce } from 'lodash-es';
import { computed } from 'vue';
import draggable from 'vuedraggable';
import { usePresetStore } from '../../stores/presetStore';
import PromptLibraryItem from './PromptLibraryItem.vue';

const store = usePresetStore();
const prompts = computed(() => store.libraryPrompts);

// 为拖拽创建可写的计算属性
const libraryPrompts = computed({
  get() {
    return store.libraryPrompts;
  },
  set(newPrompts) {
    // 左侧库不需要排序，所以这里不需要更新store
    // 拖拽到右侧时会通过EditorView的draggable处理
  }
});

// Use lodash-es for a more robust and consistent debounce implementation
const onSearch = debounce((event) => {
  store.setLibrarySearch(event.target.value);
}, 500); // 500ms debounce delay as requested
</script>
