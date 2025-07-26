<script setup>
import { ref } from 'vue';
import { usePresetStore } from '../stores/presetStore';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline';

const store = usePresetStore();
const jsonInput = ref('');

function importJson() {
  store.importNewJson(jsonInput.value);
  store.closeImportModal();
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
                Import from JSON
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Paste the entire content of your `preset.json` file into the text area below.
                </p>
              </div>

              <div class="mt-4">
                <textarea
                  v-model="jsonInput"
                  class="h-64 w-full rounded-md border border-gray-300 p-3 font-mono text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder='{&#10;  "prompts": [...],&#10;  "prompt_order": [...]&#10;}'
                />
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  @click="store.closeImportModal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="importJson"
                >
                  Import Preset
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
