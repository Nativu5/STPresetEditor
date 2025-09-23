<template>
  <!-- 主容器，保持与EditorView相同的结构 -->
  <div class="flex h-full flex-col">
    <!-- 编辑器头部区域，使用与EditorView类似的样式 -->
    <div class="mb-2 flex flex-shrink-0 flex-col">
      <!-- 第一行：标题和主要控制按钮 -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ store.t('worldbookEditor.title') }}</h2>
        <div class="flex items-center gap-2">
          <button
            @click="openImport()"
            class="inline-flex items-center rounded-md border-0 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {{ store.t('worldbookEditor.import') }}
          </button>
          <button
            @click="store.exportWorldbookAsFile()"
            class="inline-flex items-center rounded-md border-0 bg-slate-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
          >
            {{ store.t('worldbookEditor.export') }}
          </button>
        </div>
      </div>
      
      <!-- 第二行：世界书名称和添加条目按钮 -->
      <div class="mt-2 flex items-center gap-3">
        <label class="text-sm text-gray-700">{{ store.t('worldbookEditor.name') }}</label>
        <input
          :value="store.worldbook.name"
          @input="store.updateWorldbookName($event.target.value)"
          class="w-96 max-w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="store.addWorldbookEntry()"
          class="ml-auto inline-flex items-center rounded-md border-0 bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {{ store.t('worldbookEditor.addEntry') }}
        </button>
      </div>
    </div>

    <!-- 条目列表容器，带滚动 -->
    <div class="overflow-y-auto">
      <div class="space-y-3">
        <div
          v-for="(entry, index) in entries"
          :key="String(entry.id ?? '') + '-' + index"
          class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <strong>#{{ index + 1 }}</strong>
            <button
              @click="deleteEntry(index)"
              class="ml-auto text-sm text-red-600 hover:text-red-700"
            >
              {{ store.t('worldbookEditor.delete') }}
            </button>
          </div>

          <div class="mt-2">
            <label class="block text-sm text-gray-700">
              <span class="mr-2">{{ store.t('worldbookEditor.comment') }}</span>
              <input
                :value="entry.comment"
                @input="updateEntry(index, { comment: $event.target.value })"
                class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div class="mt-2">
            <label class="block text-sm text-gray-700">
              <span class="mr-2">{{ store.t('worldbookEditor.content') }}</span>
              <textarea
                :value="entry.content"
                @input="updateEntry(index, { content: $event.target.value })"
                class="w-full min-h-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div class="mt-2 flex gap-2 flex-wrap text-sm text-gray-700">
            <label class="flex-1 min-w-64 block">
              <span class="mr-2">{{ store.t('worldbookEditor.keys') }}</span>
              <input
                :value="(entry.keys || []).join(', ')"
                @input="updateEntry(index, { keys: splitCsv($event.target.value) })"
                class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label class="flex-1 min-w-64 block">
              <span class="mr-2">{{ store.t('worldbookEditor.secondaryKeys') }}</span>
              <input
                :value="(entry.secondary_keys || []).join(', ')"
                @input="updateEntry(index, { secondary_keys: splitCsv($event.target.value) })"
                class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          <div class="mt-2 flex gap-4 flex-wrap text-sm text-gray-700">
            <label class="inline-flex items-center gap-1">
              <span>{{ store.t('worldbookEditor.enabled') }}</span>
              <input type="checkbox" :checked="entry.enabled" @change="updateEntry(index, { enabled: $event.target.checked })" />
            </label>
            <label class="inline-flex items-center gap-1">
              <span>{{ store.t('worldbookEditor.constant') }}</span>
              <input type="checkbox" :checked="entry.constant" @change="updateEntry(index, { constant: $event.target.checked })" />
            </label>
            <label class="inline-flex items-center gap-1">
              <span>{{ store.t('worldbookEditor.selective') }}</span>
              <input type="checkbox" :checked="entry.selective" @change="updateEntry(index, { selective: $event.target.checked })" />
            </label>
            <label class="inline-flex items-center gap-1">
              <span>{{ store.t('worldbookEditor.useRegex') }}</span>
              <input type="checkbox" :checked="entry.use_regex" @change="updateEntry(index, { use_regex: $event.target.checked })" />
            </label>
          </div>

          <div class="mt-2 flex gap-4 flex-wrap text-sm text-gray-700">
            <label class="inline-flex items-center gap-2">
              <span>{{ store.t('worldbookEditor.insertionOrder') }}</span>
              <input
                type="number"
                :value="entry.insertion_order"
                @input="updateEntry(index, { insertion_order: toNumber($event.target.value) })"
                class="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label class="inline-flex items-center gap-2">
              <span>{{ store.t('worldbookEditor.position') }}</span>
              <select
                :value="entry.position"
                @change="updateEntry(index, { position: $event.target.value })"
                class="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="after_char">after_char</option>
                <option value="before_char">before_char</option>
                <option value="before_authors_note">before_authors_note</option>
                <option value="after_authors_note">after_authors_note</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePresetStore } from '../../stores/presetStore';

const store = usePresetStore();

const entries = computed(() => store.worldbook?.entries || []);

const openImport = () => {
  store.openImportModal();
};

const updateEntry = (index, patch) => {
  store.updateWorldbookEntry(index, patch);
};

const deleteEntry = (index) => {
  store.deleteWorldbookEntry(index);
};

function splitCsv(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
</script>
