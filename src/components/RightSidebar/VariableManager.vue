<template>
  <div class="flex h-full flex-col space-y-4">
    <!-- Variable List for Navigation -->
    <div class="flex-shrink-0 rounded-lg border border-gray-200 p-2">
      <h4 class="mb-2 border-b border-gray-200 px-2 pb-1 text-base font-semibold">Variable List</h4>
      <div class="max-h-48 overflow-y-auto">
        <ul class="space-y-1">
          <li v-for="variable in variables" :key="`nav-${variable}`">
            <button
              class="group relative flex w-full items-center justify-between rounded-md p-2 text-left font-mono text-sm transition-colors hover:bg-gray-100"
              @click="goToVariableDetails(variable)"
            >
              <div class="flex items-center">
                <VariableIcon class="mr-2 h-4 w-4 text-gray-500" />
                <span>{{ variable }}</span>
                <!-- Unused variable icon -->
                <ExclamationCircleIcon
                  v-if="isDefinedButUnused(variable)"
                  v-tooltip="{ content: 'Defined but never referenced', placement: 'top' }"
                  class="ml-2 h-4 w-4 text-yellow-500"
                />
                <QuestionMarkCircleIcon
                  v-if="isUnresolved(variable)"
                  v-tooltip="{ content: 'Referenced but never defined', placement: 'top' }"
                  class="ml-2 h-4 w-4 text-red-500"
                />
              </div>
              <ArrowTopRightOnSquareIcon
                class="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Rename Tool -->
    <div class="flex-grow rounded-lg border border-gray-200 p-3">
      <h4 class="mb-2 text-base font-semibold">Rename Variable</h4>
      <div class="space-y-4">
        <Combobox v-model="selectedVariableForRename" nullable>
          <div class="relative">
            <ComboboxLabel class="block text-sm font-medium text-gray-700">
              Variable to Rename
            </ComboboxLabel>
            <div class="relative mt-1">
              <ComboboxInput
                class="w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                :display-value="(variable) => variable"
                placeholder="Select a variable..."
                @change="query = $event.target.value"
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
                  class="relative cursor-default px-4 py-2 text-gray-700 select-none"
                >
                  Nothing found.
                </div>
                <ComboboxOption
                  v-for="variable in filteredVariables"
                  :key="`rename-${variable}`"
                  v-slot="{ active, selected }"
                  :value="variable"
                  as="template"
                >
                  <li
                    :class="[
                      'relative cursor-default py-2 pr-4 pl-10 select-none',
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
            id="new-var-name"
            v-model="newName"
            type="text"
            :disabled="!selectedVariableForRename"
            placeholder="Enter new name..."
            class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
          />
        </div>

        <button
          :disabled="!isRenameValid"
          class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          @click="executeRename"
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
