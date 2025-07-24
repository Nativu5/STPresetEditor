<template>
  <div class="flex flex-col h-full">
    <!-- Variable List -->
    <div class="flex-grow overflow-y-auto border-b mb-4">
        <ul class="space-y-1">
            <li v-for="variable in variables" :key="variable">
                <button @click="selectVariable(variable)" class="w-full text-left p-2 rounded-md hover:bg-gray-100 font-mono text-sm">
                    {{ variable }}
                </button>
            </li>
        </ul>
    </div>

    <!-- Rename Tool -->
    <div class="flex-shrink-0">
        <h4 class="font-semibold text-md mb-2">Rename Variable</h4>
        <div v-if="selectedVariable">
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Current Name</label>
                    <input type="text" :value="selectedVariable" readonly class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed">
                </div>
                <div>
                    <label for="new-var-name" class="block text-sm font-medium text-gray-700">New Name</label>
                    <input 
                        type="text" 
                        id="new-var-name"
                        v-model="newName"
                        placeholder="Enter new name..."
                        class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                    >
                </div>
                <button @click="executeRename" :disabled="!isRenameValid" class="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    Rename
                </button>
            </div>
        </div>
        <div v-else>
            <p class="text-sm text-gray-500 italic">Select a variable from the list above to rename it.</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const store = usePresetStore();
const variables = computed(() => store.definedVariables);

const selectedVariable = ref(null);
const newName = ref('');

const isRenameValid = computed(() => {
    if (!newName.value || !selectedVariable.value) return false;
    if (newName.value.includes(' ')) return false; // No spaces allowed
    if (store.variables[newName.value]) return false; // Must not conflict with existing variables
    return true;
});

const selectVariable = (variable) => {
    selectedVariable.value = variable;
    newName.value = ''; // Reset input on new selection
};

const executeRename = () => {
    if (!isRenameValid.value) return;
    const success = store.renameVariable({
        oldName: selectedVariable.value,
        newName: newName.value
    });
    if (success) {
        selectedVariable.value = newName.value; // Update selection to the new name
        newName.value = '';
    }
};

// When the user clicks a variable in the list, also switch to the details tab to show its usage
watch(selectedVariable, (newSelection) => {
    if (newSelection) {
        store.selectMacro(newSelection);
        store.setActiveRightSidebarTab('details');
    }
});

</script>