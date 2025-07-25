<template>
  <div class="flex flex-col h-full space-y-4">
    <!-- Variable List for Navigation -->
    <div class="flex-shrink-0 rounded-lg p-2 border border-gray-200">
      <h4 class="font-semibold text-md mb-2 px-2 border-b border-gray-200 pb-1">Variable List</h4>
      <div class="max-h-48 overflow-y-auto">
        <ul class="space-y-1">
          <li v-for="variable in variables" :key="`nav-${variable}`">
            <button
              @click="goToVariableDetails(variable)"
              class="w-full text-left p-2 rounded-md font-mono text-sm transition-colors hover:bg-gray-100 flex items-center justify-between group relative"
            >
              <div class="flex items-center">
                <VariableIcon class="h-4 w-4 mr-2 text-gray-500" />
                <span>{{ variable }}</span>
                <!-- Unused variable icon -->
                <ExclamationCircleIcon
                  v-if="isDefinedButUnused(variable)"
                  v-tooltip="{ content: 'Defined but never referenced', placement: 'top' }"
                  class="h-4 w-4 ml-2 text-yellow-500"
                />
                <QuestionMarkCircleIcon
                  v-if="isUnresolved(variable)"
                  v-tooltip="{ content: 'Referenced but never defined', placement: 'top' }"
                  class="h-4 w-4 ml-2 text-red-500"
                />
              </div>
              <ArrowTopRightOnSquareIcon
                class="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Rename Tool -->
    <div class="flex-grow border border-gray-200 rounded-lg p-3">
      <h4 class="font-semibold text-md mb-2">Rename Variable</h4>
      <div class="space-y-4">
        <Combobox v-model="selectedVariableForRename" nullable>
          <div class="relative">
            <ComboboxLabel class="block text-sm font-medium text-gray-700">
              Variable to Rename
            </ComboboxLabel>
            <div class="relative mt-1">
              <ComboboxInput
                class="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                @change="query = $event.target.value"
                :display-value="(variable) => variable"
                placeholder="Select a variable..."
              />
              <ComboboxButton
                class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
              >
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
              </ComboboxButton>
            </div>
            <transition
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ComboboxOptions
                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              >
                <div
                  v-if="filteredVariables.length === 0 && query !== ''"
                  class="relative cursor-default select-none py-2 px-4 text-gray-700"
                >
                  Nothing found.
                </div>
                <ComboboxOption
                  v-for="variable in filteredVariables"
                  :key="`rename-${variable}`"
                  :value="variable"
                  as="template"
                  v-slot="{ active, selected }"
                >
                  <li
                    :class="[
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      active ? 'bg-blue-600 text-white' : 'text-gray-900',
                    ]"
                  >
                    <span :class="['block truncate', selected ? 'font-medium' : 'font-normal']">
                      {{ variable }}
                    </span>
                    <span
                      v-if="selected"
                      :class="[
                        'absolute inset-y-0 left-0 flex items-center pl-3',
                        active ? 'text-white' : 'text-blue-600',
                      ]"
                    >
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </transition>
          </div>
        </Combobox>

        <div>
          <label for="new-var-name" class="block text-sm font-medium text-gray-700">New Name</label>
          <input
            type="text"
            id="new-var-name"
            v-model="newName"
            :disabled="!selectedVariableForRename"
            placeholder="Enter new name..."
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          @click="executeRename"
          :disabled="!isRenameValid"
          class="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Rename
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue';
import {
  CheckIcon,
  ChevronUpDownIcon,
  VariableIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/solid';

const isDefinedButUnused = (variable) => {
  const info = store.variables[variable];
  return (
    info &&
    info.definedIn &&
    info.definedIn.length > 0 &&
    (!info.referencedIn || info.referencedIn.length === 0)
  );
};

const isUnresolved = (variable) => {
  // store.unresolvedVariables: [{ varName, promptId }]
  return store.unresolvedVariables.some((item) => item.varName === variable);
};

const store = usePresetStore();
const variables = computed(() => store.definedVariables);

// For Rename Tool
const selectedVariableForRename = ref(null);
const newName = ref('');
const query = ref('');

const filteredVariables = computed(() =>
  query.value === ''
    ? variables.value
    : variables.value.filter((variable) =>
        variable.toLowerCase().includes(query.value.toLowerCase()),
      ),
);

const isRenameValid = computed(() => {
  if (!newName.value || !selectedVariableForRename.value) return false;
  const trimmedNewName = newName.value.trim();
  if (trimmedNewName === '') return false;
  if (trimmedNewName.includes(' ')) return false;
  if (store.variables[trimmedNewName] && trimmedNewName !== selectedVariableForRename.value)
    return false;
  return true;
});

const executeRename = () => {
  if (!isRenameValid.value) return;

  const trimmedNewName = newName.value.trim();
  store.renameVariable({
    oldName: selectedVariableForRename.value,
    newName: trimmedNewName,
  });

  selectedVariableForRename.value = trimmedNewName;
  newName.value = '';
  query.value = '';
};

// For Navigation List
const goToVariableDetails = (variable) => {
  console.log(`Navigating to details for variable: ${variable}`);
  store.selectMacro(variable);
  store.setActiveRightSidebarTab('details');
};

watch(selectedVariableForRename, (newVal) => {
  if (!newVal) {
    newName.value = '';
  }
});
</script>
