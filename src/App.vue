<script setup>
import { onMounted, ref } from 'vue';
import { usePresetStore } from './stores/presetStore';
import presetData from '../preset.example.json';
import PromptLibrary from './components/LeftSidebar/PromptLibrary.vue';
import EditorView from './components/MainEditor/EditorView.vue';
import DetailsView from './components/RightSidebar/DetailsView.vue';
import Toolbar from './components/Toolbar.vue';
import JsonImportModal from './components/JsonImportModal.vue';
import JsonExportModal from './components/JsonExportModal.vue';

const store = usePresetStore();

const isImportModalOpen = ref(false);
const isExportModalOpen = ref(false);

onMounted(() => {
  store.setInitialJson(JSON.stringify(presetData));
});

const handleImport = (jsonString) => {
  store.parseFromJson(jsonString);
};

</script>

<template>
  <div id="app-container" class="flex flex-col h-screen bg-gray-100">
    <header class="bg-white shadow-md p-2 z-10">
      <Toolbar 
        @open-import="isImportModalOpen = true"
        @open-export="isExportModalOpen = true"
      />
    </header>

    <main class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar: Prompt Library -->
      <aside class="w-1/4 bg-gray-50 p-4 border-r flex flex-col">
        <PromptLibrary />
      </aside>

      <!-- Main Editor View -->
      <section class="flex-1 p-4 flex flex-col">
        <h2 class="text-lg font-semibold mb-4 flex-shrink-0">Editor</h2>
        <div class="overflow-y-auto">
          <EditorView />
        </div>
      </section>

      <!-- Right Sidebar: Details View -->
      <aside class="w-1/4 bg-gray-50 p-4 overflow-y-auto border-l">
        <h2 class="text-lg font-semibold mb-4 sticky top-0 bg-gray-50 pb-2">Details</h2>
        <DetailsView />
      </aside>
    </main>

    <!-- Modals -->
    <JsonImportModal 
      :is-open="isImportModalOpen" 
      @close="isImportModalOpen = false" 
      @import="handleImport"
    />
    <JsonExportModal 
      :is-open="isExportModalOpen" 
      @close="isExportModalOpen = false" 
    />
  </div>
</template>

<style>
/* We will use Tailwind CSS, but some global styles might be needed. */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>