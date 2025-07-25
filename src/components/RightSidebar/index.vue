<template>
  <div class="h-full flex flex-col space-y-2">
    <TabGroup :selected-index="activeTabIndex" @change="changeTab">
      <TabList class="flex space-x-1 rounded-xl bg-gray-200 p-1 flex-shrink-0">
        <Tab v-for="tab in tabs" :key="tab.name" as="template" v-slot="{ selected }">
          <button
            :class="[
              'w-full rounded-lg py-2 text-sm font-medium leading-5',
              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
              selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-700/60 hover:text-blue-700',
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 inline-block -mt-0.5 mr-1.5" />
            {{ tab.name }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="flex-grow rounded-xl bg-white shadow-sm overflow-y-auto">
        <TabPanel :key="'details'" class="h-full p-4">
          <DetailsView />
        </TabPanel>
        <TabPanel :key="'variables'" class="h-full p-4">
          <VariableManager />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';
import { usePresetStore } from '../../stores/presetStore';
import DetailsView from './DetailsView.vue';
import VariableManager from './VariableManager.vue';
import { InformationCircleIcon, VariableIcon } from '@heroicons/vue/24/solid';

const store = usePresetStore();

const tabs = [
    { name: 'Details', icon: InformationCircleIcon },
    { name: 'Variables', icon: VariableIcon },
];

const activeTabIndex = computed(() => tabs.findIndex(tab => tab.name.toLowerCase() === store.activeRightSidebarTab));

const changeTab = (index) => {
    store.setActiveRightSidebarTab(tabs[index].name.toLowerCase());
};
</script>
