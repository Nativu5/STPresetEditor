<template>
  <div class="h-full rounded-lg bg-white">
    <div v-if="selectedMacro">
      <MacroDetails />
    </div>
    <div v-else-if="selectedPrompt">
      <PromptDetails :prompt="selectedPrompt" />
    </div>
    <div v-else>
      <p class="text-gray-500 italic">{{ store.t('rightSidebar.selectPromptOrMacro') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import MacroDetails from './MacroDetails.vue';
import PromptDetails from './PromptDetails.vue';

const store = usePresetStore();

const selectedPrompt = computed(() => {
  if (store.selectedPromptId) {
    return store.getPromptById(store.selectedPromptId);
  }
  return null;
});

const selectedMacro = computed(() => store.selectedMacro);
</script>
