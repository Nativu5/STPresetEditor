<template>
  <div class="h-full flex flex-col">
    <TabGroup :selected-index="activeTabIndex" @change="changeTab">
      <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1 flex-shrink-0">
        <Tab v-for="tab in tabs" :key="tab.name" as="template" v-slot="{ selected }">
          <button
            :class="[
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
              selected
                ? 'bg-white shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 inline-block mr-2" />
            {{ tab.name }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="mt-2 flex-grow overflow-y-auto">
        <TabPanel :key="'details'" class="h-full p-3 bg-white rounded-lg shadow-inner">
          <DetailsView />
        </TabPanel>
        <TabPanel :key="'variables'" class="h-full p-3 bg-white rounded-lg shadow-inner">
          <VariableManager />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
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
