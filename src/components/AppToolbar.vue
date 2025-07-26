<script setup>
import { usePresetStore } from '../stores/presetStore';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  Bars3Icon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline';

const store = usePresetStore();

const resetToDefault = () => {
  if (
    window.confirm(
      'Are you sure you want to reset all data and return to the factory default? This will permanently delete all your changes and cannot be undone.',
    )
  ) {
    store.resetToFactoryDefault();
  }
};
</script>

<template>
  <div class="flex w-full items-center justify-between bg-white">
    <!-- Mobile: Left Sidebar Toggle -->
    <button class="p-2 md:hidden" @click="store.toggleLeftSidebar()">
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- Desktop: Title -->
    <h1 class="hidden text-xl font-bold text-gray-800 md:block">📝 SillyTavern Preset Editor</h1>

    <!-- Mobile: Spacer to center the title -->
    <div class="flex-1 md:hidden"></div>

    <!-- Mobile: Centered Title -->
    <h1 class="absolute left-1/2 -translate-x-1/2 text-lg font-bold md:hidden">Editor</h1>

    <!-- Desktop: Action Buttons -->
    <div class="hidden items-center space-x-3 md:flex">
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        @click="store.isImportModalOpen = true"
      >
        <ArrowDownTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        Import
      </button>
      <button
        class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        @click="store.isExportModalOpen = true"
      >
        <ArrowUpTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        Export
      </button>
      <button
        class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        @click="resetToDefault"
      >
        <ArrowPathIcon class="mr-2 -ml-1 h-5 w-5" />
        Reset
      </button>
    </div>

    <!-- Mobile: Action Group -->
    <div class="flex items-center md:hidden">
      <button class="p-2" @click="store.toggleRightSidebar()">
        <InformationCircleIcon class="h-6 w-6" />
      </button>

      <Menu as="div" class="relative">
        <MenuButton class="p-2">
          <EllipsisVerticalIcon class="h-6 w-6" />
        </MenuButton>
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md ring-1 ring-gray-200 focus:outline-none"
          >
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
                <button
                  :class="[
                    active ? 'bg-blue-500 text-white' : 'text-gray-900',
                    'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                  ]"
                  @click="store.openImportModal()"
                >
                  <ArrowDownTrayIcon
                    :class="[active ? 'text-blue-100' : 'text-blue-400', 'mr-2 h-5 w-5']"
                  />
                  Import from JSON
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  :class="[
                    active ? 'bg-green-500 text-white' : 'text-gray-900',
                    'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                  ]"
                  @click="store.openExportModal()"
                >
                  <ArrowUpTrayIcon
                    :class="[active ? 'text-green-100' : 'text-green-400', 'mr-2 h-5 w-5']"
                  />
                  Export to JSON
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
                  @click="resetToDefault"
                >
                  <ArrowPathIcon
                    :class="[active ? 'text-red-100' : 'text-red-400', 'mr-2 h-5 w-5']"
                  />
                  Reset to Default
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>
