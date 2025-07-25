<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
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
                Export to JSON
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  The generated JSON below reflects all your changes. Use the button to copy it.
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
                  @click="closeModal"
                >
                  Close
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  @click="copyToClipboard"
                >
                  <ClipboardDocumentIcon
                    v-if="copyButtonText === 'Copy to Clipboard'"
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

<script setup>
import { computed, ref } from 'vue';
import { usePresetStore } from '../stores/presetStore';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { ArrowUpTrayIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline';

defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close']);
const store = usePresetStore();

const finalJson = computed(() => store.finalJson);
const copyButtonText = ref('Copy to Clipboard');

function closeModal() {
  emit('close');
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(finalJson.value);
    copyButtonText.value = 'Copied!';
    window.setTimeout(() => {
      copyButtonText.value = 'Copy to Clipboard';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
    copyButtonText.value = 'Failed to copy';
  }
}
</script>
