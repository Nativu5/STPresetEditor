<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { usePresetStore } from './stores/presetStore';
import presetData from './assets/example.json';
import PromptLibrary from './components/LeftSidebar/PromptLibrary.vue';
import EditorView from './components/MainEditor/EditorView.vue';
import RightSidebar from './components/RightSidebar/index.vue';
import Toolbar from './components/Toolbar.vue';
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
    event.returnValue = 'You have unsaved changes in your JSON file. Are you sure you want to leave?';
    return 'You have unsaved changes in your JSON file. Are you sure you want to leave?';
  }
}

const handleImport = (jsonString) => {
  store.parseFromJson(jsonString);
};

</script>

<template>
  <div id="app-container" class="flex flex-col h-screen bg-gray-100">
    <header class="bg-white shadow-md p-2 z-10 flex-shrink-0">
      <Toolbar 
        @open-import="isImportModalOpen = true"
        @open-export="isExportModalOpen = true"
      />
    </header>

    <main class="flex-1 overflow-hidden">
        <splitpanes class="default-theme h-full">
            <pane min-size="15" size="25">
                <div class="p-4 h-full flex flex-col bg-gray-50">
                    <PromptLibrary />
                </div>
            </pane>
            <pane min-size="30" size="50">
                <div class="p-4 h-full flex flex-col">
                    <h2 class="text-lg font-semibold mb-4 flex-shrink-0">Editor</h2>
                    <div class="overflow-y-auto">
                        <EditorView />
                    </div>
                </div>
            </pane>
            <pane min-size="15" size="25">
                <div class="p-4 h-full flex flex-col bg-gray-50">
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
    <JsonExportModal 
      :is-open="isExportModalOpen" 
      @close="isExportModalOpen = false" 
    />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
