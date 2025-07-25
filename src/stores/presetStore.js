import { defineStore } from 'pinia';
import { debounce } from 'lodash-es';

// --- Helper function to create a debounced action ---
function debouncedAction(action, delay) {
  const debounced = debounce(action, delay);
  return function (...args) {
    debounced.call(this, ...args);
  };
}

export const usePresetStore = defineStore('preset', {
  state: () => ({
    initialJson: '',
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
  }),
  getters: {
    isModified: (state) => {
      if (!state.initialJson) return false;
      const normalizedInitialJson = JSON.stringify(JSON.parse(state.initialJson), null, 2);
      return normalizedInitialJson !== state.finalJson;
    },
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
      preset.prompts = Object.values(state.prompts);
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
  },
  actions: {
    // --- Initialization and Core Logic ---
    setInitialJson(jsonString) {
      this.initialJson = jsonString;
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
    resetState() {
      if (this.initialJson) this.parseFromJson(this.initialJson);
    },

    // --- Unified Macro Analysis (The new core) ---
    analyzeAllMacros() {
      console.log('[analyzeAllMacros] Starting analysis with new 3-pass strategy...');

      const allMacros = [];
      const macroRegex = /({{\s*.*?\s*}})/gs;
      const setvarRegex = /setvar::(.*?)::(.*)/s;
      const getvarRegex = /getvar::(.*)/s; // FIX: Made greedy

      // --- Pass 1: Parse all macros and create a flat, ordered list ---
      this.promptOrder.forEach((promptId) => {
        const prompt = this.prompts[promptId];
        if (!prompt || !prompt.enabled) return;

        const parts = (prompt.content || '').split(macroRegex).filter(Boolean);
        parts.forEach((part, index) => {
          if (!part.startsWith('{{') || !part.endsWith('}}')) return;

          const macroContent = part.slice(2, -2).trim();
          const macroData = {
            id: `${promptId}-${index}`,
            promptId: promptId,
            type: 'unknown',
            varName: null,
          };

          const setvarMatch = macroContent.match(setvarRegex);
          const getvarMatch = macroContent.match(getvarRegex);

          if (setvarMatch) {
            macroData.type = 'setvar';
            macroData.varName = setvarMatch[1].trim();
            macroData.value = setvarMatch[2].trim();
          } else if (getvarMatch) {
            macroData.type = 'getvar';
            macroData.varName = getvarMatch[1].trim();
          }
          console.log(`[Store Pass 1] Parsed macro:`, {
            content: macroContent,
            data: JSON.parse(JSON.stringify(macroData)),
          });
          allMacros.push(macroData);
        });
      });

      // --- Pass 2: Process the flat list to build states ---
      const newSnapshots = {};
      let currentVarState = {};
      const allVarNames = new Set();
      const definitions = {}; // { varName: [promptId, ...] }
      const references = {}; // { varName: [promptId, ...] }

      allMacros.forEach((macro) => {
        if (macro.varName) {
          allVarNames.add(macro.varName);
        }

        if (macro.type === 'setvar') {
          currentVarState[macro.varName] = macro.value;
          if (!definitions[macro.varName]) definitions[macro.varName] = [];
          definitions[macro.varName].push(macro.promptId);
        } else if (macro.type === 'getvar') {
          newSnapshots[macro.id] = currentVarState[macro.varName];
          if (!references[macro.varName]) references[macro.varName] = [];
          references[macro.varName].push(macro.promptId);
        }
      });

      // --- Pass 3: Finalize variables and unresolved states ---
      const newVariables = {};
      const newUnresolved = [];

      allVarNames.forEach((varName) => {
        const defs = definitions[varName] || [];
        const refs = references[varName] || [];
        newVariables[varName] = {
          definedIn: [...new Set(defs)],
          referencedIn: [...new Set(refs)],
        };

        if (defs.length === 0 && refs.length > 0) {
          refs.forEach((promptId) => {
            newUnresolved.push({ varName, promptId });
          });
        }
      });

      this.variables = newVariables;
      this.unresolvedVariables = newUnresolved;
      this.macroStateSnapshots = newSnapshots;

      console.log('[analyzeAllMacros] Analysis complete. Snapshots generated:', newSnapshots);
    },
    analyzeAllMacrosDebounced: debouncedAction(function () {
      this.analyzeAllMacros();
    }, 300),

    // --- Actions that trigger re-analysis ---
    updatePromptOrder(newOrder) {
      this.promptOrder = newOrder.map((p) => p.id);
      this.analyzeAllMacros(); // Order change is instant, no debounce
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
    },
    selectMacro(variableName) {
      if (variableName) {
        this.selectedMacro = { variableName };
        this.selectedPromptId = null;
        this.activeRightSidebarTab = 'details';
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
  },
});
