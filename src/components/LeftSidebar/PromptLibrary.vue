<template>
  <div>
    <PromptLibraryItem 
      v-for="prompt in prompts" 
      :key="prompt.identifier" 
      :prompt="prompt" 
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptLibraryItem from './PromptLibraryItem.vue';

const store = usePresetStore();
const prompts = computed(() => store.libraryPrompts);
</script>
