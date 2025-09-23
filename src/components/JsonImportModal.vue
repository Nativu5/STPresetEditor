<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';
import { usePresetStore } from '../stores/presetStore';

const store = usePresetStore();
const jsonInput = ref('');
const fileInput = ref(null);
const isDragOver = ref(false);
const currentFilename = ref('');

function importJson() {
  let parsed;
  try {
    parsed = JSON.parse(jsonInput.value);
  } catch {
    alert(store.t('importModal.invalidContent'));
    return;
  }

  // Try import as Worldbook (Lorebook) first
  const importedAsWorldbook = store.importWorldbookJson(jsonInput.value, currentFilename.value);
  if (importedAsWorldbook) {
    const count = Array.isArray(store.worldbook?.entries) ? store.worldbook.entries.length : 0;
    alert(store.t('importModal.worldbookImported', { count }));
    store.closeImportModal();
    return;
  }

  // Fallback: treat as preset
  const result = store.importPresetWithDuplicateCheck(jsonInput.value, currentFilename.value);
  if (result?.result === 'failed') {
    alert(store.t('importModal.invalidContent'));
    return;
  }

  const messageKey = result?.result === 'overwritten' ? 'importModal.overwriteDone' : 'importModal.savedDone';
  const nameParam = { name: result?.name || '' };
  alert(store.t(messageKey, nameParam));

  if (result?.id) {
    const loadNowMsg = store.t('importModal.loadNowConfirm', nameParam);
    if (window.confirm(loadNowMsg)) {
      store.loadPreset(result.id);
      alert(store.t('importModal.loadNowDone', nameParam));
    }
  }
  store.closeImportModal();
}

 

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type === 'application/json') {
    readFileContent(file);
  } else {
    alert(store.t('importModal.invalidFile'));
  }
}

function handleFileDrop(event) {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'application/json') {
      readFileContent(file);
    } else {
      alert(store.t('importModal.invalidDrop'));
    }
  }
}

function handleDragOver(event) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave(event) {
  event.preventDefault();
  isDragOver.value = false;
}

function readFileContent(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      // Validate JSON format before accepting content
      JSON.parse(content);
      jsonInput.value = content;
      currentFilename.value = file.name;
    } catch {
      alert(store.t('importModal.invalidContent'));
    }
  };
  reader.readAsText(file);
}

function triggerFileInput() {
  fileInput.value.click();
}
</script>

<template>
  <TransitionRoot appear :show="store.isImportModalOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="store.closeImportModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="flex items-center text-lg leading-6 font-medium text-gray-900"
              >
                <ArrowDownTrayIcon class="mr-2 h-6 w-6 text-blue-600" />
                {{ store.t('importModal.title') }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ store.t('importModal.description') }}
                </p>
              </div>

              <!-- File selection area -->
              <div class="mt-4">
                <div
                  :class="[
                    'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                  @dragover="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop="handleFileDrop"
                >
                  <DocumentIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="mt-2">
                    <p class="text-sm text-gray-600">
                      {{ store.t('importModal.dragText') }}
                      <button
                        type="button"
                        class="font-medium text-blue-600 hover:text-blue-500"
                        @click="triggerFileInput"
                      >
                        {{ store.t('importModal.clickToSelect') }}
                      </button>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ store.t('importModal.supportedFormat') }}
                    </p>
                  </div>
                </div>
                
                <!-- Hidden file input -->
                <input
                  ref="fileInput"
                  type="file"
                  accept=".json,application/json"
                  class="hidden"
                  @change="handleFileSelect"
                />
              </div>

              <!-- Separator line -->
              <div class="mt-6 flex items-center">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">{{ store.t('importModal.or') }}</span>
                <div class="flex-1 border-t border-gray-300"></div>
              </div>

              <!-- Text input area -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ store.t('importModal.pasteContent') }}
                </label>
                <textarea
                  v-model="jsonInput"
                  class="h-32 w-full rounded-md border border-gray-300 p-3 font-mono text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  :placeholder="store.t('importModal.placeholder')"
                />
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  @click="store.closeImportModal"
                >
                  {{ store.t('importModal.cancel') }}
                </button>
                
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="importJson"
                >
                  {{ store.t('importModal.import') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
