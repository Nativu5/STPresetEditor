import { defineStore } from 'pinia';
import { debounce } from 'lodash-es';

/**
 * @typedef {object} MacroData
 * @property {string} id - A unique identifier for this specific macro instance, e.g., "promptId-charIndex".
 * @property {string} full - The full, original macro string, e.g., "{{setvar::x::10}}".
 * @property {string} type - The parsed type of the macro, e.g., "setvar", "getvar", "comment", "random".
 * @property {string|null} varName - The variable name, if applicable (for "setvar" and "getvar").
 * @property {string|null} value - The value being set, if applicable (for "setvar").
 * @property {string[]} params - An array of parameters for other macro types like "random::a::b".
 */

/**
 * @typedef {Object} PartialPrompt
 * @property {string} id
 * @property {string} [content]
 * @property {MacroData[]} [macros]
 */

// --- Helper function to create a debounced action ---
function debouncedAction(action, delay) {
  const debounced = debounce(action, delay);
  return function (...args) {
    debounced.call(this, ...args);
  };
}

export const usePresetStore = defineStore('preset', {
  state: () => ({
    rawJson: '',
    prompts: {},
    promptOrder: [],
    selectedPromptId: null,
    selectedMacro: null,
    viewOptions: {
      renderMacros: true,
    },
    variables: {},
    unresolvedVariables: [],
    macroStateSnapshots: {}, // New: Stores the value of each getvar at its execution point
    isMultiSelectActive: false,
    selectedLibraryPrompts: new Set(),
    librarySearchTerm: '',
    scrollToPromptId: null,
    activeRightSidebarTab: 'details', // 'details' or 'variables'
    macroDisplayMode: 'raw', // 'raw' or 'preview'

    // UI State for mobile layout
    isLeftSidebarOpen: false,
    isRightSidebarOpen: false,

    // Modal visibility state
    isImportModalOpen: false,
    isExportModalOpen: false,

    // Responsive state
    isMobile: false,
  }),
  getters: {
    getPromptById: (state) => (id) => {
      return state.prompts[id];
    },
    isPromptInOrder: (state) => (promptId) => {
      return state.promptOrder.includes(promptId);
    },
    definedVariables: (state) => {
      return Object.keys(state.variables).sort();
    },
    orderedPrompts: (state) => {
      return state.promptOrder
        .map((id) => (state.prompts[id] ? { ...state.prompts[id], id } : null))
        .filter((p) => p !== null);
    },
    libraryPrompts: (state) => {
      const allPrompts = Object.values(state.prompts).sort((a, b) => a.name.localeCompare(b.name));
      if (!state.librarySearchTerm) {
        return allPrompts;
      }
      const searchTerm = state.librarySearchTerm.toLowerCase();
      return allPrompts.filter(
        (p) => p.name.toLowerCase().includes(searchTerm) || p.id.toLowerCase().includes(searchTerm),
      );
    },
    finalJson: (state) => {
      const preset = JSON.parse(state.rawJson || '{}');

      // Create a clean version of prompts for export, removing any internal-use properties.
      const cleanedPrompts = Object.values(state.prompts).map((p) => {
        // eslint-disable-next-line no-unused-vars
        const { macros, ...rest } = p;
        return rest;
      });

      preset.prompts = cleanedPrompts;

      if (Array.isArray(preset.prompt_order)) {
        const characterOrderIndex = preset.prompt_order.findIndex(
          (item) => item.character_id === 100001,
        );
        if (characterOrderIndex !== -1) {
          preset.prompt_order[characterOrderIndex].order = state.promptOrder.map((id) => ({
            identifier: id,
            enabled: state.prompts[id]?.enabled !== false,
          }));
        }
      }
      return JSON.stringify(preset, null, 2);
    },
    variableStats: (state) => {
      // Calculate the number of variables that are defined but never referenced.
      const unreferencedCount = Object.values(state.variables).filter(
        (v) => v.definedIn.length > 0 && v.referencedIn.length === 0,
      ).length;

      return {
        // The count of variables that are referenced but never defined.
        undefinedCount: state.unresolvedVariables.length,
        unreferencedCount: unreferencedCount,
      };
    },
  },
  actions: {
    // --- Initialization and Core Logic ---
    initializeDefaultData(jsonString) {
      // This is called only when no persisted data exists
      console.log('[Persistence] No persisted data found, loading default example.json');
      this.parseFromJson(jsonString);
    },

    importNewJson(jsonString) {
      // This is called when user imports new JSON
      // It will automatically be persisted by the plugin
      console.log('[Persistence] User imported new JSON, will be auto-saved');
      this.parseFromJson(jsonString);
    },
    parseFromJson(jsonString) {
      try {
        this.rawJson = jsonString;
        const parsed = JSON.parse(jsonString);
        const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];
        this.prompts = promptsArray.reduce((acc, prompt) => {
          const id = prompt.identifier || prompt.name;
          if (id) acc[id] = { ...prompt, id };
          return acc;
        }, {});
        const characterOrder = Array.isArray(parsed.prompt_order)
          ? parsed.prompt_order.find((item) => item.character_id === 100001)
          : null;
        if (characterOrder && Array.isArray(characterOrder.order)) {
          const orderData = characterOrder.order;
          this.promptOrder = orderData
            .map((item) => item.identifier)
            .filter((id) => id in this.prompts);
          orderData.forEach((item) => {
            if (this.prompts[item.identifier]) this.prompts[item.identifier].enabled = item.enabled;
          });
        } else {
          this.promptOrder = promptsArray
            .filter((p) => p.enabled !== false)
            .sort((a, b) => (a.injection_order || 0) - (b.injection_order || 0))
            .map((p) => p.identifier || p.name)
            .filter(Boolean);
        }
        this.analyzeAllMacros();
      } catch (error) {
        console.error('Failed to parse JSON string:', error);
        this.prompts = {};
        this.promptOrder = [];
      }
    },

    resetToFactoryDefault() {
      // Clear the persisted state and reload the page
      console.log('[Persistence] Clearing localStorage and resetting to factory default');
      localStorage.removeItem('preset');
      window.location.reload();
    },

    // --- Unified Macro Analysis ---
    analyzeAllMacros() {
      console.log('[analyzeAllMacros] Starting analysis macros...');

      // --- Pre-analysis: Clear stale macro data from all prompts ---
      Object.values(this.prompts).forEach((p) => {
        p.macros = [];
      });

      // --- Pass 1: Parse macros only for prompts currently in the order ---
      const macroRegex = /{{\s*(.*?)\s*}}/gs;
      this.promptOrder.forEach((promptId) => {
        /** @type {PartialPrompt} */
        const prompt = this.prompts[promptId];
        if (!prompt) return;

        /** @type {MacroData[]} */
        const macros = [];
        const content = prompt.content || '';
        let match;
        while ((match = macroRegex.exec(content)) !== null) {
          const fullMatch = match[0];
          const innerContent = match[1].trim();

          /** @type {MacroData} */
          const macroData = {
            id: `${prompt.id}-${match.index}`,
            full: fullMatch,
            type: 'unknown',
            varName: null,
            value: null,
            params: [],
          };
          if (innerContent.startsWith('//')) {
            macroData.type = 'comment';
          } else if (innerContent.startsWith('setvar::')) {
            const parts = innerContent.substring('setvar::'.length).split('::');
            macroData.type = 'setvar';
            macroData.varName = parts[0]?.trim() || null;
            macroData.value = parts[1]?.trim() || null;
          } else if (innerContent.startsWith('getvar::')) {
            macroData.type = 'getvar';
            macroData.varName = innerContent.substring('getvar::'.length).trim();
          } else {
            const [type, ...params] = innerContent.split('::').map((p) => p.trim());
            macroData.type = type || 'unknown';
            macroData.params = params;
          }
          macros.push(macroData);
        }

        prompt.macros = macros; // Attach parsed macros
      });

      // --- Pass 2: Consolidated Analysis (based on promptOrder) ---
      const allVarNames = new Set();
      const definitions = {}; // { varName: [{ promptId, enabled }, ...] }
      const references = {}; // { varName: [{ promptId, enabled }, ...] }

      // --- Pass 3: Simulation and Aggregation ---
      const newSnapshots = {};
      let currentVarState = {};

      // Build the full execution flow for value lookups first
      /** @type {MacroData[]} */
      const executionFlowMacros = this.promptOrder.flatMap(
        (promptId) => this.prompts[promptId]?.macros || [],
      );

      executionFlowMacros.forEach((macro) => {
        // Static analysis part: build full definition/reference maps
        if (macro.varName) {
          allVarNames.add(macro.varName);
          const prompt = this.prompts[macro.id.split('-').slice(0, -1).join('-')];
          const refInfo = { promptId: prompt.id, enabled: prompt.enabled !== false };

          if (macro.type === 'setvar') {
            if (!definitions[macro.varName]) definitions[macro.varName] = [];
            definitions[macro.varName].push(refInfo);
          } else if (macro.type === 'getvar') {
            if (!references[macro.varName]) references[macro.varName] = [];
            references[macro.varName].push(refInfo);
          }
        }

        // Simulation part: update state only if the parent prompt is enabled
        if (macro.type === 'setvar') {
          const prompt = this.prompts[macro.id.split('-').slice(0, -1).join('-')];
          if (prompt.enabled !== false) {
            currentVarState[macro.varName] = macro.value;
          }
        } else if (macro.type === 'getvar') {
          newSnapshots[macro.id] = currentVarState[macro.varName];
        }
      });

      const newVariables = {};
      const newUnresolved = new Set();
      allVarNames.forEach((varName) => {
        const defs = definitions[varName] || [];
        const refs = references[varName] || [];
        const uniqueDefs = Array.from(new Map(defs.map((item) => [item.promptId, item])).values());
        const uniqueRefs = Array.from(new Map(refs.map((item) => [item.promptId, item])).values());

        newVariables[varName] = {
          definedIn: uniqueDefs,
          referencedIn: uniqueRefs,
        };

        if (uniqueDefs.length === 0 && uniqueRefs.length > 0) {
          newUnresolved.add(varName);
        }
      });

      this.variables = newVariables;
      this.unresolvedVariables = Array.from(newUnresolved).map((varName) => ({ varName }));
      this.macroStateSnapshots = newSnapshots;

      console.log('[analyzeAllMacros] Analysis complete.');
      console.log('[analyzeAllMacros] Variables:', this.variables);
    },

    findPromptIdByMacroId(macroId) {
      if (!macroId) return null;
      // Macro ID format is `${prompt.id}-${match.index}`
      const parts = macroId.split('-');
      // What if promptId itself contains a hyphen? Rejoin all but the last part.
      if (parts.length > 1) {
        return parts.slice(0, -1).join('-');
      }
      return null;
    },
    analyzeAllMacrosDebounced: debouncedAction(function () {
      this.analyzeAllMacros();
    }, 300),

    // --- Actions that trigger re-analysis ---
    updatePromptOrder(newOrder) {
      this.promptOrder = newOrder.map((p) => p.id);
      this.analyzeAllMacros();
    },
    movePromptTop(promptId) {
      const index = this.promptOrder.indexOf(promptId);
      if (index > 0) {
        this.promptOrder.splice(index, 1);
        this.promptOrder.unshift(promptId);
        this.analyzeAllMacros();
      }
    },
    movePromptBottom(promptId) {
      const index = this.promptOrder.indexOf(promptId);
      if (index > -1 && index < this.promptOrder.length - 1) {
        this.promptOrder.splice(index, 1);
        this.promptOrder.push(promptId);
        this.analyzeAllMacros();
      }
    },
    duplicatePrompt(promptId) {
      const originalPrompt = this.prompts[promptId];
      if (!originalPrompt) return;

      const newId = window.crypto.randomUUID();
      const newPrompt = {
        ...originalPrompt,
        id: newId,
        identifier: newId,
        name: `${originalPrompt.name} (Copied)`,
        system_prompt: false, // Duplicated prompts are not system prompts
        marker: false, // Duplicated prompts are not markers
      };

      this.prompts[newId] = newPrompt;

      const originalIndex = this.promptOrder.indexOf(promptId);
      if (originalIndex > -1) {
        this.promptOrder.splice(originalIndex + 1, 0, newId);
      } else {
        this.promptOrder.push(newId);
      }

      this.analyzeAllMacros();
      this.selectPrompt(newId);
      this.navigateToPrompt(newId);
    },
    hidePrompt(promptId) {
      this.promptOrder = this.promptOrder.filter((id) => id !== promptId);
      this.analyzeAllMacros();
    },
    removePrompt(promptId) {
      delete this.prompts[promptId];
      this.hidePrompt(promptId); // This will trigger analysis
    },
    togglePromptEnabled(promptId) {
      const prompt = this.prompts[promptId];
      if (prompt) {
        prompt.enabled = !(prompt.enabled !== false);
        this.analyzeAllMacros();
      }
    },
    updatePromptDetail({ promptId, field, value }) {
      const prompt = this.prompts[promptId];
      if (prompt && typeof field === 'string') {
        prompt[field] = value;
        if (field === 'content') {
          this.analyzeAllMacrosDebounced();
        }
      }
    },
    renameVariable({ oldName, newName }) {
      const trimmedNewName = newName.trim();
      if (
        !trimmedNewName ||
        trimmedNewName.includes(' ') ||
        (this.variables[trimmedNewName] && trimmedNewName !== oldName)
      ) {
        window.alert('Invalid or conflicting new variable name.');
        return false;
      }

      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\\]]/g, '\\$&');
      const oldNameEscaped = escapeRegExp(oldName);
      const setvarRegex = new RegExp(`({{\\s*setvar\\s*::)${oldNameEscaped}(\\s*::.*?\\s*}})`, 'g');
      const getvarRegex = new RegExp(`({{\\s*getvar\\s*::)${oldNameEscaped}(\\s*}})`, 'g');

      for (const promptId in this.prompts) {
        const prompt = this.prompts[promptId];
        if (prompt.content) {
          prompt.content = prompt.content.replace(setvarRegex, `$1${trimmedNewName}$2`);
          prompt.content = prompt.content.replace(getvarRegex, `$1${trimmedNewName}$2`);
        }
      }

      this.analyzeAllMacros();
      if (this.selectedMacro && this.selectedMacro.variableName === oldName) {
        this.selectMacro(trimmedNewName);
      }
      return true;
    },
    createNewPrompt() {
      const newId = window.crypto.randomUUID();
      const newPrompt = {
        id: newId,
        identifier: newId,
        name: 'New Untitled Prompt',
        content: '{{// This is a new prompt. Add your content here.}}',
        enabled: true, // Start enabled to be part of analysis
        role: 'system',
        system_prompt: false,
        marker: false,
      };
      this.prompts[newId] = newPrompt;
      this.promptOrder.unshift(newId);
      this.analyzeAllMacros();
      this.selectPrompt(newId);
      this.navigateToPrompt(newId);
    },
    deleteSelectedPrompts() {
      if (this.selectedLibraryPrompts.size === 0) return;
      if (
        window.confirm(
          `Are you sure you want to permanently delete ${this.selectedLibraryPrompts.size} selected prompt(s)?`,
        )
      ) {
        this.selectedLibraryPrompts.forEach((promptId) => {
          delete this.prompts[promptId];
          this.promptOrder = this.promptOrder.filter((id) => id !== promptId);
        });
        this.selectedLibraryPrompts.clear();
        this.isMultiSelectActive = false;
        this.analyzeAllMacros();
      }
    },
    addPromptToOrder(promptId) {
      if (!this.promptOrder.includes(promptId)) {
        this.promptOrder.unshift(promptId);
        this.analyzeAllMacros();
        this.navigateToPrompt(promptId);
      }
    },

    // --- UI and Selection Actions (no re-analysis needed) ---
    selectPrompt(promptId) {
      this.selectedPromptId = promptId;
      this.selectedMacro = null;
      this.activeRightSidebarTab = 'details';
      if (this.isMobile) {
        this.toggleRightSidebar(true);
      }
    },
    selectMacro(variableName) {
      if (variableName) {
        this.selectedMacro = { variableName };
        this.selectedPromptId = null;
        this.activeRightSidebarTab = 'details';
        if (this.isMobile) {
          this.toggleRightSidebar(true);
        }
      }
    },
    toggleMultiSelect() {
      this.isMultiSelectActive = !this.isMultiSelectActive;
      this.selectedLibraryPrompts.clear();
    },
    toggleLibrarySelection(promptId) {
      if (this.selectedLibraryPrompts.has(promptId)) {
        this.selectedLibraryPrompts.delete(promptId);
      } else {
        this.selectedLibraryPrompts.add(promptId);
      }
    },
    setLibrarySearch(term) {
      this.librarySearchTerm = term;
      this.selectedLibraryPrompts.clear();
    },
    navigateToPrompt(promptId) {
      this.scrollToPromptId = promptId;
    },
    clearScrollToRequest() {
      this.scrollToPromptId = null;
    },
    setActiveRightSidebarTab(tabName) {
      this.activeRightSidebarTab = tabName;
    },
    toggleMacroDisplayMode() {
      this.macroDisplayMode = this.macroDisplayMode === 'raw' ? 'preview' : 'raw';
    },

    // Mobile Sidebar Toggles
    toggleLeftSidebar(isOpen) {
      this.isLeftSidebarOpen = typeof isOpen === 'boolean' ? isOpen : !this.isLeftSidebarOpen;
    },
    toggleRightSidebar(isOpen) {
      this.isRightSidebarOpen = typeof isOpen === 'boolean' ? isOpen : !this.isRightSidebarOpen;
    },

    // Modal toggles
    openImportModal() {
      this.isImportModalOpen = true;
    },
    closeImportModal() {
      this.isImportModalOpen = false;
    },
    openExportModal() {
      this.isExportModalOpen = true;
    },
    closeExportModal() {
      this.isExportModalOpen = false;
    },

    // Responsive state management
    setIsMobile(isMobile) {
      this.isMobile = isMobile;
    },
  },
  persist: {
    // Only persist the essential user data, not derived/UI states
    pick: ['rawJson', 'prompts', 'promptOrder', 'macroDisplayMode'],
    beforeHydrate: () => {
      console.log('[Persistence] About to hydrate store from localStorage');
    },
    afterHydrate: (ctx) => {
      const hasPersistedData = Boolean(ctx.store.rawJson);
      console.log(`[Persistence] Store hydrated. Has persisted data: ${hasPersistedData}`);
      if (hasPersistedData) {
        console.log(
          `[Persistence] Loaded ${Object.keys(ctx.store.prompts).length} prompts, ${ctx.store.promptOrder.length} in order`,
        );
        // Re-analyze macros after hydration since derived states are not persisted
        console.log('[Persistence] Re-analyzing macros after hydration...');
        ctx.store.analyzeAllMacros();
      }
    },
  },
});
