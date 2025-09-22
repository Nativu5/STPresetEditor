<template>
  <!-- Embedded inline panel for right-pane overlay -->
  <div v-if="embedded" class="h-full flex flex-col space-y-2">
    <TabGroup>
      <TabList class="flex flex-shrink-0 space-x-1 rounded-xl bg-gray-200 p-1">
        <Tab v-for="tab in tabs" :key="tab.key" v-slot="{ selected }" as="template">
          <button
            :class="[
              'w-full rounded-lg py-2 text-sm leading-5 font-medium',
              'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:ring-2 focus:outline-none',
              selected ? 'bg-white text-blue-700 shadow' : 'text-blue-700/60 hover:text-blue-700',
            ]"
          >
            <component v-if="tab.icon" :is="tab.icon" class="-mt-0.5 mr-1.5 inline-block h-5 w-5" />
            {{ tab.label }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="rounded-xl bg-white shadow-sm">
        <!-- Replace tab -->
        <TabPanel :key="'replace'" class="p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ store.t('batchReplaceModal.find') }}</label>
              <input v-model="form.find" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ store.t('batchReplaceModal.replaceWith') }}</label>
              <input v-model="form.replace" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-4">
              <div>
                <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.targetFields') }}</div>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="form.targetFields.title" />
                    <span>{{ store.t('batchReplaceModal.fieldTitle') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="form.targetFields.content" />
                    <span>{{ store.t('batchReplaceModal.fieldContent') }}</span>
                  </label>
                </div>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.scope') }}</div>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="scope" value="selected" v-model="form.scope" :disabled="!store.isEditorMultiSelectActive || store.selectedEditorPrompts.length === 0" />
                    <span :class="{ 'text-gray-400': !store.isEditorMultiSelectActive || store.selectedEditorPrompts.length === 0 }">{{ store.t('batchReplaceModal.scopeSelected') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="scope" value="all" v-model="form.scope" />
                    <span>{{ store.t('batchReplaceModal.scopeAll') }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.options') }}</div>
              <div class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="form.useRegex" />
                  <span>{{ store.t('batchReplaceModal.useRegex') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="form.caseSensitive" />
                  <span>{{ store.t('batchReplaceModal.caseSensitive') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="form.wholeWord" :disabled="form.useRegex" />
                  <span :class="{ 'text-gray-400': form.useRegex }">{{ store.t('batchReplaceModal.wholeWord') }}</span>
                </label>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Additions tab -->
        <TabPanel :key="'additions'" class="p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addPrefix') }}</div>
              <div class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="form.addPrefix" />
                  <span>{{ store.t('batchReplaceModal.addPrefix') }}</span>
                </label>
                <input
                  v-model="form.prefixText"
                  type="text"
                  :placeholder="store.t('batchReplaceModal.prefixText')"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  :disabled="!form.addPrefix"
                />
              </div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addSuffix') }}</div>
              <div class="space-y-2">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="form.addSuffix" />
                  <span>{{ store.t('batchReplaceModal.addSuffix') }}</span>
                </label>
                <input
                  v-model="form.suffixText"
                  type="text"
                  :placeholder="store.t('batchReplaceModal.suffixText')"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  :disabled="!form.addSuffix"
                />
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addSerial') }}</div>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="form.addSerial" />
                <span>{{ store.t('batchReplaceModal.addSerial') }}</span>
              </label>
              <div class="flex items-center space-x-4" :class="{ 'opacity-50': !form.addSerial }">
                <label class="flex items-center space-x-2">
                  <input type="radio" name="serialPosition" value="before" v-model="form.serialPosition" :disabled="!form.addSerial" />
                  <span>{{ store.t('batchReplaceModal.serialBefore') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="radio" name="serialPosition" value="after" v-model="form.serialPosition" :disabled="!form.addSerial" />
                  <span>{{ store.t('batchReplaceModal.serialAfter') }}</span>
                </label>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">{{ store.t('batchReplaceModal.serialStart') }}</label>
                  <input
                    v-model.number="form.serialStart"
                    type="number"
                    min="0"
                    class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    :disabled="!form.addSerial"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">{{ store.t('batchReplaceModal.serialDigits') }}</label>
                  <input
                    v-model.number="form.serialDigits"
                    type="number"
                    min="1"
                    class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    :disabled="!form.addSerial"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>

    <div class="mt-2 text-xs text-gray-500" v-if="errorMessage">{{ errorMessage }}</div>
    <div class="mt-2 text-xs text-gray-600" v-if="resultMessage">{{ resultMessage }}</div>

    <div class="mt-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 disabled:text-gray-400"
          :disabled="!store.canUndoBatchReplace"
          @click="onUndo"
        >
          {{ store.t('batchReplaceModal.undo') }}
        </button>
        <button
          type="button"
          class="inline-flex justify-center rounded-md border border-transparent bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 disabled:text-gray-400"
          :disabled="!store.canRedoBatchReplace"
          @click="onRedo"
        >
          {{ store.t('batchReplaceModal.redo') }}
        </button>
      </div>
      <div class="flex space-x-3">
        <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2" @click="store.closeBatchReplaceModal()">
          {{ store.t('batchReplaceModal.cancel') }}
        </button>
        <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" @click="onReplace">
          {{ store.t('batchReplaceModal.replace') }}
        </button>
      </div>
    </div>
  </div>

  <!-- Fallback: original centered dialog -->
  <TransitionRoot v-else appear :show="store.isBatchReplaceModalOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="store.closeBatchReplaceModal()">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                {{ store.t('batchReplaceModal.title') }}
                <span class="ml-2 align-middle text-xs text-gray-500" v-if="store.isEditorMultiSelectActive">
                  ({{ store.selectedEditorPrompts.length }})
                </span>
              </DialogTitle>

              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ store.t('batchReplaceModal.find') }}</label>
                  <input v-model="form.find" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ store.t('batchReplaceModal.replaceWith') }}</label>
                  <input v-model="form.replace" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-4">
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.targetFields') }}</div>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.targetFields.title" />
                      <span>{{ store.t('batchReplaceModal.fieldTitle') }}</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.targetFields.content" />
                      <span>{{ store.t('batchReplaceModal.fieldContent') }}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.scope') }}</div>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="radio" name="scope" value="selected" v-model="form.scope" :disabled="!store.isEditorMultiSelectActive || store.selectedEditorPrompts.length === 0" />
                      <span :class="{ 'text-gray-400': !store.isEditorMultiSelectActive || store.selectedEditorPrompts.length === 0 }">{{ store.t('batchReplaceModal.scopeSelected') }}</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="radio" name="scope" value="all" v-model="form.scope" />
                      <span>{{ store.t('batchReplaceModal.scopeAll') }}</span>
                    </label>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.options') }}</div>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.useRegex" />
                      <span>{{ store.t('batchReplaceModal.useRegex') }}</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.caseSensitive" />
                      <span>{{ store.t('batchReplaceModal.caseSensitive') }}</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.wholeWord" :disabled="form.useRegex" />
                      <span :class="{ 'text-gray-400': form.useRegex }">{{ store.t('batchReplaceModal.wholeWord') }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addPrefix') }}</div>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.addPrefix" />
                      <span>{{ store.t('batchReplaceModal.addPrefix') }}</span>
                    </label>
                    <input
                      v-model="form.prefixText"
                      type="text"
                      :placeholder="store.t('batchReplaceModal.prefixText')"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      :disabled="!form.addPrefix"
                    />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addSuffix') }}</div>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-2">
                      <input type="checkbox" v-model="form.addSuffix" />
                      <span>{{ store.t('batchReplaceModal.addSuffix') }}</span>
                    </label>
                    <input
                      v-model="form.suffixText"
                      type="text"
                      :placeholder="store.t('batchReplaceModal.suffixText')"
                      class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      :disabled="!form.addSuffix"
                    />
                  </div>
                </div>
              </div>

              <!-- Serial section as a full-width row -->
              <div class="mt-4">
                <div class="text-sm font-medium text-gray-700 mb-2">{{ store.t('batchReplaceModal.addSerial') }}</div>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="form.addSerial" />
                    <span>{{ store.t('batchReplaceModal.addSerial') }}</span>
                  </label>
                  <div class="flex items-center space-x-4" :class="{ 'opacity-50': !form.addSerial }">
                    <label class="flex items-center space-x-2">
                      <input type="radio" name="serialPosition" value="before" v-model="form.serialPosition" :disabled="!form.addSerial" />
                      <span>{{ store.t('batchReplaceModal.serialBefore') }}</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="radio" name="serialPosition" value="after" v-model="form.serialPosition" :disabled="!form.addSerial" />
                      <span>{{ store.t('batchReplaceModal.serialAfter') }}</span>
                    </label>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">{{ store.t('batchReplaceModal.serialStart') }}</label>
                      <input
                        v-model.number="form.serialStart"
                        type="number"
                        min="0"
                        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        :disabled="!form.addSerial"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">{{ store.t('batchReplaceModal.serialDigits') }}</label>
                      <input
                        v-model.number="form.serialDigits"
                        type="number"
                        min="1"
                        class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        :disabled="!form.addSerial"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-2 text-xs text-gray-500" v-if="errorMessage">{{ errorMessage }}</div>
              <div class="mt-2 text-xs text-gray-600" v-if="resultMessage">{{ resultMessage }}</div>

              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2" @click="store.closeBatchReplaceModal()">
                  {{ store.t('batchReplaceModal.cancel') }}
                </button>
                <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" @click="onReplace">
                  {{ store.t('batchReplaceModal.replace') }}
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
import { Dialog, DialogPanel, DialogTitle, Tab, TabGroup, TabList, TabPanel, TabPanels, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { reactive, ref } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
const props = defineProps({ embedded: { type: Boolean, default: false } });

const store = usePresetStore();

const tabs = [
  { key: 'replace', label: store.t('batchReplaceModal.title'), icon: null },
  { key: 'additions', label: store.t('batchReplaceModal.additionsSection'), icon: null },
];

const form = reactive({
  find: '',
  replace: '',
  targetFields: { title: true, content: true },
  scope: 'selected',
  useRegex: false,
  caseSensitive: false,
  wholeWord: false,
  addPrefix: false,
  prefixText: '',
  addSuffix: false,
  suffixText: '',
  addSerial: false,
  serialPosition: 'before',
  serialStart: 1,
  serialDigits: 2,
});

const errorMessage = ref('');
const resultMessage = ref('');

function onReplace() {
  errorMessage.value = '';
  resultMessage.value = '';
  const hasFind = Boolean(form.find);
  const hasAdditions = form.addPrefix || form.addSuffix || form.addSerial;
  if (!hasFind && !hasAdditions) {
    errorMessage.value = store.t('batchReplaceModal.noMatches');
    return;
  }
  if (!form.targetFields.title && !form.targetFields.content) {
    errorMessage.value = store.t('batchReplaceModal.noMatches');
    return;
  }
  // If scope is selected but none selected, show noMatches and stop
  if (form.scope === 'selected' && store.selectedEditorPrompts.length === 0) {
    resultMessage.value = store.t('batchReplaceModal.noMatches');
    return;
  }
  try {
    const summary = store.batchReplaceText({
      find: form.find,
      replace: form.replace,
      targetFields: { ...form.targetFields },
      scope: form.scope,
      useRegex: form.useRegex,
      caseSensitive: form.caseSensitive,
      wholeWord: form.wholeWord,
      addPrefix: form.addPrefix,
      prefixText: form.prefixText,
      addSuffix: form.addSuffix,
      suffixText: form.suffixText,
      addSerial: form.addSerial,
      serialPosition: form.serialPosition,
      serialStart: form.serialStart,
      serialDigits: form.serialDigits,
    });
    resultMessage.value = store.t('batchReplaceModal.resultSummary2', {
        matches: summary.matches,
        prompts: summary.prompts,
      });
  } catch (e) {
    if (e && e.message === 'INVALID_REGEX') {
      errorMessage.value = store.t('batchReplaceModal.invalidRegex');
    }
  }
}

function onUndo() {
  const result = store.undoLastBatchChange();
  if (result && result.prompts >= 0) {
    resultMessage.value = store.t('batchReplaceModal.resultSummary', {
      matches: 0,
      prompts: result.prompts,
    });
    errorMessage.value = '';
  }
}

function onRedo() {
  const result = store.redoLastBatchChange();
  if (result && result.prompts >= 0) {
    resultMessage.value = store.t('batchReplaceModal.resultSummary', {
      matches: 0,
      prompts: result.prompts,
    });
    errorMessage.value = '';
  }
}
</script>


