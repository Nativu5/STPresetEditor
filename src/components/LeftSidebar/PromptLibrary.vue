<template>
  <div class="flex flex-col h-full">
    <!-- Library Toolbar -->
    <div class="flex items-center justify-between mb-2 flex-shrink-0">
      <h2 class="text-lg font-semibold">Prompt Library</h2>
      <div class="flex items-center space-x-1">
        <button @click="store.createNewPrompt()" class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" title="New Prompt">
          <PlusIcon class="h-5 w-5" />
        </button>
        <button @click="store.toggleMultiSelect()" class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" :class="{ 'bg-blue-100 text-blue-600': store.isMultiSelectActive }" title="Multi-select">
          <ClipboardDocumentListIcon class="h-5 w-5" />
        </button>
        <button 
          @click="store.deleteSelectedPrompts()" 
          :disabled="store.selectedLibraryPrompts.size === 0"
          class="p-2 text-gray-500 rounded-full transition-colors"
          :class="{
            'hover:text-white hover:bg-red-500': store.selectedLibraryPrompts.size > 0,
            'opacity-50 cursor-not-allowed': store.selectedLibraryPrompts.size === 0
          }"
          title="Delete Selected"
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
            @input="onSearch"
            class="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition"
            placeholder="Search by name or ID..."
        />
    </div>

    <!-- Prompt List -->
    <div class="overflow-y-auto">
      <PromptLibraryItem 
        v-for="prompt in prompts" 
        :key="prompt.id" 
        :prompt="prompt" 
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptLibraryItem from './PromptLibraryItem.vue';
import { PlusIcon, ClipboardDocumentListIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

const store = usePresetStore();
const prompts = computed(() => store.libraryPrompts);

let debounceTimer = null;
const onSearch = (event) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        store.setLibrarySearch(event.target.value);
    }, 300); // 300ms debounce delay
};

</script>
