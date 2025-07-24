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
        :prompt="element"
      />
    </template>
  </draggable>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import PromptCard from './PromptCard.vue';
import draggable from 'vuedraggable';

const store = usePresetStore();

const prompts = computed({
  get() {
    return store.orderedPrompts;
  },
  set(newOrder) {
    store.updatePromptOrder(newOrder);
  }
});
</script>