<script setup>
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import presetData from './assets/example.json';
import AppLayout from './components/AppLayout.vue';
import AppToolbar from './components/AppToolbar.vue';
import JsonExportModal from './components/JsonExportModal.vue';
import JsonImportModal from './components/JsonImportModal.vue';
import LeftSidebar from './components/LeftSidebar/PromptLibrary.vue';
import EditorView from './components/MainEditor/EditorView.vue';
import WorldbookView from './components/MainEditor/WorldbookView.vue';
import PresetManagerModal from './components/PresetManagerModal.vue';
import RightSidebar from './components/RightSidebar/RightSidebar.vue';
import SettingsModal from './components/SettingsModal.vue';
import { usePresetStore } from './stores/presetStore';

// Initialize the preset store
const store = usePresetStore();
const route = useRoute();
const router = useRouter();

// Initialize the application with default data if no persisted data exists
onMounted(async () => {
  // Initialize language based on route
  const language = route.meta.language || 'cn';
  await store.setLanguage(language);
  
  // Check if we have persisted data, if not, load the default example
  if (!store.rawJson) {
    store.initializeDefaultData(JSON.stringify(presetData));
  }
});

// Watch for route changes to update language
watch(() => route.meta.language, async (newLanguage) => {
  if (newLanguage) {
    await store.setLanguage(newLanguage);
  }
});
</script>

<template>
  <!-- Main application container with full height layout -->
  <div id="app-container" class="flex h-screen flex-col bg-gray-100 font-sans text-gray-800">
    <!-- Application header with toolbar -->
    <header class="relative z-10 flex-shrink-0 bg-white p-2 shadow-md">
      <AppToolbar />
    </header>

    <!-- Main layout with three sections: left sidebar, main editor, right sidebar -->
    <AppLayout class="flex-grow overflow-hidden">
      <!-- Left sidebar: Prompt library for browsing and managing prompts -->
      <template #left>
        <LeftSidebar />
      </template>

      <!-- Main editor: Central area for editing and organizing prompts -->
      <template #main>
        <component
          :is="store.mainView === 'worldbook' ? WorldbookView : EditorView"
          :key="store.mainView"
        />
      </template>

      <!-- Right sidebar: Details view and variable management -->
      <template #right>
        <RightSidebar />
      </template>
    </AppLayout>

    <!-- Global modals for import/export functionality -->
    <JsonImportModal />
    <JsonExportModal />
    <PresetManagerModal :is-open="store.isPresetManagerOpen" />
    <SettingsModal :is-open="store.isSettingsModalOpen" />
    
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
