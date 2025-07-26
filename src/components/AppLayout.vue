<script setup>
import { useBreakpoints } from '@vueuse/core';
import { usePresetStore } from '../stores/presetStore';
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
  DialogOverlay,
} from '@headlessui/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// Use VueUse to detect screen size based on Tailwind's breakpoints
const breakpoints = useBreakpoints({
  desktop: 768, // Tailwind's 'md' breakpoint
});
const isDesktop = breakpoints.greaterOrEqual('desktop');

const store = usePresetStore();
</script>

<template>
  <!-- DESKTOP LAYOUT: 3-pane view with draggable splitters -->
  <div v-if="isDesktop" class="flex-grow">
    <!-- eslint-disable-next-line tailwindcss/no-custom-classname -->
    <splitpanes class="default-theme">
      <pane :size="20" min-size="15">
        <div class="h-full overflow-auto bg-gray-50 p-4">
          <slot name="left" />
        </div>
      </pane>
      <pane :size="50" min-size="30">
        <div class="h-full overflow-auto p-4">
          <slot name="main" />
        </div>
      </pane>
      <pane :size="30" min-size="20">
        <div class="h-full overflow-auto bg-gray-50 p-4">
          <slot name="right" />
        </div>
      </pane>
    </splitpanes>
  </div>

  <!-- MOBILE LAYOUT: Main view with off-canvas drawers -->
  <div v-else class="flex-grow overflow-hidden">
    <!-- Main content is always visible -->
    <div class="h-full overflow-auto p-2">
      <slot name="main" />
    </div>

    <!-- Left Sidebar as a Drawer -->
    <TransitionRoot :show="store.isLeftSidebarOpen" as="template">
      <Dialog class="relative z-50" @close="store.toggleLeftSidebar(false)">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-black/30" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <DialogPanel class="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-4 shadow-xl">
            <slot name="left" />
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>

    <!-- Right Sidebar as a Drawer -->
    <TransitionRoot :show="store.isRightSidebarOpen" as="template">
      <Dialog class="relative z-50" @close="store.toggleRightSidebar(false)">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-black/30" />
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel class="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white p-4 shadow-xl">
            <slot name="right" />
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style>
@reference "tailwindcss";

.splitpanes.default-theme .splitpanes__splitter {
  @apply bg-gray-200 transition-colors duration-200 ease-in-out;
  width: 6px;
}

/* On hover, the splitter subtly darkens */
.splitpanes.default-theme .splitpanes__splitter:hover {
  @apply bg-gray-300;
}

/* When dragging, it becomes more prominent */
.splitpanes.default-theme .splitpanes--dragging .splitpanes__splitter {
  @apply bg-gray-400;
}

/* The handle is a darker gray bar */
.splitpanes.default-theme .splitpanes__splitter::before {
  @apply bg-gray-400 transition-colors duration-200 ease-in-out;
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  transform: translateY(-50%);
  width: 2px;
  height: 28px;
  border-radius: 2px;
}

.splitpanes.default-theme .splitpanes__splitter:hover::before {
  @apply bg-gray-500;
}

.splitpanes.default-theme .splitpanes__splitter::after {
  display: none;
}
</style>
