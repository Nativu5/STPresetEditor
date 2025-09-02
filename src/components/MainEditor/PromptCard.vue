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
        <button
          @click.stop="toggleCollapse"
          class="flex items-center hover:bg-gray-100 rounded p-1 transition-colors"
        >
          <ChevronDownIcon 
            class="mr-2 h-4 w-4 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-[-90deg]': finalCollapsedState }"
          />
          <h3 class="text-base font-bold" :class="{ 'text-gray-500': !isEnabled }">
            {{ prompt.name }}
          </h3>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <Menu as="div" class="relative inline-block text-left">
          <v-tooltip>
            <MenuButton
              class="inline-flex w-full justify-center rounded-md p-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              @click.stop
            >
              <component :is="RoleIcon" class="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <template #popper>{{ store.t('promptCard.roleLabel') }}: {{ store.t(`promptCard.role.${currentRole}`) }}</template>
          </v-tooltip>

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
                      active ? 'bg-blue-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="setRole('system')"
                  >
                    <Cog6ToothIcon class="mr-2 h-5 w-5" />
                    {{ store.t('promptCard.role.system') }}
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-blue-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="setRole('user')"
                  >
                    <UserIcon class="mr-2 h-5 w-5" />
                    {{ store.t('promptCard.role.user') }}
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-blue-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="setRole('assistant')"
                  >
                    <ChatBubbleOvalLeftIcon class="mr-2 h-5 w-5" />
                    {{ store.t('promptCard.role.assistant') }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>

        <div @click.stop>
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
        </div>
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="inline-flex w-full justify-center rounded-md p-1 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              @click.stop
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
              class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
            >
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-blue-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="store.movePromptTop(prompt.id)"
                  >
                    <ArrowUpCircleIcon class="mr-2 h-5 w-5 text-blue-400" />
                    {{ store.t('promptCard.moveToTop') }}
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-blue-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="store.movePromptBottom(prompt.id)"
                  >
                    <ArrowDownCircleIcon class="mr-2 h-5 w-5 text-blue-400" />
                    {{ store.t('promptCard.moveToBottom') }}
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-green-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="store.duplicatePrompt(prompt.id)"
                  >
                    <DocumentDuplicateIcon class="mr-2 h-5 w-5 text-green-400" />
                    {{ store.t('promptCard.duplicate') }}
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-yellow-500 text-white' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                    @click.stop="hidePrompt"
                  >
                    <EyeSlashIcon class="mr-2 h-5 w-5 text-yellow-400" aria-hidden="true" />
                    {{ store.t('promptCard.hide') }}
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                      prompt.system_prompt
                        ? 'cursor-not-allowed text-gray-400'
                        : active
                          ? 'bg-red-500 text-white'
                          : 'text-gray-900',
                    ]"
                    @click.stop="removePrompt"
                  >
                    <TrashIcon
                      :class="[
                        'mr-2 h-5 w-5',
                        prompt.system_prompt ? 'text-gray-300' : 'text-red-400',
                      ]"
                      aria-hidden="true"
                    />
                    {{ store.t('promptCard.delete') }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
    <!-- Text -->
    <div 
      v-show="!finalCollapsedState"
      class="px-8 text-sm whitespace-pre-wrap" 
      :class="{ 'text-gray-600': !isEnabled }"
    >
      <template v-for="(part, index) in contentParts" :key="index">
        <MacroRenderer
          v-if="part.isMacro"
          :macro="part.macroData"
          :display-mode="store.macroDisplayMode"
        />
        <span v-else>{{ part.content }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/vue';
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    Bars3Icon,
    ChatBubbleOvalLeftIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    DocumentDuplicateIcon,
    EllipsisVerticalIcon,
    EyeSlashIcon,
    TrashIcon,
    UserIcon,
} from '@heroicons/vue/20/solid';
import { computed, ref } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import MacroRenderer from './MacroRenderer.vue';

const props = defineProps({
  /** @type {import('vue').PropType<import('../../stores/presetStore').PartialPrompt>} */
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

// 折叠状态管理
const isCollapsed = ref(false);

// 监听全局折叠状态
const globalCollapseState = computed(() => store.globalCollapseState);

// 计算最终的折叠状态
const finalCollapsedState = computed(() => {
  if (globalCollapseState.value === 'collapsed') {
    return true;
  } else if (globalCollapseState.value === 'expanded') {
    return false;
  }
  // 如果是 'mixed' 状态，使用本地状态
  return isCollapsed.value;
});

const isSelected = computed(() => store.selectedPromptId === props.prompt.id);

const isEnabled = computed({
  get() {
    return props.prompt.enabled !== false;
  },
  set() {
    store.togglePromptEnabled(props.prompt.id);
  },
});

const currentRole = computed(() => props.prompt.role || 'system');

const roleIcons = {
  system: Cog6ToothIcon,
  user: UserIcon,
  assistant: ChatBubbleOvalLeftIcon,
};

const RoleIcon = computed(() => roleIcons[currentRole.value]);

const setRole = (newRole) => {
  store.updatePromptDetail({
    promptId: props.prompt.id,
    field: 'role',
    value: newRole,
  });
};

/**
 * @returns {Array<{isMacro: boolean, content?: string, macroData?: import('../../stores/presetStore').MacroData}>}
 */
const contentParts = computed(() => {
  const content = props.prompt.content || '';
  const macros = props.prompt.macros || [];
  const mode = store.macroDisplayMode;

  if (macros.length === 0) {
    return [{ isMacro: false, content: content }];
  }

  const parts = [];
  let lastIndex = 0;

  macros.forEach((macro) => {
    const macroStartIndex = content.indexOf(macro.full, lastIndex);
    if (macroStartIndex === -1) return; // Should not happen

    // Add text part before the macro
    if (macroStartIndex > lastIndex) {
      parts.push({ isMacro: false, content: content.substring(lastIndex, macroStartIndex) });
    }

    // Add the macro part, applying mode logic
    if (mode === 'preview') {
      if (macro.type === 'setvar' || macro.type === 'comment') {
        // Hide these macros in preview mode
      } else {
        // For getvar and others, pass the macro object to the renderer
        parts.push({ isMacro: true, macroData: macro });
      }
    } else {
      // In raw mode, always show the macro
      parts.push({ isMacro: true, macroData: macro });
    }

    lastIndex = macroStartIndex + macro.full.length;
  });

  // Add remaining text part after the last macro
  if (lastIndex < content.length) {
    parts.push({ isMacro: false, content: content.substring(lastIndex) });
  }

  return parts;
});

const selectPrompt = () => {
  store.selectPrompt(props.prompt.id);
};

const hidePrompt = () => {
  store.hidePrompt(props.prompt.id);
};

const removePrompt = () => {
  if (props.prompt.system_prompt) {
    alert(store.t('promptCard.systemPromptCannotDelete'));
    return;
  }
  if (window.confirm(store.t('promptCard.deleteConfirm', { name: props.prompt.name }))) {
    store.removePrompt(props.prompt.id);
  }
};

// 切换折叠状态
const toggleCollapse = () => {
  // 如果全局状态是 'collapsed' 或 'expanded'，先重置为 'mixed'
  if (store.globalCollapseState !== 'mixed') {
    store.globalCollapseState = 'mixed';
  }
  // 切换本地状态
  isCollapsed.value = !isCollapsed.value;
};
</script>
