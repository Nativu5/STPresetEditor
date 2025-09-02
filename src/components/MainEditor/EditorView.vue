<template>
  <div class="flex h-full flex-col">
    <div class="mb-2 flex flex-shrink-0 items-center justify-between">
      <h2 class="text-lg font-semibold">{{ store.t('editor.title') }}</h2>
      <div class="flex items-center space-x-2">
        <!-- Collapse/Expand All Button (Toggle) -->
        <div class="flex items-center space-x-1">
          <!-- Show Collapse All button when prompts are expanded or mixed -->
          <button
            v-if="store.globalCollapseState === 'expanded' || store.globalCollapseState === 'mixed'"
            @click="store.collapseAllPrompts()"
            class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            :title="store.t('editor.collapseAll')"
          >
            <ChevronUpIcon class="h-3 w-3 mr-1" />
            {{ store.t('editor.collapseAll') }}
          </button>
          <!-- Show Expand All button when prompts are collapsed -->
          <button
            v-if="store.globalCollapseState === 'collapsed'"
            @click="store.expandAllPrompts()"
            class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
            :title="store.t('editor.expandAll')"
          >
            <ChevronDownIcon class="h-3 w-3 mr-1" />
            {{ store.t('editor.expandAll') }}
          </button>
        </div>
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

    <!-- Search Box -->
    <div class="relative mb-4 flex-shrink-0">
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

    <div class="overflow-y-auto">
      <draggable 
        v-model="prompts" 
        tag="div" 
        item-key="id" 
        class="space-y-4" 
        handle=".cursor-grab"
        group="prompts"
        :sort="true"
        :pull="true"
        :put="true"
        @add="onPromptAdded"
      >
        <template #item="{ element }">
          <PromptCard
            :ref="
              (el) => {
                if (el) promptCardRefs[element.id] = el;
              }
            "
            :prompt="element"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { ChevronDownIcon, ChevronUpIcon, CodeBracketIcon, EyeIcon } from '@heroicons/vue/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { debounce } from 'lodash-es';
import { computed, onBeforeUpdate, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { usePresetStore } from '../../stores/presetStore';
import PromptCard from './PromptCard.vue';

const store = usePresetStore();
const promptCardRefs = ref({});

const isPreviewMode = computed(() => store.macroDisplayMode === 'preview');

// Use lodash-es for a more robust and consistent debounce implementation
const onSearch = debounce((event) => {
  store.setEditorSearch(event.target.value);
}, 500); // 500ms debounce delay as requested

// Before each update, clear the refs object to avoid memory leaks
onBeforeUpdate(() => {
  promptCardRefs.value = {};
});

const prompts = computed({
  get() {
    return store.orderedPrompts;
  },
  set(newOrder) {
    store.updatePromptOrder(newOrder);
  },
});

// 处理从左侧库拖拽添加的提示
const onPromptAdded = (event) => {
  const { newIndex, item } = event;
  const promptId = item.getAttribute('data-id') || item.id;
  
  // 如果提示不在编辑器中，需要添加到store
  if (!store.isPromptInOrder(promptId)) {
    // 使用vuedraggable提供的新位置索引
    const insertIndex = newIndex;
    
    // 将提示插入到指定位置
    store.promptOrder.splice(insertIndex, 0, promptId);
    store.analyzeAllMacros();
    store.navigateToPrompt(promptId);
  }
};

watch(
  () => store.scrollToPromptId,
  (newId) => {
    if (newId) {
      const cardComponent = promptCardRefs.value[newId];
      if (cardComponent) {
        const element = cardComponent.$el;
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Flash animation
        element.classList.add('flash-highlight');
        window.setTimeout(() => {
          element.classList.remove('flash-highlight');
          store.clearScrollToRequest();
        }, 1500); // Animation duration
      }
    }
  },
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
