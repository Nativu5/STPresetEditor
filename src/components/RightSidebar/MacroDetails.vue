<template>
  <div v-if="variableInfo" class="space-y-4">
    <div>
      <h3 class="text-lg font-bold mb-2">Variable: <span class="font-mono bg-gray-200 px-2 py-1 rounded">{{ variableName }}</span></h3>
    </div>
    
    <div>
      <h4 class="font-semibold text-md mb-2">Defined In:</h4>
      <div v-if="variableInfo.definedIn" class="p-2 bg-blue-50 rounded-md border border-blue-200">
        <p class="text-sm font-medium">{{ getPromptName(variableInfo.definedIn) }}</p>
        <p class="text-xs text-gray-500">ID: {{ variableInfo.definedIn }}</p>
      </div>
      <div v-else class="p-2 bg-red-50 rounded-md border border-red-200">
        <p class="text-sm font-medium text-red-700">This variable is not defined anywhere.</p>
      </div>
    </div>

    <div>
      <h4 class="font-semibold text-md mb-2">Referenced In ({{ variableInfo.referencedIn.length }}):</h4>
      <ul v-if="variableInfo.referencedIn.length > 0" class="space-y-2">
        <li v-for="(refId, index) in variableInfo.referencedIn" :key="index" class="p-2 bg-green-50 rounded-md border border-green-200">
          <p class="text-sm font-medium">{{ getPromptName(refId) }}</p>
          <p class="text-xs text-gray-500">ID: {{ refId }}</p>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-500 italic">Not referenced by any other prompt.</p>
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
  return store.variables[variableName.value] || { definedIn: null, referencedIn: [] };
});

const getPromptName = (promptId) => {
  const prompt = store.getPromptById(promptId);
  return prompt ? prompt.name : 'Unknown Prompt';
};

</script>
