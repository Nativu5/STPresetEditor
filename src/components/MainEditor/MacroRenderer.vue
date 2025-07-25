<template>
  <Popover v-if="type === 'getvar'" class="relative inline-block">
    <span
      :class="macroStyle"
      class="mx-0.5 cursor-pointer rounded px-1 py-0.5 font-mono transition-all duration-150"
      @click.stop="onClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ formattedMacro }}
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
    {{ formattedMacro }}
  </span>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import { Popover, PopoverPanel } from '@headlessui/vue';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  promptId: {
    type: String,
    required: true,
  },
  partIndex: {
    type: Number,
    required: true,
  },
});

const store = usePresetStore();
const isPopoverVisible = ref(false);
let hoverTimeout = null;

const handleMouseEnter = () => {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  isPopoverVisible.value = true;
};

const handleMouseLeave = () => {
  hoverTimeout = setTimeout(() => {
    isPopoverVisible.value = false;
  }, 100);
};

const formattedMacro = computed(() => `{{${props.content}}}`);

const parsedMacro = computed(() => {
  const content = props.content;
  const typeIndex = content.indexOf('::');

  if (typeIndex === -1) {
    if (content.startsWith('//')) return { type: '//', varName: null };
    if (content.startsWith('random')) return { type: 'random', varName: null };
    if (content.startsWith('roll')) return { type: 'roll', varName: null };
    if (content === 'user' || content === 'char') return { type: content, varName: null };
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

const macroId = computed(() => `${props.promptId}-${props.partIndex}`);

const currentValue = computed(() => {
  if (type.value !== 'getvar') return undefined;
  return store.macroStateSnapshots[macroId.value];
});

const currentValueForPopover = computed(() => {
  const value = currentValue.value;
  if (value === undefined) return '<undefined>';
  if (value === '') return '<empty string>';
  return value;
});

const isSelected = computed(() => {
  if (!store.selectedMacro || !varName.value) return false;
  return store.selectedMacro.variableName === varName.value;
});

const isUnresolved = computed(() => {
  if (type.value !== 'getvar') return false;
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
    case '//':
      styles.push('text-gray-500 italic');
      break;
    default:
      styles.push('bg-gray-200 text-gray-800');
  }
  return styles;
});

const onClick = () => {
  if (varName.value) {
    store.selectMacro(varName.value);
  }
};
</script>
