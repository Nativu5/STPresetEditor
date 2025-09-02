<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline';
import { computed, ref, watch } from 'vue';
import { usePresetStore } from '../stores/presetStore';

const store = usePresetStore();

const finalJson = computed(() => store.finalJson);
const copyButtonText = ref('');
const downloadButtonText = ref('');
const exportFilename = ref('');

// 初始化导出文件名
function initializeExportFilename() {
  exportFilename.value = store.generateExportFilename();
}

// 监听模态框打开状态，自动初始化文件名
watch(() => store.isExportModalOpen, (isOpen) => {
  if (isOpen) {
    initializeExportFilename();
    // 初始化按钮文本
    copyButtonText.value = store.t('exportModal.copy');
    downloadButtonText.value = store.t('exportModal.download');
  }
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(finalJson.value);
    copyButtonText.value = store.t('exportModal.copied');
    window.setTimeout(() => {
      copyButtonText.value = store.t('exportModal.copy');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
    copyButtonText.value = store.t('exportModal.copyFailed');
  }
}

function downloadJsonFile() {
  try {
    const blob = new Blob([finalJson.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename.value || 'preset.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    downloadButtonText.value = store.t('exportModal.downloaded');
    window.setTimeout(() => {
      downloadButtonText.value = store.t('exportModal.download');
    }, 2000);
  } catch (err) {
    console.error('Failed to download: ', err);
    downloadButtonText.value = store.t('exportModal.downloadFailed');
  }
}
</script>

<template>
  <TransitionRoot appear :show="store.isExportModalOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="store.closeExportModal">
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
                <ArrowUpTrayIcon class="mr-2 h-6 w-6 text-green-600" />
                {{ store.t('exportModal.title') }}
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ store.t('exportModal.description') }}
                </p>
              </div>

              <!-- 文件名输入区域 -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ store.t('exportModal.filename') }}
                </label>
                <div class="flex space-x-2">
                  <input
                    v-model="exportFilename"
                    type="text"
                    class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="preset.json"
                  />
                  <button
                    type="button"
                    class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @click="initializeExportFilename"
                  >
                    {{ store.t('exportModal.autoGenerate') }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ store.t('exportModal.filenameHint') }}
                </p>
              </div>

              <div class="mt-4">
                <textarea
                  :value="finalJson"
                  readonly
                  class="h-64 w-full rounded-md border border-gray-300 bg-gray-50 p-3 font-mono text-sm transition focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  @click="store.closeExportModal"
                >
                  {{ store.t('exportModal.cancel') }}
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="downloadJsonFile"
                >
                  <ArrowDownTrayIcon class="mr-2 h-5 w-5" />
                  {{ downloadButtonText }}
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  @click="copyToClipboard"
                >
                  <ClipboardDocumentIcon
                    v-if="copyButtonText === store.t('exportModal.copy')"
                    class="mr-2 h-5 w-5"
                  />
                  <CheckIcon v-else class="mr-2 h-5 w-5" />
                  {{ copyButtonText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
