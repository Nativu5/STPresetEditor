<template>
  <span
    :class="macroStyle"
    class="font-mono rounded px-1 py-0.5 mx-0.5 cursor-pointer transition-all duration-150"
    @click.stop="onClick"
  >
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
  },
});

const store = usePresetStore();

// Create the full macro string in the script section to avoid template parsing issues.
const formattedMacro = computed(() => `{{${props.content}}}`);

const parsedMacro = computed(() => {
  const content = props.content;
  const typeIndex = content.indexOf('::');

  // Handle non-variable macros or malformed ones
  if (typeIndex === -1) {
    const trimmedContent = content.trim();
    if (trimmedContent.startsWith('//')) return { type: '//', varName: null };
    if (trimmedContent.startsWith('random')) return { type: 'random', varName: null };
    if (trimmedContent.startsWith('roll')) return { type: 'roll', varName: null };
    if (trimmedContent === 'user' || trimmedContent === 'char')
      return { type: trimmedContent, varName: null };
    return { type: 'unknown', varName: null };
  }

  const type = content.substring(0, typeIndex).trim();
  const rest = content.substring(typeIndex + 2);
  let varName = null;

  if (type === 'setvar') {
    const nameIndex = rest.indexOf('::');
    varName = nameIndex !== -1 ? rest.substring(0, nameIndex).trim() : null;
  } else if (type === 'getvar') {
    varName = rest.trim();
  }

  return { type, varName };
});

const type = computed(() => parsedMacro.value.type);
const varName = computed(() => parsedMacro.value.varName);

const isSelected = computed(() => {
  if (!store.selectedMacro || !varName.value) return false;
  return store.selectedMacro.variableName === varName.value;
});

const isUnresolved = computed(() => {
  if (type.value !== 'getvar' || !varName.value) return false;
  return store.unresolvedVariables.some(
    (uv) => uv.varName === varName.value && uv.promptId === props.promptId,
  );
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
    case 'user':
    case 'char':
      styles.push('bg-yellow-300 text-yellow-700');
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
