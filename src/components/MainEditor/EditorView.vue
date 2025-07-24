<template>
  <draggable
    v-model="prompts"
    tag="div"
    item-key="id"
    class="space-y-4"
    handle=".cursor-grab"
  >
    <template #item="{element}">
      <PromptCard
        :ref="el => { if (el) promptCardRefs[element.id] = el }"
        :prompt="element"
      />
    </template>
  </draggable>
</template>

<script setup>
import { computed, ref, watch, onBeforeUpdate } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptCard from './PromptCard.vue';
import draggable from 'vuedraggable';

const store = usePresetStore();
const promptCardRefs = ref({});

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
  }
});

watch(() => store.scrollToPromptId, (newId) => {
  if (newId) {
    const cardComponent = promptCardRefs.value[newId];
    if (cardComponent) {
      const element = cardComponent.$el;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash animation
      element.classList.add('flash-highlight');
      setTimeout(() => {
        element.classList.remove('flash-highlight');
        store.clearScrollToRequest();
      }, 1500); // Animation duration
    }
  }
});

</script>

<style scoped>
@keyframes flash {
  0% { background-color: rgba(74, 144, 226, 0); }
  50% { background-color: rgba(74, 144, 226, 0.2); }
  100% { background-color: rgba(74, 144, 226, 0); }
}

.flash-highlight {
  animation: flash 1.5s ease-out;
}
</style>
