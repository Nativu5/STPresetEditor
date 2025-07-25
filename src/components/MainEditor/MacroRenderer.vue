<template>
  <Popover v-if="macro.type === 'getvar'" class="relative inline-block">
    <span
      :class="macroStyle"
      class="mx-0.5 cursor-pointer rounded px-1 py-0.5 font-mono transition-all duration-150"
      @click.stop="onClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ macro.full }}
    </span>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
        v-show="isPopoverVisible"
        static
        class="absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-xs -translate-x-1/2 transform rounded-lg bg-gray-800 px-3 py-2 text-sm font-normal text-white shadow-lg"
      >
        <div class="break-all">
          <span class="font-bold">Value:</span>
          <pre class="inline font-mono whitespace-pre-wrap">{{ currentValueForPopover }}</pre>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>

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
import { computed, ref, onMounted } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import { Popover, PopoverPanel } from '@headlessui/vue';

const props = defineProps({
  /** @type {import('vue').PropType<import('../../stores/presetStore').MacroData>} */
  macro: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();
const isPopoverVisible = ref(false);
let hoverTimeout = null;

onMounted(() => {
  console.log('[MacroRenderer] Mounted with macro:', JSON.parse(JSON.stringify(props.macro)));
});

const handleMouseEnter = () => {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  isPopoverVisible.value = true;
};

const handleMouseLeave = () => {
  hoverTimeout = setTimeout(() => {
    isPopoverVisible.value = false;
  }, 100);
};

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
      styles.push('bg-yellow-300 text-yellow-700');
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
