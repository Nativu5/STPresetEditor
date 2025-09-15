<template>
  <!-- Main editor container with full height layout -->
  <div class="flex h-full flex-col">
    <!-- Editor header with title and controls -->
    <div class="mb-2 flex flex-shrink-0 flex-col">
      <!-- First row: Title and main controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 flex-1">
          <h2 class="text-lg font-semibold">{{ store.t('editor.title') }}</h2>
          <!-- Inline Search Box next to title -->
          <div class="relative flex-1 min-w-0">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              :value="store.editorSearchTerm"
              class="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-gray-300 transition ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-inset sm:text-sm sm:leading-6"
              :placeholder="store.t('editor.searchPlaceholder')"
              @input="onSearch"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0">
          <!-- Macro Display Mode Toggle Switch -->
          <SwitchGroup as="div" class="mx-2 flex items-center">
          <SwitchLabel as="span" class="mr-2 text-sm font-medium text-gray-900">
            {{ isPreviewMode ? store.t('editor.previewMode') : store.t('editor.rawMode') }}
          </SwitchLabel>
          <Switch
            :model-value="isPreviewMode"
            :class="isPreviewMode ? 'bg-green-500' : 'bg-gray-400'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
            @update:model-value="store.toggleMacroDisplayMode()"
          >
            <span
              aria-hidden="true"
              :class="isPreviewMode ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            >
              <!-- Raw mode icon -->
              <span
                :class="
                  isPreviewMode
                    ? 'opacity-0 duration-100 ease-out'
                    : 'opacity-100 duration-200 ease-in'
                "
                class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                aria-hidden="true"
              >
                <CodeBracketIcon class="h-3 w-3 text-gray-400" />
              </span>
              <!-- Preview mode icon -->
              <span
                :class="
                  isPreviewMode
                    ? 'opacity-100 duration-200 ease-in'
                    : 'opacity-0 duration-100 ease-out'
                "
                class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                aria-hidden="true"
              >
                <EyeIcon class="h-3 w-3 text-green-600" />
              </span>
            </span>
          </Switch>
          </SwitchGroup>
        </div>
      </div>
      
      <!-- Second row: Batch operations with select controls -->
      <div class="mt-2 flex items-center space-x-1">
        <span class="text-xs text-gray-500 mr-2">
          {{ store.t('editor.selectedCount', { selected: store.selectedEditorPrompts.length, total: store.promptOrder.length }) }}
        </span>
        <button
          @click="store.selectAllEditorPrompts()"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
          :title="store.t('editor.selectAll')"
        >
          {{ store.t('editor.selectAll') }}
        </button>
        <button
          @click="store.deselectAllEditorPrompts()"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
          :title="store.t('editor.deselectAll')"
        >
          {{ store.t('editor.deselectAll') }}
        </button>
        <button
          @click="store.batchMoveSelectedToTop()"
          :disabled="store.selectedEditorPrompts.length === 0"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="store.t('editor.batchMoveToTop')"
        >
          <ArrowUpIcon class="h-3.5 w-3.5" />
        </button>
        <button
          @click="store.batchMoveSelectedToBottom()"
          :disabled="store.selectedEditorPrompts.length === 0"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="store.t('editor.batchMoveToBottom')"
        >
          <ArrowDownIcon class="h-3.5 w-3.5" />
        </button>
        <button
          @click="store.openBatchReplaceModal()"
          :disabled="store.selectedEditorPrompts.length === 0"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="store.t('editor.batchReplace')"
        >
          {{ store.t('editor.batchReplace') }}
        </button>
        <button
          @click="store.batchDeleteSelected()"
          :disabled="store.selectedEditorPrompts.length === 0"
          class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :title="store.t('editor.batchDelete')"
        >
          <TrashIcon class="h-3.5 w-3.5" />
        </button>

        <!-- Move: Quick actions (new/collapse/expand) to the right inside this row -->
        <div class="ml-auto flex items-center space-x-1">
          <!-- New Prompt button -->
          <button
            @click="store.createNewPrompt()"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            :title="store.t('promptLibrary.newPrompt')"
          >
            <PlusIcon class="h-3.5 w-3.5" />
          </button>
          <!-- Collapse All button -->
          <button
            @click="store.collapseAllPrompts()"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            :title="store.t('editor.collapseAll')"
          >
            <ChevronUpIcon class="h-3.5 w-3.5" />
          </button>
          <!-- Expand All button -->
          <button
            @click="store.expandAllPrompts()"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
            :title="store.t('editor.expandAll')"
          >
            <ChevronDownIcon class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    

    <!-- Prompt list container -->
    <div ref="scrollContainer" class="overflow-y-auto">
      <div class="space-y-4">
        <PromptCard
          v-for="prompt in prompts"
          :key="prompt.id"
          :ref="
            (el) => {
              if (el) promptCardRefs[prompt.id] = el;
            }
          "
          :prompt="prompt"
        />
      </div>
    </div>

    <!-- Modals moved to RightSidebar overlay -->
  </div>
</template>

<script setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronUpIcon, CodeBracketIcon, EyeIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { debounce } from 'lodash-es';
import { computed, onBeforeUpdate, ref, watch } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptCard from './PromptCard.vue';

// Initialize the preset store
const store = usePresetStore();

// Refs for prompt card components (used for scrolling and animations)
const promptCardRefs = ref({});
const scrollContainer = ref(null);

// Computed property for preview mode state
const isPreviewMode = computed(() => store.macroDisplayMode === 'preview');

// Debounced search function to avoid excessive API calls
// Use lodash-es for a more robust and consistent debounce implementation
const onSearch = debounce((event) => {
  store.setEditorSearch(event.target.value);
}, 500); // 500ms debounce delay as requested

// Before each update, clear the refs object to avoid memory leaks
onBeforeUpdate(() => {
  promptCardRefs.value = {};
});

// Computed property for prompts
const prompts = computed(() => store.orderedPrompts);

// Public helper to request scrolling to a specific prompt
const scrollToPrompt = (promptId) => {
  store.navigateToPrompt(promptId);
};

// Scroll to top of the editor list
const scrollToTop = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

// Scroll to bottom of the editor list
const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// Expose methods for parent components to call
defineExpose({
  scrollToPrompt,
  scrollToTop,
  scrollToBottom
});

// Watch for scroll-to-prompt requests and handle smooth scrolling with animation
watch(
  () => store.scrollToPromptId,
  (newId) => {
    if (newId) {
      console.log('[EditorView] Received scroll request. Target prompt ID:', newId);
      
      // Only query inside the right editor container to avoid matching left list items
      const element = scrollContainer.value?.querySelector(`[data-id="${newId}"]`);
      console.log('[EditorView] Found DOM element in the editor:', element);
      
      if (element && scrollContainer.value) {
        console.log('[EditorView] Scrolling to prompt:', newId);
        
        // Compute element position relative to scroll container
        const containerRect = scrollContainer.value.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate required scroll distance
        const scrollTop = elementRect.top - containerRect.top + scrollContainer.value.scrollTop;
        console.log('[EditorView] Scroll calc - containerTop:', containerRect.top, 'elementTop:', elementRect.top, 'scrollTop:', scrollTop);
        
        // Perform smooth scroll
        scrollContainer.value.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // Flash animation
        element.classList.add('flash-highlight');
        window.setTimeout(() => {
          element.classList.remove('flash-highlight');
          store.clearScrollToRequest();
        }, 1500);
      } else {
        console.warn('[EditorView] Unable to find DOM element in the right editor. Prompt ID:', newId);
        console.warn('[EditorView] element exists:', !!element, 'scroll container exists:', !!scrollContainer.value);
        store.clearScrollToRequest();
      }
    }
  }
);
</script>

<style scoped>
@keyframes flash {
  0% {
    background-color: rgba(74, 144, 226, 0);
  }
  50% {
    background-color: rgba(74, 144, 226, 0.2);
  }
  100% {
    background-color: rgba(74, 144, 226, 0);
  }
}

.flash-highlight {
  animation: flash 1.5s ease-out;
}
</style>
