<template>
  <div v-if="variableInfo" class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">{{ store.t('macroDetails.title') }}</h3>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">{{ store.t('macroDetails.variable') }}</label>
      <div
        class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
      >
        <span class="font-mono text-sm">{{ variableName }}</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">
        {{ store.t('macroDetails.definedIn') }} ({{ variableInfo.definedIn.length }})
      </label>
      <div class="mt-1 w-full">
        <ul v-if="variableInfo.definedIn.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
          <li
            v-for="(def, index) in variableInfo.definedIn"
            :key="index"
            class="cursor-pointer rounded-md border border-blue-200 bg-blue-50 p-2 transition-colors hover:bg-blue-100"
            :class="{ '!border-gray-200 !bg-gray-100': !def.enabled }"
            @click="navigateTo(def.promptId)"
          >
            <p
              class="text-sm font-medium text-blue-800"
              :class="{ '!text-gray-500': !def.enabled }"
            >
              {{ getPromptName(def.promptId) }}
            </p>
            <p class="font-mono text-xs text-gray-500">
              {{ def.promptId }}
            </p>
          </li>
        </ul>
        <div v-else class="rounded-md border border-red-200 bg-red-50 p-2">
          <p class="text-sm font-medium text-red-700">{{ store.t('macroDetails.notDefinedAnywhere') }}</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ store.t('macroDetails.referencedIn') }} ({{ variableInfo.referencedIn.length }})
        </label>
        <button
          @click="store.openDetailsModal()"
          class="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          <ArrowsPointingOutIcon class="h-3 w-3 mr-1.5" />
          {{ store.t('macroDetails.expand') }}
        </button>
      </div>
      <div class="w-full">
        <ul v-if="variableInfo.referencedIn.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
          <li
            v-for="(ref, index) in variableInfo.referencedIn"
            :key="index"
            class="cursor-pointer rounded-md border border-green-200 bg-green-50 p-2 transition-colors hover:bg-green-100"
            :class="{ '!border-gray-200 !bg-gray-100': !ref.enabled }"
            @click="navigateTo(ref.promptId)"
          >
            <p
              class="text-sm font-medium text-green-800"
              :class="{ '!text-gray-500': !ref.enabled }"
            >
              {{ getPromptName(ref.promptId) }}
            </p>
            <p class="font-mono text-xs text-gray-500">
              {{ ref.promptId }}
            </p>
          </li>
        </ul>
        <p v-else class="mt-1 text-sm text-gray-500 italic">{{ store.t('macroDetails.notReferencedByAnyPrompt') }}</p>
      </div>
    </div>

    <!-- Details Modal -->
    <DetailsModal
      :is-open="store.isDetailsModalOpen"
      :title="`${store.t('macroDetails.title')} - ${variableName}`"
    >
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ store.t('macroDetails.variable') }}</label>
          <div
            class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
          >
            <span class="font-mono text-lg">{{ variableName }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            {{ store.t('macroDetails.definedIn') }} ({{ variableInfo.definedIn.length }})
          </label>
          <div class="mt-1 w-full">
            <ul v-if="variableInfo.definedIn.length > 0" class="space-y-3">
              <li
                v-for="(def, index) in variableInfo.definedIn"
                :key="index"
                class="cursor-pointer rounded-md border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                :class="{ '!border-gray-200 !bg-gray-100': !def.enabled }"
                @click="navigateTo(def.promptId)"
              >
                <p
                  class="text-sm font-medium text-blue-800"
                  :class="{ '!text-gray-500': !def.enabled }"
                >
                  {{ getPromptName(def.promptId) }}
                </p>
                <p class="font-mono text-xs text-gray-500">
                  {{ def.promptId }}
                </p>
              </li>
            </ul>
            <div v-else class="rounded-md border border-red-200 bg-red-50 p-3">
              <p class="text-sm font-medium text-red-700">{{ store.t('macroDetails.notDefinedAnywhere') }}</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            {{ store.t('macroDetails.referencedIn') }} ({{ variableInfo.referencedIn.length }})
          </label>
          <div class="mt-1 w-full">
            <ul v-if="variableInfo.referencedIn.length > 0" class="space-y-3">
              <li
                v-for="(ref, index) in variableInfo.referencedIn"
                :key="index"
                class="cursor-pointer rounded-md border border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100"
                :class="{ '!border-gray-200 !bg-gray-100': !ref.enabled }"
                @click="navigateTo(ref.promptId)"
              >
                <p
                  class="text-sm font-medium text-green-800"
                  :class="{ '!text-gray-500': !ref.enabled }"
                >
                  {{ getPromptName(ref.promptId) }}
                </p>
                <p class="font-mono text-xs text-gray-500">
                  {{ ref.promptId }}
                </p>
              </li>
            </ul>
            <p v-else class="mt-1 text-sm text-gray-500 italic">{{ store.t('macroDetails.notReferencedByAnyPrompt') }}</p>
          </div>
        </div>
      </div>
    </DetailsModal>
  </div>
</template>

<script setup>
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import DetailsModal from '../DetailsModal.vue';

const store = usePresetStore();

const variableName = computed(() => store.selectedMacro?.variableName);
const variableInfo = computed(() => {
  if (!variableName.value) return null;
  return store.variables[variableName.value] || { definedIn: [], referencedIn: [] };
});

const getPromptName = (promptId) => {
  const prompt = store.getPromptById(promptId);
  return prompt ? prompt.name : store.t('macroDetails.unknownPrompt');
};

const navigateTo = (promptId) => {
  store.navigateToPrompt(promptId);
};
</script>
