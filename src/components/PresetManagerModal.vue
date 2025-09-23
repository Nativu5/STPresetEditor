<template>
  <!-- Modal backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="onBackdropClick"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/30 transition-opacity" />
    
    <!-- Modal container -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
        @click.stop
      >
        <!-- Modal header -->
        <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ store.t('presetManager.title') }}
          </h3>
          <div class="flex items-center space-x-2">
            <!-- Import/Export buttons -->
            <button
              @click="openImportModal"
              class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
              {{ store.t('presetManager.import') }}
            </button>
            <button
              @click="openExportModal"
              class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
              {{ store.t('presetManager.export') }}
            </button>
            <button
              @click="closeModal"
              class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <!-- Modal content -->
        <div>
          <!-- Save current preset section -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ store.t('presetManager.saveCurrent') }}</h4>
            <div class="flex items-center space-x-3">
              <div class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {{ store.getCurrentPresetName }}
              </div>
              <button
                @click="saveCurrentPreset"
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <BookmarkIcon class="h-4 w-4 mr-2" />
                {{ store.t('presetManager.save') }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ store.t('presetManager.autoNameNote') }}</p>
          </div>

          <!-- Factory settings management -->
          <div class="mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ store.t('presetManager.factorySettings.title') }}</h4>
            <div class="flex items-center space-x-3">
              <button
                @click="saveFactoryAsDefault"
                class="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <BookmarkIcon class="h-4 w-4 mr-2" />
                {{ store.t('presetManager.factorySettings.addDefaultPreset') }}
              </button>
              <button
                @click="loadDefaultPreset"
                :disabled="!store.defaultPresetId"
                class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                {{ store.t('presetManager.factorySettings.loadDefaultPreset') }}
              </button>
            </div>
          </div>

          <!-- Saved presets list -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-900">{{ store.t('presetManager.savedPresets') }}</h4>
              <div class="flex items-center space-x-2">
                <!-- Search input -->
                <div class="relative">
                  <input
                    v-model="presetSearchTerm"
                    type="text"
                    :placeholder="store.t('presetManager.searchPlaceholder')"
                    class="w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <!-- Sort dropdown -->
                <select
                  v-model="presetSortBy"
                  class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="updated">{{ store.t('presetManager.sortByUpdated') }}</option>
                  <option value="created">{{ store.t('presetManager.sortByCreated') }}</option>
                  <option value="name">{{ store.t('presetManager.sortByName') }}</option>
                </select>
                <!-- Multi-select toggle -->
                <button
                  @click="togglePresetMultiSelect"
                  :class="[
                    'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1',
                    store.presetMultiSelectActive
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                  ]"
                >
                  {{ store.t('presetManager.multiSelect') }}
                </button>
              </div>
            </div>

            <!-- Multi-select controls -->
            <div v-if="store.presetMultiSelectActive" class="mb-3 flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div class="flex items-center space-x-2">
                <button
                  @click="selectAllPresets"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  {{ store.t('presetManager.selectAll') }}
                </button>
                <span class="text-gray-400">|</span>
                <button
                  @click="deselectAllPresets"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  {{ store.t('presetManager.deselectAll') }}
                </button>
                <span v-if="store.selectedPresetsCount > 0" class="text-sm text-gray-600">
                  ({{ store.selectedPresetsCount }} {{ store.t('presetManager.selected') }})
                </span>
              </div>
              <button
                v-if="store.selectedPresets.size > 0"
                @click="deleteSelectedPresets"
                class="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                <TrashIcon class="h-4 w-4 mr-1" />
                {{ store.t('presetManager.deleteSelected') }}
              </button>
            </div>

            <div v-if="store.savedPresetsList.length === 0" class="text-center py-8 text-gray-500">
              {{ store.t('presetManager.noPresets') }}
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="preset in store.savedPresetsList"
                :key="preset.id"
                class="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                :class="{ 
                  'bg-blue-50 border-blue-200': preset.id === store.currentPresetId,
                  'bg-yellow-50 border-yellow-200': store.presetMultiSelectActive && store.isPresetSelected(preset.id)
                }"
              >
                <div class="flex items-center flex-1">
                  <!-- Multi-select checkbox -->
                  <div v-if="store.presetMultiSelectActive" class="mr-3">
                    <input
                      type="checkbox"
                      :checked="store.isPresetSelected(preset.id)"
                      @change="togglePresetSelection(preset.id)"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center">
                      <h5 class="text-sm font-medium text-gray-900">{{ preset.name }}</h5>
                      <span v-if="preset.id === store.currentPresetId" class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {{ store.t('presetManager.current') }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ store.t('presetManager.created') }}: {{ formatDate(preset.createdAt) }}
                      {{ store.t('presetManager.updated') }}: {{ formatDate(preset.updatedAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="loadPreset(preset.id)"
                    :disabled="preset.id === store.currentPresetId"
                    class="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon class="h-3 w-3 mr-1" />
                    {{ store.t('presetManager.load') }}
                  </button>
                  <button
                    @click="startRename(preset)"
                    class="inline-flex items-center rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                  >
                    <PencilIcon class="h-3 w-3 mr-1" />
                    {{ store.t('presetManager.rename') }}
                  </button>
                  <button
                    @click="duplicatePreset(preset)"
                    class="inline-flex items-center rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                  >
                    <DocumentDuplicateIcon class="h-3 w-3 mr-1" />
                    {{ store.t('presetManager.duplicate') }}
                  </button>
                  <button
                    @click="deletePreset(preset.id)"
                    class="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  >
                    <TrashIcon class="h-3 w-3 mr-1" />
                    {{ store.t('presetManager.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal footer -->
        <div class="border-t border-gray-200 pt-6 mt-6">
          <div class="flex justify-end">
            <button
              @click="closeModal"
              class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {{ store.t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rename modal -->
    <div v-if="isRenameModalOpen" class="fixed inset-0 z-60 overflow-y-auto" @click.stop>
      <div class="fixed inset-0 bg-black/30 transition-opacity"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ store.t('presetManager.renamePreset') }}</h3>
            <input
              v-model="renameValue"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              @keyup.enter="confirmRename"
              @keyup.escape="cancelRename"
              ref="renameInput"
            />
          </div>
          <div class="border-t border-gray-200 pt-6 mt-6 flex justify-end space-x-3">
            <button
              @click="cancelRename"
              class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {{ store.t('presetManager.cancel') }}
            </button>
            <button
              @click="confirmRename"
              class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {{ store.t('presetManager.rename') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    BookmarkIcon,
    DocumentDuplicateIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/vue/24/outline';
import { nextTick, ref, watch } from 'vue';
import { usePresetStore } from '../stores/presetStore';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const store = usePresetStore();

const isRenameModalOpen = ref(false);
const renameValue = ref('');
const renamePresetId = ref(null);
const renameInput = ref(null);

// Preset management reactive variables
const presetSearchTerm = ref('');
const presetSortBy = ref('updated');

const closeModal = () => {
  store.closePresetManager();
};

const openImportModal = () => {
  store.openImportModal();
};

const openExportModal = () => {
  store.openExportModal();
};

const saveCurrentPreset = () => {
  store.savePreset();
};

const saveFactoryAsDefault = () => {
  store.saveFactorySettingsAsDefault();
};

const loadDefaultPreset = () => {
  if (store.loadDefaultPreset()) {
    closeModal();
  }
};

const loadPreset = (presetId) => {
  if (store.loadPreset(presetId)) {
    closeModal();
  }
};

const startRename = (preset) => {
  renamePresetId.value = preset.id;
  renameValue.value = preset.name;
  isRenameModalOpen.value = true;
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
};

const confirmRename = () => {
  if (renameValue.value.trim() && renamePresetId.value) {
    store.updatePreset(renamePresetId.value, renameValue.value.trim());
    cancelRename();
  }
};

const cancelRename = () => {
  isRenameModalOpen.value = false;
  renameValue.value = '';
  renamePresetId.value = null;
};

const duplicatePreset = (preset) => {
  const newName = `${preset.name} (${store.t('presetManager.copy')})`;
  store.duplicatePreset(preset.id, newName);
};

const deletePreset = (presetId) => {
  if (window.confirm(store.t('presetManager.deleteConfirm'))) {
    store.deletePreset(presetId);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Preset management methods
const togglePresetMultiSelect = () => {
  store.togglePresetMultiSelect();
};

const togglePresetSelection = (presetId) => {
  store.togglePresetSelection(presetId);
};

const selectAllPresets = () => {
  store.selectAllPresets();
};

const deselectAllPresets = () => {
  store.deselectAllPresets();
};

const deleteSelectedPresets = () => {
  store.deleteSelectedPresets();
};

// Backdrop click handler: ignore close when renaming dialog is open
const onBackdropClick = () => {
  if (isRenameModalOpen.value) return;
  closeModal();
};

// Watch for search and sort changes
watch(presetSearchTerm, (newValue) => {
  store.setPresetSearchTerm(newValue);
});

watch(presetSortBy, (newValue) => {
  store.setPresetSortBy(newValue);
});
</script>
