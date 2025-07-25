<template>
  <div class="flex h-full flex-col">
    <!-- Library Toolbar -->
    <div class="mb-2 flex flex-shrink-0 items-center justify-between">
      <h2 class="text-lg font-semibold">Prompt Library</h2>
      <div class="flex items-center space-x-1">
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          title="New Prompt"
          @click="store.createNewPrompt()"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          :class="{ 'bg-blue-100 text-blue-600': store.isMultiSelectActive }"
          title="Multi-select"
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
          title="Delete Selected"
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
        placeholder="Search by name or ID..."
        @input="onSearch"
      />
    </div>

    <!-- Prompt List -->
    <div class="overflow-y-auto">
      <PromptLibraryItem v-for="prompt in prompts" :key="prompt.id" :prompt="prompt" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptLibraryItem from './PromptLibraryItem.vue';
import {
  PlusIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';

const store = usePresetStore();
const prompts = computed(() => store.libraryPrompts);

let debounceTimer = null;
const onSearch = (event) => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    store.setLibrarySearch(event.target.value);
  }, 300); // 300ms debounce delay
};
</script>
