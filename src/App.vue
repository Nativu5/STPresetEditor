<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { usePresetStore } from './stores/presetStore';
import presetData from './assets/example.json';
import PromptLibrary from './components/LeftSidebar/PromptLibrary.vue';
import EditorView from './components/MainEditor/EditorView.vue';
import RightSidebar from './components/RightSidebar/RightSidebar.vue';
import AppToolbar from './components/AppToolbar.vue';
import JsonImportModal from './components/JsonImportModal.vue';
import JsonExportModal from './components/JsonExportModal.vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const store = usePresetStore();

const isImportModalOpen = ref(false);
const isExportModalOpen = ref(false);

onMounted(() => {
  store.setInitialJson(JSON.stringify(presetData));

  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

function handleBeforeUnload(event) {
  if (store.isModified) {
    event.preventDefault();
    event.returnValue =
      'You have unsaved changes in your JSON file. Are you sure you want to leave?';
    return 'You have unsaved changes in your JSON file. Are you sure you want to leave?';
  }
}

const handleImport = (jsonString) => {
  store.parseFromJson(jsonString);
};
</script>

<template>
  <div id="app-container" class="flex h-screen flex-col bg-gray-100">
    <header class="z-10 flex-shrink-0 bg-white p-2 shadow-md">
      <AppToolbar @open-import="isImportModalOpen = true" @open-export="isExportModalOpen = true" />
    </header>

    <main class="flex-1 overflow-hidden">
      <!-- eslint-disable-next-line tailwindcss/no-custom-classname -->
      <splitpanes class="default-theme h-full">
        <pane min-size="15" size="25">
          <div class="flex h-full flex-col bg-gray-50 p-4">
            <PromptLibrary />
          </div>
        </pane>
        <pane min-size="30" size="50">
          <div class="h-full p-4">
            <EditorView />
          </div>
        </pane>
        <pane min-size="15" size="25">
          <div class="flex h-full flex-col bg-gray-50 p-4">
            <RightSidebar />
          </div>
        </pane>
      </splitpanes>
    </main>

    <!-- Modals -->
    <JsonImportModal
      :is-open="isImportModalOpen"
      @close="isImportModalOpen = false"
      @import="handleImport"
    />
    <JsonExportModal :is-open="isExportModalOpen" @close="isExportModalOpen = false" />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.splitpanes.default-theme .splitpanes__splitter {
  background-color: #e5e7eb; /* bg-gray-200 */
  border-left: 1px solid #d1d5db; /* border-gray-300 */
  width: 5px;
  transition: border-color 0.2s ease-in-out;
}

.splitpanes.default-theme .splitpanes__splitter:hover {
  border-left: 1px solid #3b82f6; /* border-blue-500 */
}

.splitpanes.default-theme .splitpanes__splitter::before,
.splitpanes.default-theme .splitpanes__splitter::after {
  background-color: #9ca3af; /* bg-gray-400 */
  width: 2px;
  height: 20px;
}
</style>
