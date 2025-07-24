<template>
  <span :class="macroStyle" class="font-mono rounded px-1 py-0.5 mx-0.5 cursor-pointer transition-all duration-150" @click.stop="onClick">
    {{ formattedMacro }}
  </span>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  promptId: {
    type: String,
    required: true,
  }
});

const store = usePresetStore();

// Create the full macro string in the script section to avoid template parsing issues.
const formattedMacro = computed(() => `{{${props.content}}}`);

const parts = computed(() => props.content.split('::').map(p => p.trim()));
const type = computed(() => parts.value[0]);
const varName = computed(() => (type.value === 'getvar' || type.value === 'setvar') ? parts.value[1] : null);

const isSelected = computed(() => {
    if (!store.selectedMacro || !varName.value) return false;
    return store.selectedMacro.variableName === varName.value;
});

const isUnresolved = computed(() => {
  if (type.value !== 'getvar' || !varName.value) return false;
  return store.unresolvedVariables.some(uv => uv.varName === varName.value && uv.promptId === props.promptId);
});

const macroStyle = computed(() => {
  let styles = [];
  if (isSelected.value) {
    styles.push('ring-2 ring-offset-1 ring-yellow-500');
  }

  if (isUnresolved.value) {
    styles.push('bg-red-100 text-red-700 underline decoration-red-500 decoration-wavy');
    return styles;
  }

  switch (type.value) {
    case 'setvar':
      styles.push('bg-blue-100 text-blue-700 hover:bg-blue-200');
      break;
    case 'getvar':
      styles.push('bg-green-100 text-green-700 hover:bg-green-200');
      break;
    case 'random':
    case 'roll':
      styles.push('bg-purple-100 text-purple-700');
      break;
    default:
      if (props.content.startsWith('//')) {
        styles.push('text-gray-500 italic');
      } else {
        styles.push('bg-gray-200 text-gray-800');
      }
  }
  return styles;
});

const onClick = () => {
  if (varName.value) {
    store.selectMacro(varName.value);
  }
};

</script>
