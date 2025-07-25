<template>
  <div
    class="relative mx-1 my-2 rounded-lg border p-4 shadow-md transition-shadow duration-200"
    :class="[
      isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-200',
      !isEnabled ? 'bg-gray-100' : 'bg-white',
    ]"
    @click="selectPrompt"
  >
    <!-- Header: Title and Actions -->
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center">
        <Bars3Icon class="mr-3 h-5 w-5 cursor-grab text-gray-400 active:cursor-grabbing" />
        <h3 class="text-base font-bold" :class="{ 'text-gray-500': !isEnabled }">
          {{ prompt.name }}
        </h3>
      </div>
      <div class="flex items-center space-x-2">
        <Switch
          v-model="isEnabled"
          :class="isEnabled ? 'bg-blue-600' : 'bg-gray-300'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        >
          <span
            :class="isEnabled ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          />
        </Switch>
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="inline-flex w-full justify-center rounded-md p-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
            </MenuButton>
          </div>
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md ring-1 ring-gray-200 focus:outline-none"
            >
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="hidePrompt"
                  >
                    <EyeSlashIcon class="mr-2 h-5 w-5 text-yellow-400" aria-hidden="true" />
                    Hide
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-red-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="removePrompt"
                  >
                    <TrashIcon class="mr-2 h-5 w-5 text-red-400" aria-hidden="true" />
                    Delete
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
    <!-- Text -->
    <div class="px-8 text-sm whitespace-pre-wrap" :class="{ 'text-gray-600': !isEnabled }">
      <template v-for="(segment, index) in parsedContent" :key="index">
        <span v-if="segment.type === 'text'">{{ segment.value }}</span>
        <MacroRenderer
          v-else-if="segment.type === 'macro'"
          :content="segment.value"
          :prompt-id="prompt.id"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import MacroRenderer from './MacroRenderer.vue';
import { Switch, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { Bars3Icon, EllipsisVerticalIcon, EyeSlashIcon, TrashIcon } from '@heroicons/vue/20/solid';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const isSelected = computed(() => store.selectedPromptId === props.prompt.id);

const isEnabled = computed({
  get() {
    return props.prompt.enabled !== false;
  },
  // eslint-disable-next-line no-unused-vars
  set(_value) {
    store.togglePromptEnabled(props.prompt.id);
  },
});

const parsedContent = computed(() => {
  const content = props.prompt.content || '';
  const regex = /({{\s*.*?\s*}})/gs;
  const parts = content.split(regex).filter((part) => part);

  return parts.map((part) => {
    const match = part.match(/^{{\s*(.*?)\s*}}$/s);
    if (match) {
      return { type: 'macro', value: match[1] };
    } else {
      return { type: 'text', value: part };
    }
  });
});

const selectPrompt = () => {
  store.selectPrompt(props.prompt.id);
};

const hidePrompt = () => {
  store.hidePrompt(props.prompt.id);
};

const removePrompt = () => {
  if (window.confirm(`Are you sure you want to permanently delete "${props.prompt.name}"?`)) {
    store.removePrompt(props.prompt.id);
  }
};
</script>
