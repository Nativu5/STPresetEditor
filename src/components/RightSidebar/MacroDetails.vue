<template>
  <div v-if="variableInfo" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Variable</label>
      <div
        class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
      >
        <span class="font-mono text-sm">{{ variableName }}</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">
        Defined In ({{ variableInfo.definedIn.length }})
      </label>
      <div class="mt-1 w-full">
        <ul v-if="variableInfo.definedIn.length > 0" class="space-y-2">
          <li
            v-for="(def, index) in variableInfo.definedIn"
            :key="index"
            class="cursor-pointer rounded-md border border-blue-200 bg-blue-50 p-2 transition-colors hover:bg-blue-100"
            :class="{ '!bg-gray-100 !border-gray-200': !def.enabled }"
            @click="navigateTo(def.promptId)"
          >
            <p class="text-sm font-medium text-blue-800" :class="{ '!text-gray-500': !def.enabled }">
              {{ getPromptName(def.promptId) }}
            </p>
            <p class="font-mono text-xs text-gray-500">
              {{ def.promptId }}
            </p>
          </li>
        </ul>
        <div v-else class="rounded-md border border-red-200 bg-red-50 p-2">
          <p class="text-sm font-medium text-red-700">This variable is not defined anywhere.</p>
        </div>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">
        Referenced In ({{ variableInfo.referencedIn.length }})
      </label>
      <div class="mt-1 w-full">
        <ul v-if="variableInfo.referencedIn.length > 0" class="space-y-2">
          <li
            v-for="(ref, index) in variableInfo.referencedIn"
            :key="index"
            class="cursor-pointer rounded-md border border-green-200 bg-green-50 p-2 transition-colors hover:bg-green-100"
            :class="{ '!bg-gray-100 !border-gray-200': !ref.enabled }"
            @click="navigateTo(ref.promptId)"
          >
            <p class="text-sm font-medium text-green-800" :class="{ '!text-gray-500': !ref.enabled }">
              {{ getPromptName(ref.promptId) }}
            </p>
            <p class="font-mono text-xs text-gray-500">
              {{ ref.promptId }}
            </p>
          </li>
        </ul>
        <p v-else class="mt-1 text-sm text-gray-500 italic">Not referenced by any other prompt.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const store = usePresetStore();

const variableName = computed(() => store.selectedMacro?.variableName);
const variableInfo = computed(() => {
  if (!variableName.value) return null;
  return store.variables[variableName.value] || { definedIn: [], referencedIn: [] };
});

const getPromptName = (promptId) => {
  const prompt = store.getPromptById(promptId);
  return prompt ? prompt.name : 'Unknown Prompt';
};

const navigateTo = (promptId) => {
  store.navigateToPrompt(promptId);
};
</script>
