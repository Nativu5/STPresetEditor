<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    Bars3Icon,
    BookmarkIcon,
    Cog6ToothIcon,
    EllipsisVerticalIcon,
    InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import { usePresetStore } from '../stores/presetStore';

// Initialize the preset store
const store = usePresetStore();

// Reset & Language now live in Settings modal
</script>

<template>
  <!-- Main toolbar container with responsive layout -->
  <div class="flex w-full items-center justify-between bg-white">
    <!-- Mobile: Left Sidebar Toggle Button -->
    <button class="p-2 md:hidden" @click="store.toggleLeftSidebar()">
      <Bars3Icon class="h-6 w-6" />
    </button>

    <!-- Desktop: Application Title -->
    <h1 class="hidden text-xl font-bold text-gray-800 md:block">{{ store.t('app.title') }}</h1>

    <!-- Mobile: Spacer to center the title -->
    <div class="flex-1 md:hidden"></div>

    <!-- Mobile: Centered Application Title -->
    <h1 class="absolute left-1/2 -translate-x-1/2 text-lg font-bold md:hidden">{{ store.t('app.titleMobile') }}</h1>

    <!-- Desktop: Action Buttons Group -->
    <div class="hidden items-center space-x-3 md:flex">
      <!-- Language moved to Settings -->
      <!-- Import JSON Button -->
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        @click="store.isImportModalOpen = true"
      >
        <ArrowDownTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        {{ store.t('toolbar.import') }}
      </button>
      <!-- Export JSON Button -->
      <button
        class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
        @click="store.isExportModalOpen = true"
      >
        <ArrowUpTrayIcon class="mr-2 -ml-1 h-5 w-5" />
        {{ store.t('toolbar.export') }}
      </button>
      <!-- Preset Manager Button -->
      <button
        class="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
        @click="store.openPresetManager()"
      >
        <BookmarkIcon class="mr-2 -ml-1 h-5 w-5" />
        {{ store.t('toolbar.presets') }}
      </button>
      <!-- Settings Button -->
      <button
        class="inline-flex items-center rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        @click="store.isSettingsModalOpen = true"
      >
        <Cog6ToothIcon class="mr-2 -ml-1 h-5 w-5" />
        {{ store.t('toolbar.settings') }}
      </button>
      <!-- Reset moved to Settings -->
    </div>

    <!-- Mobile: Action Group with Right Sidebar Toggle and Menu -->
    <div class="flex items-center md:hidden">
      <!-- Right Sidebar Toggle Button -->
      <button class="p-2" @click="store.toggleRightSidebar()">
        <InformationCircleIcon class="h-6 w-6" />
      </button>

      <!-- Mobile Menu Dropdown -->
      <Menu as="div" class="relative">
        <MenuButton class="p-2">
          <EllipsisVerticalIcon class="h-6 w-6" />
        </MenuButton>
        <!-- Menu Transition Animation -->
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
            <!-- Import/Export Actions Group -->
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
                  {{ store.t('toolbar.importFromJson') }}
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
                  {{ store.t('toolbar.exportToJson') }}
                </button>
              </MenuItem>
            </div>
            <!-- Settings Actions Group (moved to Settings) -->
            <div class="px-1 py-1">
              <div class="px-2 py-2 text-xs text-gray-400">{{ store.t('toolbar.settings') }}</div>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>
