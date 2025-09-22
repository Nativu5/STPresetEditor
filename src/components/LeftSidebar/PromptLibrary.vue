<template>
  <div class="flex h-full flex-col">
    <!-- Library Toolbar -->
    <div class="mb-2 flex flex-shrink-0 items-center justify-between">
      <h2 class="text-lg font-semibold">{{ store.t('promptLibrary.title') }}</h2>
      <div class="flex items-center space-x-1">
        <!-- New Prompt Button -->
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-600"
          :title="store.t('promptLibrary.newPrompt')"
          @click="store.createNewPrompt()"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
        <!-- Multi-select Button -->
        <button
          class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          :class="{ 'bg-blue-100 text-blue-600': store.isMultiSelectActive }"
          :title="store.t('promptLibrary.multiSelect')"
          @click="store.toggleMultiSelect()"
        >
          <ClipboardDocumentCheckIcon class="h-5 w-5" />
        </button>
        <!-- Delete Selected Button -->
        <button
          :disabled="store.selectedLibraryPrompts.length === 0"
          class="rounded-full p-2 text-gray-500 transition-colors"
          :class="{
            'hover:bg-red-500 hover:text-white': store.selectedLibraryPrompts.length > 0,
            'cursor-not-allowed opacity-50': store.selectedLibraryPrompts.length === 0,
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
    <div ref="scrollContainer" class="overflow-y-auto">
      <!-- List Header with Count -->
      <div class="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>{{ store.t('promptLibrary.sortedByName') }}</span>
        <span>{{ store.t('promptLibrary.count', { count: libraryPrompts.length }) }}</span>
      </div>
      <div class="space-y-2">
        <PromptLibraryItem 
          v-for="prompt in libraryPrompts" 
          :key="prompt.id" 
          :prompt="prompt" 
        />
      </div>
      <!-- Empty State -->
      <div v-if="libraryPrompts.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500">
        <MagnifyingGlassIcon class="h-12 w-12 mb-2 text-gray-300" />
        <p class="text-sm">{{ store.t('promptLibrary.noResults') }}</p>
      </div>
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
import { computed, ref, watch } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptLibraryItem from './PromptLibraryItem.vue';

const store = usePresetStore();

// Computed list of prompts in the library
const libraryPrompts = computed(() => store.libraryPrompts);

// Use lodash-es for a more robust and consistent debounce implementation
const onSearch = debounce((event) => {
  store.setLibrarySearch(event.target.value);
}, 500); // 500ms debounce delay as requested

// Left-side library scroll container ref
const scrollContainer = ref(null);

// Watch for right-pane navigation requests and scroll to the corresponding item in the library
watch(
  () => store.scrollToLibraryPromptId,
  (newId) => {
    if (!newId) return;

    // 仅在库的滚动容器内查找元素
    const element = scrollContainer.value?.querySelector(`[data-id="${newId}"]`);
    if (element && scrollContainer.value) {
      const containerRect = scrollContainer.value.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = elementRect.top - containerRect.top + scrollContainer.value.scrollTop;

      scrollContainer.value.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });

      element.classList.add('flash-highlight');
      window.setTimeout(() => {
        element.classList.remove('flash-highlight');
        store.clearLibraryScrollToRequest();
      }, 1500);
    } else {
      store.clearLibraryScrollToRequest();
    }
  }
);
</script>

<style scoped>
@keyframes flash {
  0% { background-color: rgba(74, 144, 226, 0); }
  50% { background-color: rgba(74, 144, 226, 0.2); }
  100% { background-color: rgba(74, 144, 226, 0); }
}
.flash-highlight { animation: flash 1.5s ease-out; }
</style>
