<template>
  <div v-if="prompt" class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">{{ store.t('promptDetails.title') }}</h3>
    </div>

    <div>
      <label for="prompt-name" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.name') }}</label>
      <input
        id="prompt-name"
        type="text"
        :value="prompt.name"
        class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
        @input="updateDetail('name', $event.target.value)"
      />
    </div>
    <div>
      <label for="prompt-id" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.identifier') }}</label>
      <input
        id="prompt-id"
        type="text"
        :value="prompt.identifier"
        readonly
        class="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm"
      />
    </div>
    <div>
      <div class="flex items-center justify-between mb-2">
        <label for="prompt-content" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.content') }}</label>
        <button
          @click="store.openDetailsModal()"
          class="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        >
          <ArrowsPointingOutIcon class="h-3 w-3 mr-1.5" />
          {{ store.t('promptDetails.expand') }}
        </button>
      </div>
      <textarea
        id="prompt-content"
        :value="prompt.content"
        :readonly="prompt.marker"
        :class="{
          'cursor-not-allowed bg-gray-100': prompt.marker,
          'bg-white': !prompt.marker,
        }"
        ref="contentTextarea"
        rows="8"
        class="block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm overflow-hidden resize-none"
        @input="onContentInput"
      />
    </div>

    <!-- Details Modal -->
    <DetailsModal
      :is-open="store.isDetailsModalOpen"
      :title="`${store.t('promptDetails.title')} - ${prompt.name}`"
    >
      <div class="space-y-6">
        <div>
          <label for="modal-prompt-name" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.name') }}</label>
          <input
            id="modal-prompt-name"
            type="text"
            :value="prompt.name"
            class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
            @input="updateDetail('name', $event.target.value)"
          />
        </div>
        <div>
          <label for="modal-prompt-id" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.identifier') }}</label>
          <input
            id="modal-prompt-id"
            type="text"
            :value="prompt.identifier"
            readonly
            class="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <label for="modal-prompt-content" class="block text-sm font-medium text-gray-700">{{ store.t('promptDetails.content') }}</label>
          <textarea
            id="modal-prompt-content"
            :value="prompt.content"
            :readonly="prompt.marker"
            :class="{
              'cursor-not-allowed bg-gray-100': prompt.marker,
              'bg-white': !prompt.marker,
            }"
            rows="12"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm transition focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
            @input="updateDetail('content', $event.target.value)"
          />
        </div>
      </div>
    </DetailsModal>
  </div>
</template>

<script setup>
import { ArrowsPointingOutIcon } from '@heroicons/vue/24/outline';
import { onMounted, ref, watch } from 'vue';
import { usePresetStore } from '../../stores/presetStore';
import DetailsModal from '../DetailsModal.vue';

const props = defineProps({
  prompt: {
    type: Object,
    required: true,
  },
});

const store = usePresetStore();

const updateDetail = (field, value) => {
  store.updatePromptDetail({
    promptId: props.prompt.id,
    field,
    value,
  });
};

// Auto-grow logic for content textarea to remove inner scrollbar
const contentTextarea = ref(null);
const adjustTextareaHeight = () => {
  const el = contentTextarea.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

const onContentInput = (event) => {
  updateDetail('content', event.target.value);
  adjustTextareaHeight();
};

onMounted(() => {
  adjustTextareaHeight();
});

watch(
  () => props.prompt?.content,
  () => {
    adjustTextareaHeight();
  }
);
</script>
