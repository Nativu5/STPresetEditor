<template>
  <!-- Modal backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/30 transition-opacity" />
    
    <!-- Modal container -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-0 shadow-2xl ring-1 ring-black/5 transition-all"
        @click.stop
      >
        <!-- Modal header -->
        <div class="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-900">
            {{ store.t('settings.title') }}
          </h3>
          <button
            class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="closeModal"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        
        <!-- Modal content -->
        <div class="px-6 py-6">
          <div class="divide-y divide-gray-200">
            <!-- Language Setting -->
            <div class="pb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ store.t('toolbar.settings') }} - Language</label>
              <div class="flex items-center space-x-2">
                <button
                  class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium"
                  :class="store.currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  @click="switchLanguage('en')"
                >EN</button>
                <button
                  class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium"
                  :class="store.currentLanguage === 'cn' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  @click="switchLanguage('cn')"
                >中文</button>
              </div>
            </div>

            <!-- Delete Confirmation Setting -->
            <div class="py-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  :checked="!store.skipDeleteConfirmation"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @change="toggleDeleteConfirmation"
                />
                <span class="ml-3 text-sm font-medium text-gray-700">
                  {{ store.t('settings.showDeleteConfirmation') }}
                </span>
              </label>
              <p class="mt-1 text-xs text-gray-500">
                {{ store.t('settings.showDeleteConfirmationNote') }}
              </p>
            </div>

            <!-- Reset to Factory Default -->
            <div class="pt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ store.t('toolbar.resetToDefault') }}</label>
              <button
                class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                @click="onResetToDefault"
              >{{ store.t('toolbar.reset') }}</button>
              <p class="mt-2 text-xs text-gray-500">{{ store.t('reset.confirm') }}</p>
            </div>
          </div>
        </div>
        
        <!-- Modal footer -->
        <div class="border-t border-gray-200 px-6 py-4">
          <div class="flex justify-end">
            <button
              class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="closeModal"
            >
              {{ store.t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import { usePresetStore } from '../stores/presetStore';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const store = usePresetStore();
const router = useRouter();

const closeModal = () => {
  store.closeSettingsModal();
};

const toggleDeleteConfirmation = (event) => {
  store.setSkipDeleteConfirmation(!event.target.checked);
};

const switchLanguage = (language) => {
  router.push(`/${language}`);
};

const onResetToDefault = () => {
  if (window.confirm(store.t('reset.confirm'))) {
    store.resetToFactoryDefault();
    store.closeSettingsModal();
  }
};
</script>
