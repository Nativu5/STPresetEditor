<script setup>
import { onMounted } from 'vue';
import { usePresetStore } from './stores/presetStore';
import presetData from './assets/example.json';
import AppToolbar from './components/AppToolbar.vue';
import AppLayout from './components/AppLayout.vue';
import EditorView from './components/MainEditor/EditorView.vue';
import LeftSidebar from './components/LeftSidebar/PromptLibrary.vue';
import RightSidebar from './components/RightSidebar/RightSidebar.vue';
import JsonImportModal from './components/JsonImportModal.vue';
import JsonExportModal from './components/JsonExportModal.vue';

const store = usePresetStore();

onMounted(() => {
  // Check if we have persisted data, if not, load the default example
  if (!store.rawJson) {
    store.initializeDefaultData(JSON.stringify(presetData));
  }
});
</script>

<template>
  <div id="app-container" class="flex h-screen flex-col bg-gray-100 font-sans text-gray-800">
    <header class="relative z-10 flex-shrink-0 bg-white p-2 shadow-md">
      <AppToolbar />
    </header>

    <AppLayout class="flex-grow overflow-hidden">
      <template #left>
        <LeftSidebar />
      </template>

      <template #main>
        <EditorView />
      </template>

      <template #right>
        <RightSidebar />
      </template>
    </AppLayout>

    <!-- Modals remain at the root -->
    <JsonImportModal />
    <JsonExportModal />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
