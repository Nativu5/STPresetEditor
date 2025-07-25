<template>
  <div class="flex h-full flex-col">
    <div class="mb-4 flex flex-shrink-0 items-center justify-between">
      <h2 class="text-lg font-semibold">Editor</h2>
      <SwitchGroup as="div" class="mx-2 flex items-center">
        <SwitchLabel as="span" class="mr-2 text-sm font-medium text-gray-900">
          {{ isPreviewMode ? 'Preview Mode' : 'Raw Mode' }}
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
    <div class="overflow-y-auto">
      <draggable v-model="prompts" tag="div" item-key="id" class="space-y-4" handle=".cursor-grab">
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
import { computed, ref, watch, onBeforeUpdate } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptCard from './PromptCard.vue';
import draggable from 'vuedraggable';
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';
import { EyeIcon, CodeBracketIcon } from '@heroicons/vue/20/solid';

const store = usePresetStore();
const promptCardRefs = ref({});

const isPreviewMode = computed(() => store.macroDisplayMode === 'preview');

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
