<template>
  <!-- Render the getvar value in preview mode -->
  <span
    v-if="macro.type === 'getvar' && displayMode === 'preview'"
    v-tooltip="{ content: macro.full, placement: 'top' }"
    class="mx-0.5 cursor-pointer rounded bg-yellow-100 px-1 py-0.5 font-mono text-yellow-800 ring-yellow-500 transition-all duration-150 hover:ring-2"
    :class="{ '!bg-red-100 !text-red-700': isUnresolved }"
    @click.stop="onClick"
  >
    {{ currentValueForPopover }}
  </span>

  <!-- Render the raw macro for all other cases -->
  <span
    v-else-if="macro.type === 'getvar'"
    v-tooltip="{ content: currentValueForPopover, placement: 'top' }"
    :class="macroStyle"
    class="mx-0.5 cursor-pointer rounded px-1 py-0.5 font-mono transition-all duration-150"
    @click.stop="onClick"
  >
    {{ macro.full }}
  </span>

  <span
    v-else
    :class="macroStyle"
    class="mx-0.5 cursor-pointer rounded px-1 py-0.5 font-mono transition-all duration-150"
    @click.stop="onClick"
  >
    {{ macro.full }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const props = defineProps({
  /** @type {import('vue').PropType<import('../../stores/presetStore').MacroData>} */
  macro: {
    type: Object,
    required: true,
  },
  displayMode: {
    type: String,
    required: true,
  },
});

const store = usePresetStore();

const currentValue = computed(() => {
  if (props.macro.type !== 'getvar') return undefined;
  return store.macroStateSnapshots[props.macro.id];
});

const currentValueForPopover = computed(() => {
  const value = currentValue.value;
  if (value === undefined) return '<undefined>';
  if (value === '') return '<empty string>';
  return value;
});

const isSelected = computed(() => {
  if (!store.selectedMacro || !props.macro.varName) return false;
  return store.selectedMacro.variableName === props.macro.varName;
});

const isUnresolved = computed(() => {
  if (props.macro.type !== 'getvar') return false;
  // A getvar is unresolved if its specific snapshot value is undefined.
  return currentValue.value === undefined;
});

const macroStyle = computed(() => {
  const styles = [];
  if (isSelected.value) {
    styles.push('ring-2 ring-offset-1 ring-yellow-500');
  }

  if (isUnresolved.value) {
    styles.push('bg-red-100 text-red-700 underline decoration-red-500 decoration-wavy');
    return styles;
  }

  switch (props.macro.type) {
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
    case 'scenario':
    case 'lastChatMessage':
      styles.push('bg-yellow-100 text-yellow-700');
      break;
    case 'comment':
      styles.push('text-gray-500 italic');
      break;
    default:
      styles.push('bg-gray-200 text-gray-800');
  }
  return styles;
});

const onClick = () => {
  if (props.macro.varName) {
    store.selectMacro(props.macro.varName);
  }
};
</script>
