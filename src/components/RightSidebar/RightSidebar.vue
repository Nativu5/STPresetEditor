<template>
  <div class="flex h-full flex-col space-y-2">
    <TabGroup :selected-index="activeTabIndex" @change="changeTab">
      <TabList class="flex flex-shrink-0 space-x-1 rounded-xl bg-gray-200 p-1">
        <Tab v-for="tab in tabs" :key="tab.key" v-slot="{ selected }" as="template">
          <button
            :class="[
              'w-full rounded-lg py-2 text-sm leading-5 font-medium',
              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:ring-2 focus:outline-none',
              selected ? 'bg-white text-blue-700 shadow' : 'text-blue-700/60 hover:text-blue-700',
            ]"
          >
            <component :is="tab.icon" class="-mt-0.5 mr-1.5 inline-block h-5 w-5" />
            {{ tab.label }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="flex-grow overflow-y-auto rounded-xl bg-white shadow-sm">
        <TabPanel :key="'details'" class="h-full p-4">
          <DetailsView />
        </TabPanel>
        <TabPanel :key="'variables'" class="h-full p-4">
          <VariableManager />
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <!-- Batch Replace overlay panel: cover right pane only, default hidden -->
    <transition name="fade">
      <div v-if="store.isBatchReplaceModalOpen" class="absolute inset-0 z-40">
        <div class="absolute inset-0 flex">
          <div class="ml-auto h-full w-full max-w-xl bg-gray-50 p-4 overflow-auto">
            <BatchReplaceModal :embedded="true" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue';
import { InformationCircleIcon, VariableIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import BatchReplaceModal from '../MainEditor/BatchReplaceModal.vue';
import DetailsView from './DetailsView.vue';
import VariableManager from './VariableManager.vue';

const store = usePresetStore();

const tabs = computed(() => [
  { key: 'details', label: store.t('rightSidebar.details'), icon: InformationCircleIcon },
  { key: 'variables', label: store.t('rightSidebar.variables'), icon: VariableIcon },
]);

const activeTabIndex = computed(() => {
  const idx = tabs.value.findIndex((tab) => tab.key === store.activeRightSidebarTab);
  return idx === -1 ? 0 : idx;
});

const changeTab = (index) => {
  store.setActiveRightSidebarTab(tabs.value[index].key);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>