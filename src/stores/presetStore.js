import { debounce } from 'lodash-es';
import { defineStore } from 'pinia';
import { convertAnyToLorebook, normalizeLorebook } from '../utils/worldbook';

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
 * @property {string} id - Unique identifier for the prompt
 * @property {string} [content] - The text content of the prompt
 * @property {MacroData[]} [macros] - Array of parsed macros found in the content
 */

/**
 * Helper function to create a debounced action wrapper
 * @param {Function} action - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debouncedAction(action, delay) {
  const debounced = debounce(action, delay);
  return function (...args) {
    debounced.call(this, ...args);
  };
}

/**
 * Main Pinia store for managing preset data and application state
 * Handles prompt management, macro analysis, variable tracking, and UI state
 */
export const usePresetStore = defineStore('preset', {
  state: () => ({
    // Core data properties
    rawJson: '', // Raw JSON string of the imported preset
    originalFilename: '', // Original filename of the imported preset
    prompts: {}, // Object containing all prompts keyed by ID
    promptOrder: [], // Array of prompt IDs in execution order
    selectedPromptId: null, // Currently selected prompt ID
    selectedMacro: null, // Currently selected macro for details view
    viewOptions: {
      renderMacros: true, // Whether to render macros in the UI
    },

    // Variable management
    variables: {}, // Object containing variable definitions and references
    unresolvedVariables: [], // Array of variables that are referenced but not defined
    macroStateSnapshots: {}, // Stores the value of each getvar at its execution point

    // Multi-selection state
    isMultiSelectActive: false, // Whether multi-selection mode is active
    selectedLibraryPrompts: [], // Array of selected prompt IDs in library view

    // Editor multi-selection state
    isEditorMultiSelectActive: true, // Whether editor multi-selection mode is active (default ON)
    selectedEditorPrompts: [], // Array of selected prompt IDs in editor view

    // Search functionality
    librarySearchTerm: '', // Search term for the prompt library
    editorSearchTerm: '', // Search term for the main editor
    scrollToPromptId: null, // ID of prompt to scroll to (for navigation)
    scrollToLibraryPromptId: null, // ID of prompt to scroll to in the left library

    // UI state
    activeRightSidebarTab: 'details', // Active tab in right sidebar: 'details' or 'variables'
    macroDisplayMode: 'raw', // Macro display mode: 'raw' or 'preview'

    // Mobile layout state
    isLeftSidebarOpen: false, // Whether left sidebar is open on mobile
    isRightSidebarOpen: false, // Whether right sidebar is open on mobile

    // Modal visibility state
    isImportModalOpen: false, // Whether import modal is visible
    isExportModalOpen: false, // Whether export modal is visible
    isDetailsModalOpen: false, // Whether details modal is visible
    isSettingsModalOpen: false, // Whether settings modal is visible
    isBatchReplaceModalOpen: false, // Whether batch replace modal is visible

    // Responsive state
    isMobile: false, // Whether the app is in mobile view

    // Collapse state management
    globalCollapseState: 'expanded', // Global collapse state: 'expanded', 'collapsed', or 'mixed'
    promptCollapseStates: {}, // Individual prompt collapse states: { promptId: boolean }

    // Internationalization
    currentLanguage: 'cn', // Current language: 'en' or 'cn'
    languageData: {}, // Dynamically loaded language data

    // User preferences
    skipDeleteConfirmation: false, // Whether to skip delete confirmation dialog

    // Preset management
    savedPresets: {}, // Object containing saved presets: { presetId: { name, data, createdAt, updatedAt } }
    currentPresetId: null, // ID of currently loaded preset
    isPresetManagerOpen: false, // Whether preset manager modal is open

    defaultPresetId: null, // ID of the default preset (factory settings)

    // Preset manager UI state
    presetSearchTerm: '', // Search term for preset manager
    presetSortBy: 'updated', // Sort by: 'name', 'created', 'updated'
    presetMultiSelectActive: false, // Whether multi-select mode is active
    selectedPresets: new Set(), // Set of selected preset IDs
    // Batch replace history for undo
    batchReplaceHistory: [], // Array<{ timestamp, changes: Array<{ promptId, before: { name, content }, after: { name, content } }> }>
    batchReplaceRedoStack: [], // Redo stack storing same shape as history entries

    // --- Worldbook (Lorebook) state ---
    worldbook: { name: '', entries: [], extensions: {} },
    worldbookOriginalFilename: '',
    // Main content view: 'editor' for prompts, 'worldbook' for worldbook editor
    mainView: 'editor',
  }),
  getters: {
    /**
     * Get a prompt by its ID
     * @param {Object} state - The store state
     * @returns {Function} Function that takes an ID and returns the prompt
     */
    getPromptById: (state) => (id) => {
      return state.prompts[id];
    },

    /**
     * Check if a prompt is in the current order
     * @param {Object} state - The store state
     * @returns {Function} Function that takes a prompt ID and returns boolean
     */
    isPromptInOrder: (state) => (promptId) => {
      return state.promptOrder.includes(promptId);
    },

    /**
     * Get all defined variable names sorted alphabetically
     * @param {Object} state - The store state
     * @returns {string[]} Array of variable names
     */
    definedVariables: (state) => {
      return Object.keys(state.variables).sort();
    },

    /**
     * Get prompts in execution order with search filtering
     * @param {Object} state - The store state
     * @returns {Object[]} Array of prompts in order, filtered by search term
     */
    orderedPrompts: (state) => {
      const prompts = state.promptOrder
        .map((id) => (state.prompts[id] ? { ...state.prompts[id], id } : null))
        .filter((p) => p !== null);

      // If no search term, return all prompts
      if (!state.editorSearchTerm) {
        return prompts;
      }

      // Filter prompts by search term (name or ID)
      const searchTerm = state.editorSearchTerm.toLowerCase();
      return prompts.filter(
        (p) => p.name.toLowerCase().includes(searchTerm) || p.id.toLowerCase().includes(searchTerm),
      );
    },

    /**
     * Get all prompts for library view with search filtering
     * @param {Object} state - The store state
     * @returns {Object[]} Array of all prompts sorted by name, filtered by search term
     */
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
    /**
     * Generate the final JSON for export based on current editor state
     * @param {Object} state - The store state
     * @returns {string} JSON string ready for export
     */
    finalJson: (state) => {
      const preset = JSON.parse(state.rawJson || '{}');

      // Create a clean version of prompts for export, removing internal-use properties
      const cleanedPrompts = Object.values(state.prompts).map((p) => {
        // eslint-disable-next-line no-unused-vars
        const { macros, ...rest } = p;
        return rest;
      });

      preset.prompts = cleanedPrompts;

      // Regenerate prompt_order based on current editor state
      // Only include prompts that are in the editor (promptOrder array)
      const editorPrompts = state.promptOrder
        .map((id) => ({
          identifier: id,
          enabled: state.prompts[id]?.enabled !== false,
        }))
        .filter((item) => state.prompts[item.identifier]); // Ensure prompt exists

      // Create or update prompt_order configuration
      if (Array.isArray(preset.prompt_order)) {
        // Prioritize updating character_id: 100001 order
        let characterOrderIndex = preset.prompt_order.findIndex(
          (item) => item.character_id === 100001,
        );

        // If 100001 not found, use the first available
        if (characterOrderIndex === -1 && preset.prompt_order.length > 0) {
          characterOrderIndex = 0;
        }

        if (characterOrderIndex !== -1) {
          preset.prompt_order[characterOrderIndex].order = editorPrompts;
        } else {
          // If no available order configuration found, create new one
          preset.prompt_order.push({
            character_id: 100001,
            order: editorPrompts,
          });
        }
      } else {
        // If no prompt_order exists, create a default one
        preset.prompt_order = [
          {
            character_id: 100001,
            order: editorPrompts,
          },
        ];
      }

      return JSON.stringify(preset, null, 2);
    },
    /**
     * Get variable statistics for the variable manager
     * @param {Object} state - The store state
     * @returns {Object} Object containing undefined and unreferenced variable counts
     */
    variableStats: (state) => {
      // Calculate the number of variables that are defined but never referenced
      const unreferencedCount = Object.values(state.variables).filter(
        (v) => v.definedIn.length > 0 && v.referencedIn.length === 0,
      ).length;

      return {
        // The count of variables that are referenced but never defined
        undefinedCount: state.unresolvedVariables.length,
        unreferencedCount: unreferencedCount,
      };
    },

    /**
     * Get all saved presets as an array with search and sort filtering
     * @param {Object} state - The store state
     * @returns {Object[]} Array of saved presets
     */
    savedPresetsList: (state) => {
      let presets = Object.entries(state.savedPresets).map(([id, preset]) => ({ id, ...preset }));

      // Apply search filter
      if (state.presetSearchTerm) {
        const searchTerm = state.presetSearchTerm.toLowerCase();
        presets = presets.filter((preset) => preset.name.toLowerCase().includes(searchTerm));
      }

      // Apply sorting
      switch (state.presetSortBy) {
        case 'name':
          presets.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'created':
          presets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'updated':
        default:
          presets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          break;
      }

      return presets;
    },

    // --- Helpers for reactive multi-select rendering ---
    isPresetSelected: (state) => (presetId) => {
      const sel = state.selectedPresets;
      if (!sel) return false;
      if (sel instanceof Set) return sel.has(presetId);
      if (Array.isArray(sel)) return sel.includes(presetId);
      if (typeof sel === 'object') return Boolean(sel[presetId]);
      return false;
    },
    selectedPresetsCount: (state) => {
      const sel = state.selectedPresets;
      if (!sel) return 0;
      if (sel instanceof Set) return sel.size;
      if (Array.isArray(sel)) return sel.length;
      if (typeof sel === 'object') return Object.keys(sel).length;
      return 0;
    },

    /**
     * Get current preset name
     * @param {Object} state - The store state
     * @returns {string|null} Current preset name or null
     */
    currentPresetName: (state) => {
      if (!state.currentPresetId || !state.savedPresets[state.currentPresetId]) {
        return null;
      }
      return state.savedPresets[state.currentPresetId].name;
    },

    /**
     * Get current file name for preset naming
     * @param {Object} state - The store state
     * @returns {string} Current file name or default name
     */
    getCurrentPresetName: (state) => {
      if (state.originalFilename) {
        // Remove file extension
        return state.originalFilename.replace(/\.[^/.]+$/, '');
      }
      // Return default name directly to avoid calling other getters
      return 'Untitled Preset';
    },

    /**
     * Translation function for internationalization
     * @param {Object} state - The store state
     * @returns {Function} Function that takes a key and optional parameters and returns translated text
     */
    t:
      (state) =>
      (key, params = {}) => {
        const keys = key.split('.');
        let value = state.languageData[state.currentLanguage];
        for (const k of keys) {
          value = value?.[k];
        }
        if (!value) return key;

        // Replace parameters in the string
        let result = value;
        for (const [paramKey, paramValue] of Object.entries(params)) {
          result = result.replace(`{${paramKey}}`, paramValue);
        }
        return result;
      },
    /** Whether there is a batch replace operation to undo */
    canUndoBatchReplace: (state) => {
      return (state.batchReplaceHistory?.length || 0) > 0;
    },
    canRedoBatchReplace: (state) => {
      return (state.batchReplaceRedoStack?.length || 0) > 0;
    },
  },
  actions: {
    // --- Initialization and Core Logic ---

    /**
     * Initialize the store with default data when no persisted data exists
     * @param {string} jsonString - JSON string of the default preset data
     */
    initializeDefaultData(jsonString) {
      // This is called only when no persisted data exists
      console.log('[Persistence] No persisted data found, loading default example.json');
      this.parseFromJson(jsonString);
    },

    /**
     * Import new JSON data from user
     * @param {string} jsonString - JSON string to import
     * @param {string} filename - Original filename of the imported data
     */
    importNewJson(jsonString, filename = '') {
      // This is called when user imports new JSON
      // It will automatically be persisted by the plugin
      console.log('[Persistence] User imported new JSON, will be auto-saved');
      this.originalFilename = filename;
      this.parseFromJson(jsonString);
    },
    /**
     * Attempt to import given JSON as a worldbook. If success, set as current worldbook and switch view.
     * @param {string} jsonString
     * @param {string} filename
     * @returns {boolean} true if imported as worldbook
     */
    importWorldbookJson(jsonString, filename = '') {
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (e) {
        return false;
      }
      const lb = convertAnyToLorebook(parsed, filename?.replace(/\.[^/.]+$/, '') || '');
      if (!lb) return false;
      this.worldbook = normalizeLorebook(lb);
      this.worldbookOriginalFilename = filename || '';
      this.mainView = 'worldbook';
      return true;
    },
    /**
     * Parse JSON data and populate the store
     * @param {string} jsonString - JSON string to parse
     */
    parseFromJson(jsonString) {
      try {
        this.rawJson = jsonString;
        const parsed = JSON.parse(jsonString);
        const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];

        // Build prompts object from array
        this.prompts = promptsArray.reduce((acc, prompt) => {
          const id = prompt.identifier || prompt.name;
          if (id) acc[id] = { ...prompt, id };
          return acc;
        }, {});

        // Process prompt_order sorting
        if (Array.isArray(parsed.prompt_order)) {
          // Prioritize character_id: 100001 order, fallback to first available
          let characterOrder = parsed.prompt_order.find((item) => item.character_id === 100001);
          if (!characterOrder && parsed.prompt_order.length > 0) {
            characterOrder = parsed.prompt_order[0];
          }

          if (characterOrder && Array.isArray(characterOrder.order)) {
            const orderData = characterOrder.order;

            // Build promptOrder array based on prompt_order sequence
            this.promptOrder = orderData
              .map((item) => item.identifier)
              .filter((id) => id in this.prompts);

            // Set enabled state for each prompt
            orderData.forEach((item) => {
              if (this.prompts[item.identifier]) {
                this.prompts[item.identifier].enabled = item.enabled;
              }
            });

            // Add prompts that exist but are not in prompt_order
            const orderedIds = new Set(this.promptOrder);
            const unorderedPrompts = Object.values(this.prompts)
              .filter((p) => !orderedIds.has(p.id))
              .sort((a, b) => {
                // Sort by injection_order, then system_prompt, then name
                const orderA = a.injection_order || 0;
                const orderB = b.injection_order || 0;
                if (orderA !== orderB) return orderA - orderB;
                if (a.system_prompt !== b.system_prompt) return b.system_prompt - a.system_prompt;
                return (a.name || '').localeCompare(b.name || '');
              });

            // Add unordered prompts to the end
            this.promptOrder.push(...unorderedPrompts.map((p) => p.id));
          } else {
            // If no valid prompt_order, use default sorting
            this.promptOrder = promptsArray
              .filter((p) => p.enabled !== false)
              .sort((a, b) => (a.injection_order || 0) - (b.injection_order || 0))
              .map((p) => p.identifier || p.name)
              .filter(Boolean);
          }
        } else {
          // If no prompt_order exists, use default sorting
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

    // --- Worldbook actions ---
    setMainView(view) {
      if (view === 'editor' || view === 'worldbook') {
        this.mainView = view;
      }
    },
    setWorldbook(worldbook, filename = '') {
      this.worldbook = normalizeLorebook(worldbook || { name: '', entries: [], extensions: {} });
      this.worldbookOriginalFilename = filename || this.worldbookOriginalFilename || '';
    },
    updateWorldbookName(name) {
      this.worldbook = { ...this.worldbook, name: String(name || '') };
    },
    addWorldbookEntry() {
      const newEntry = {
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now(),
        keys: [],
        secondary_keys: [],
        comment: '',
        content: '',
        constant: false,
        selective: false,
        insertion_order: (this.worldbook.entries.length + 1) * 100,
        enabled: true,
        position: 'after_char',
        use_regex: false,
        extensions: {},
      };
      this.worldbook = {
        ...this.worldbook,
        entries: [...(this.worldbook.entries || []), newEntry],
      };
    },
    updateWorldbookEntry(index, patch) {
      const entries = [...(this.worldbook.entries || [])];
      if (index < 0 || index >= entries.length) return;
      entries[index] = { ...entries[index], ...(patch || {}) };
      this.worldbook = { ...this.worldbook, entries };
    },
    deleteWorldbookEntry(index) {
      const entries = (this.worldbook.entries || []).filter((_, i) => i !== index);
      this.worldbook = { ...this.worldbook, entries };
    },
    exportWorldbookJsonString() {
      const payload =
        this.worldbook && typeof this.worldbook === 'object'
          ? this.worldbook
          : { name: '', entries: [], extensions: {} };
      return JSON.stringify(payload, null, 2);
    },
    exportWorldbookAsFile() {
      try {
        const json = this.exportWorldbookJsonString();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const base =
          this.worldbook?.name ||
          this.worldbookOriginalFilename?.replace(/\.[^/.]+$/, '') ||
          'worldbook';
        a.download = `${base}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('[exportWorldbookAsFile] Failed to export worldbook:', e);
      }
    },

    /**
     * Reset the application to factory default settings
     * Only resets current editing content, preserves saved presets
     */
    async resetToFactoryDefault() {
      console.log(
        '[resetToFactoryDefault] Resetting to factory default while preserving saved presets...',
      );

      // Preserve currently saved presets
      const savedPresets = this.savedPresets;
      const defaultPresetId = this.defaultPresetId;

      try {
        // Load factory settings data
        const factoryData = await import('../assets/example.json');

        // Parse factory settings JSON
        const jsonString = JSON.stringify(factoryData.default || factoryData);
        const parsed = JSON.parse(jsonString);
        const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];

        // Build prompts object
        const prompts = promptsArray.reduce((acc, prompt) => {
          const id = prompt.identifier || prompt.name;
          if (id) acc[id] = { ...prompt, id };
          return acc;
        }, {});

        // Build promptOrder array
        let promptOrder = [];
        if (Array.isArray(parsed.prompt_order)) {
          let characterOrder = parsed.prompt_order.find((item) => item.character_id === 100001);
          if (!characterOrder && parsed.prompt_order.length > 0) {
            characterOrder = parsed.prompt_order[0];
          }

          if (characterOrder && Array.isArray(characterOrder.order)) {
            promptOrder = characterOrder.order
              .map((item) => item.identifier)
              .filter((id) => id in prompts);
          }
        }

        // Reset editor content to factory settings
        this.rawJson = jsonString;
        this.originalFilename = 'factory-default.json';
        this.prompts = prompts;
        this.promptOrder = promptOrder;
        this.macroDisplayMode = 'raw';
        this.promptCollapseStates = {};
        this.currentPresetId = null;

        // Restore user's saved presets metadata
        this.savedPresets = savedPresets;
        this.defaultPresetId = defaultPresetId;

        // Re-analyze macros
        this.analyzeAllMacros();

        console.log(
          '[resetToFactoryDefault] Reset to factory default completed, saved presets preserved',
        );
      } catch (error) {
        console.error('[resetToFactoryDefault] Failed to load factory settings:', error);
      }
    },

    // --- Unified Macro Analysis ---

    /**
     * Analyze all macros in the current prompt order
     * This is the core function that parses macros, tracks variables, and simulates execution
     */
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
    movePromptAfter(draggedPromptId, targetPromptId) {
      const draggedIndex = this.promptOrder.indexOf(draggedPromptId);
      const targetIndex = this.promptOrder.indexOf(targetPromptId);

      if (draggedIndex === -1 || targetIndex === -1) {
        console.warn('[movePromptAfter] Invalid prompt IDs:', { draggedPromptId, targetPromptId });
        return;
      }

      // If the dragged item is before the target, adjust insert index
      const insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;

      // Remove dragged item
      this.promptOrder.splice(draggedIndex, 1);

      // Insert at target position
      this.promptOrder.splice(insertIndex, 0, draggedPromptId);

      this.analyzeAllMacros();
    },
    insertPromptAfter(draggedPromptId, targetPromptId) {
      // Validate existence
      const draggedExists = Boolean(this.prompts[draggedPromptId]);
      const targetExists = Boolean(this.prompts[targetPromptId]);
      if (!draggedExists || !targetExists) {
        console.warn('[insertPromptAfter] Invalid prompt IDs:', {
          draggedPromptId,
          targetPromptId,
        });
        return;
      }

      // If dragged item already in order, use move logic
      const draggedIndex = this.promptOrder.indexOf(draggedPromptId);
      const targetIndex = this.promptOrder.indexOf(targetPromptId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        this.movePromptAfter(draggedPromptId, targetPromptId);
        return;
      }

      // Only insert if target is present in order
      if (targetIndex === -1) {
        console.warn('[insertPromptAfter] Target not in order, append to end as fallback');
        this.promptOrder.push(draggedPromptId);
        this.analyzeAllMacros();
        return;
      }

      const insertIndex = targetIndex + 1;
      this.promptOrder.splice(insertIndex, 0, draggedPromptId);
      this.analyzeAllMacros();
    },
    duplicatePrompt(promptId) {
      const originalPrompt = this.prompts[promptId];
      if (!originalPrompt) return;

      const newId = window.crypto.randomUUID();
      const newPrompt = {
        ...originalPrompt,
        id: newId,
        identifier: newId,
        name: `${originalPrompt.name} (${this.t('promptCard.copied')})`,
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
      // Cleanup collapse state for removed prompt
      this.cleanupPromptCollapseState(promptId);
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
        window.alert(this.t('variableManager.invalidVariableName'));
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
        name: this.t('promptCard.newUntitledPrompt'),
        content: `{{// ${this.t('promptCard.newPromptContent')}}}`,
        enabled: true, // Start enabled to be part of analysis
        role: 'system',
        system_prompt: false,
        marker: false,
      };
      this.prompts[newId] = newPrompt;

      const selectedIndex = this.promptOrder.indexOf(this.selectedPromptId);
      if (selectedIndex !== -1) {
        this.promptOrder.splice(selectedIndex + 1, 0, newId);
      } else {
        this.promptOrder.unshift(newId);
      }

      this.analyzeAllMacros();
      this.selectPrompt(newId);
      this.navigateToPrompt(newId);
    },
    deleteSelectedPrompts() {
      if (this.selectedLibraryPrompts.length === 0) return;
      if (window.confirm(this.t('delete.confirm', { count: this.selectedLibraryPrompts.length }))) {
        this.selectedLibraryPrompts.forEach((promptId) => {
          delete this.prompts[promptId];
          this.promptOrder = this.promptOrder.filter((id) => id !== promptId);
        });
        this.selectedLibraryPrompts = [];
        this.isMultiSelectActive = false;
        this.analyzeAllMacros();
      }
    },
    addPromptToOrder(promptId) {
      if (!this.promptOrder.includes(promptId)) {
        const selectedIndex = this.promptOrder.indexOf(this.selectedPromptId);
        if (selectedIndex !== -1) {
          this.promptOrder.splice(selectedIndex + 1, 0, promptId);
        } else {
          this.promptOrder.unshift(promptId);
        }
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
      this.selectedLibraryPrompts = [];
    },
    toggleLibrarySelection(promptId) {
      const index = this.selectedLibraryPrompts.indexOf(promptId);
      if (index > -1) {
        this.selectedLibraryPrompts.splice(index, 1);
      } else {
        this.selectedLibraryPrompts.push(promptId);
      }
    },

    // Editor multi-selection methods
    toggleEditorMultiSelect() {
      // Deprecated: multi-select is always on. Keep method for backward compatibility.
      this.isEditorMultiSelectActive = true;
    },
    toggleEditorSelection(promptId) {
      const index = this.selectedEditorPrompts.indexOf(promptId);
      if (index > -1) {
        this.selectedEditorPrompts.splice(index, 1);
      } else {
        this.selectedEditorPrompts.push(promptId);
      }
    },
    batchMoveSelectedToTop() {
      if (this.selectedEditorPrompts.length === 0) return;

      const selectedIds = [...this.selectedEditorPrompts];
      const remainingIds = this.promptOrder.filter(
        (id) => !this.selectedEditorPrompts.includes(id),
      );

      // Move selected prompts to the top
      this.promptOrder = [...selectedIds, ...remainingIds];
      this.analyzeAllMacros();
    },
    batchMoveSelectedToBottom() {
      if (this.selectedEditorPrompts.length === 0) return;

      const selectedIds = [...this.selectedEditorPrompts];
      const remainingIds = this.promptOrder.filter(
        (id) => !this.selectedEditorPrompts.includes(id),
      );

      // Move selected prompts to the bottom
      this.promptOrder = [...remainingIds, ...selectedIds];
      this.analyzeAllMacros();
    },
    batchDeleteSelected() {
      if (this.selectedEditorPrompts.length === 0) return;

      // Filter out system prompts that cannot be deleted
      const deletablePrompts = Array.from(this.selectedEditorPrompts).filter((promptId) => {
        const prompt = this.prompts[promptId];
        return prompt && !prompt.system_prompt;
      });

      if (deletablePrompts.length === 0) {
        alert(this.t('editor.noDeletablePrompts'));
        return;
      }

      const selectedCount = deletablePrompts.length;
      const message = this.t('editor.batchDeleteConfirm', { count: selectedCount });

      if (window.confirm(message)) {
        // Delete only deletable prompts
        deletablePrompts.forEach((promptId) => {
          delete this.prompts[promptId];
        });

        // Remove from prompt order
        this.promptOrder = this.promptOrder.filter((id) => !deletablePrompts.includes(id));

        // Clear selection but keep multi-select active
        this.selectedEditorPrompts = [];

        this.analyzeAllMacros();
      }
    },
    // Editor selection helpers
    selectAllEditorPrompts() {
      this.selectedEditorPrompts = [...this.promptOrder];
    },
    deselectAllEditorPrompts() {
      this.selectedEditorPrompts = [];
    },
    setLibrarySearch(term) {
      this.librarySearchTerm = term;
      this.selectedLibraryPrompts = [];
    },
    setEditorSearch(term) {
      this.editorSearchTerm = term;
    },
    navigateToPrompt(promptId) {
      // First, ensure the prompt is in the editor order
      if (!this.isPromptInOrder(promptId)) {
        console.log('[navigateToPrompt] Prompt not in editor, adding it first:', promptId);
        this.addPromptToOrder(promptId);
      }

      // Then set the scroll request
      this.scrollToPromptId = promptId;
    },
    clearScrollToRequest() {
      this.scrollToPromptId = null;
    },
    navigateLibraryToPrompt(promptId) {
      // Trigger left library scroll request
      this.scrollToLibraryPromptId = promptId;
    },
    clearLibraryScrollToRequest() {
      this.scrollToLibraryPromptId = null;
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
    openDetailsModal() {
      this.isDetailsModalOpen = true;
    },
    closeDetailsModal() {
      this.isDetailsModalOpen = false;
    },
    openSettingsModal() {
      this.isSettingsModalOpen = true;
    },
    closeSettingsModal() {
      this.isSettingsModalOpen = false;
    },

    // Batch replace modal toggles
    openBatchReplaceModal() {
      this.isBatchReplaceModalOpen = true;
    },
    closeBatchReplaceModal() {
      this.isBatchReplaceModalOpen = false;
    },

    // Responsive state management
    setIsMobile(isMobile) {
      this.isMobile = isMobile;
    },

    // Global collapse state management
    collapseAllPrompts() {
      this.globalCollapseState = 'collapsed';
      // Clear per-prompt states so all follow the global state
      this.promptCollapseStates = {};
    },

    expandAllPrompts() {
      this.globalCollapseState = 'expanded';
      // Clear per-prompt states so all follow the global state
      this.promptCollapseStates = {};
    },

    setGlobalCollapseState(state) {
      this.globalCollapseState = state;
      // Clear per-prompt states when switching away from 'mixed'
      if (state !== 'mixed') {
        this.promptCollapseStates = {};
      }
    },

    // Individual prompt collapse state management
    togglePromptCollapse(promptId) {
      // If global state is not 'mixed', initialize mixed state first
      if (this.globalCollapseState !== 'mixed') {
        this.initializeMixedState();
      }
      // Ensure this prompt has an individual state
      this.ensurePromptCollapseState(promptId);
      // Toggle collapse state for the prompt
      this.promptCollapseStates[promptId] = !this.promptCollapseStates[promptId];
    },

    // Initialize 'mixed' state: seed per-prompt states from current global setting
    initializeMixedState() {
      const currentGlobalState = this.globalCollapseState;
      this.globalCollapseState = 'mixed';

      // Assign an individual collapse state to all prompts
      this.promptOrder.forEach((id) => {
        this.promptCollapseStates[id] = currentGlobalState === 'collapsed';
      });
    },

    // Ensure given prompt has an individual state; derive from global if missing
    ensurePromptCollapseState(promptId) {
      if (this.promptCollapseStates[promptId] === undefined) {
        // If global is 'mixed', default to expanded (false); otherwise mirror global
        this.promptCollapseStates[promptId] = this.globalCollapseState === 'collapsed';
      }
    },

    // Remove stale collapse state (when a prompt is deleted)
    cleanupPromptCollapseState(promptId) {
      if (this.promptCollapseStates[promptId] !== undefined) {
        delete this.promptCollapseStates[promptId];
      }
    },

    getPromptCollapseState(promptId) {
      // If not 'mixed', return the global state directly
      if (this.globalCollapseState === 'collapsed') {
        return true;
      } else if (this.globalCollapseState === 'expanded') {
        return false;
      }

      // In 'mixed', ensure per-prompt state exists and return it
      this.ensurePromptCollapseState(promptId);
      return this.promptCollapseStates[promptId];
    },

    // Generate export filename
    generateExportFilename() {
      if (!this.originalFilename) {
        return 'preset.json';
      }

      // Strip original file extension
      const nameWithoutExt = this.originalFilename.replace(/\.json$/i, '');

      // Build date suffix (YYYYMMDD)
      const now = new Date();
      const dateStr =
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');

      return `${nameWithoutExt}-${dateStr}.json`;
    },

    // Language actions
    async setLanguage(language) {
      if (['en', 'cn'].includes(language)) {
        this.currentLanguage = language;
        await this.loadLanguageData(language);
      }
    },
    toggleLanguage() {
      const newLanguage = this.currentLanguage === 'en' ? 'cn' : 'en';
      this.setLanguage(newLanguage);
    },
    async loadLanguageData(language) {
      try {
        const languageModule = await import(`../assets/${language}.json`);
        this.languageData[language] = languageModule.default;
      } catch (error) {
        console.error(`Failed to load language data for ${language}:`, error);
      }
    },
    async initializeLanguage() {
      // Load default language data
      await this.loadLanguageData(this.currentLanguage);
    },

    // Delete confirmation preferences
    setSkipDeleteConfirmation(skip) {
      this.skipDeleteConfirmation = skip;
    },

    // Preset management
    openPresetManager() {
      this.isPresetManagerOpen = true;
    },
    closePresetManager() {
      this.isPresetManagerOpen = false;
    },
    /**
     * Save imported JSON as a new preset without loading/overwriting current editor state
     * @param {string} jsonString - The imported preset JSON string
     * @param {string} filename - The original file name of the imported preset
     * @returns {string|null} The newly created preset ID, or null on failure
     */
    saveImportedJsonAsPreset(jsonString, filename = '') {
      try {
        const parsed = JSON.parse(jsonString);
        const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];

        // Build prompts object
        const prompts = promptsArray.reduce((acc, prompt) => {
          const id = prompt.identifier || prompt.name;
          if (id) acc[id] = { ...prompt, id };
          return acc;
        }, {});

        // Build promptOrder array
        let promptOrder = [];
        if (Array.isArray(parsed.prompt_order)) {
          let characterOrder = parsed.prompt_order.find((item) => item.character_id === 100001);
          if (!characterOrder && parsed.prompt_order.length > 0) {
            characterOrder = parsed.prompt_order[0];
          }

          if (characterOrder && Array.isArray(characterOrder.order)) {
            promptOrder = characterOrder.order
              .map((item) => item.identifier)
              .filter((id) => id in prompts);
          }
        }

        // Compose preset payload (do not touch current editor state)
        const presetData = {
          rawJson: jsonString,
          originalFilename: filename || '',
          prompts,
          promptOrder,
          macroDisplayMode: 'raw',
          promptCollapseStates: {},
        };

        const presetId = window.crypto.randomUUID();
        const now = new Date().toISOString();

        // Derive preset name from filename, fallback to localized default
        const presetName = filename
          ? filename.replace(/\.[^/.]+$/, '')
          : this.t('presetManager.defaultName');

        this.savedPresets[presetId] = {
          name: presetName,
          data: presetData,
          createdAt: now,
          updatedAt: now,
        };

        return presetId;
      } catch (error) {
        console.error('[saveImportedJsonAsPreset] Failed to parse imported JSON:', error);
        return null;
      }
    },
    /**
     * Import preset with duplicate name checking and overwrite confirmation, then auto-save.
     * Does NOT load into current editor; only saves into savedPresets.
     * @param {string} jsonString
     * @param {string} filename
     * @returns {{ result: 'saved'|'overwritten'|'failed', name?: string, id?: string }}
     */
    importPresetWithDuplicateCheck(jsonString, filename = '') {
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (e) {
        console.error('[importPresetWithDuplicateCheck] Invalid JSON:', e);
        return { result: 'failed' };
      }

      const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];
      const prompts = promptsArray.reduce((acc, prompt) => {
        const id = prompt.identifier || prompt.name;
        if (id) acc[id] = { ...prompt, id };
        return acc;
      }, {});

      let promptOrder = [];
      if (Array.isArray(parsed.prompt_order)) {
        let characterOrder = parsed.prompt_order.find((item) => item.character_id === 100001);
        if (!characterOrder && parsed.prompt_order.length > 0) {
          characterOrder = parsed.prompt_order[0];
        }
        if (characterOrder && Array.isArray(characterOrder.order)) {
          promptOrder = characterOrder.order
            .map((item) => item.identifier)
            .filter((id) => id in prompts);
        }
      }

      const presetData = {
        rawJson: jsonString,
        originalFilename: filename || '',
        prompts,
        promptOrder,
        macroDisplayMode: 'raw',
        promptCollapseStates: {},
      };

      const baseName = filename
        ? filename.replace(/\.[^/.]+$/, '')
        : this.t('presetManager.defaultName');

      const findPresetIdByName = (name) => {
        const entries = Object.entries(this.savedPresets || {});
        for (const [id, preset] of entries) {
          if (preset?.name === name) return id;
        }
        return null;
      };

      const now = new Date().toISOString();
      const existingId = findPresetIdByName(baseName);

      if (existingId) {
        const confirmText = this.t('importModal.overwriteConfirm', { name: baseName });
        if (window.confirm(confirmText)) {
          this.savedPresets[existingId].data = presetData;
          this.savedPresets[existingId].updatedAt = now;
          return { result: 'overwritten', name: baseName, id: existingId };
        }

        // Generate a unique name like "Name (2)", "Name (3)"...
        let index = 2;
        let uniqueName = `${baseName} (${index})`;
        while (findPresetIdByName(uniqueName)) {
          index += 1;
          uniqueName = `${baseName} (${index})`;
        }

        const newId = window.crypto.randomUUID();
        this.savedPresets[newId] = {
          name: uniqueName,
          data: presetData,
          createdAt: now,
          updatedAt: now,
        };
        return { result: 'saved', name: uniqueName, id: newId };
      }

      // No duplicate, save directly under baseName
      const newId = window.crypto.randomUUID();
      this.savedPresets[newId] = {
        name: baseName,
        data: presetData,
        createdAt: now,
        updatedAt: now,
      };
      return { result: 'saved', name: baseName, id: newId };
    },
    savePreset(name = null) {
      console.log('[savePreset] Starting to save preset...');
      const presetId = window.crypto.randomUUID();
      const now = new Date().toISOString();

      // If no name provided, use current filename
      // If no name provided, derive from current filename
      let presetName;
      if (name) {
        presetName = name.trim();
      } else {
        // Inline getCurrentPresetName logic here
        if (this.originalFilename) {
          presetName = this.originalFilename.replace(/\.[^/.]+$/, '');
        } else {
          presetName = 'Untitled Preset';
        }
      }
      console.log('[savePreset] Preset name:', presetName);

      const presetData = {
        rawJson: this.rawJson,
        originalFilename: this.originalFilename,
        prompts: this.prompts,
        promptOrder: this.promptOrder,
        macroDisplayMode: this.macroDisplayMode,
        promptCollapseStates: this.promptCollapseStates,
      };

      this.savedPresets[presetId] = {
        name: presetName,
        data: presetData,
        createdAt: now,
        updatedAt: now,
      };

      this.currentPresetId = presetId;
      console.log('[savePreset] Preset saved successfully. ID:', presetId);
      console.log('[savePreset] Total saved presets:', Object.keys(this.savedPresets).length);
      return presetId;
    },
    loadPreset(presetId) {
      console.log('[loadPreset] Attempting to load preset:', presetId);
      const preset = this.savedPresets[presetId];
      if (!preset) {
        console.log('[loadPreset] Preset not found:', presetId);
        return false;
      }

      console.log('[loadPreset] Loading preset:', preset.name);
      // Save current state before loading
      this.rawJson = preset.data.rawJson;
      this.originalFilename = preset.data.originalFilename;
      this.prompts = preset.data.prompts;
      this.promptOrder = preset.data.promptOrder;
      this.macroDisplayMode = preset.data.macroDisplayMode;
      this.promptCollapseStates = preset.data.promptCollapseStates || {};

      this.currentPresetId = presetId;
      this.analyzeAllMacros();
      console.log('[loadPreset] Preset loaded successfully');
      return true;
    },
    updatePreset(presetId, name) {
      const preset = this.savedPresets[presetId];
      if (!preset) return false;

      preset.name = name.trim();
      preset.updatedAt = new Date().toISOString();
      return true;
    },
    deletePreset(presetId) {
      if (this.savedPresets[presetId]) {
        delete this.savedPresets[presetId];
        if (this.currentPresetId === presetId) {
          this.currentPresetId = null;
        }
        return true;
      }
      return false;
    },
    duplicatePreset(presetId, newName) {
      const preset = this.savedPresets[presetId];
      if (!preset) return false;

      const newPresetId = window.crypto.randomUUID();
      const now = new Date().toISOString();

      this.savedPresets[newPresetId] = {
        name: newName.trim(),
        data: JSON.parse(JSON.stringify(preset.data)), // Deep clone
        createdAt: now,
        updatedAt: now,
      };

      return newPresetId;
    },
    async saveFactorySettingsAsDefault() {
      console.log('[saveFactorySettingsAsDefault] Saving factory settings as default preset...');

      try {
        // Load factory settings data
        const factoryData = await import('../assets/example.json');

        const presetId = window.crypto.randomUUID();
        const now = new Date().toISOString();

        // Parse factory settings JSON
        const jsonString = JSON.stringify(factoryData.default || factoryData);
        const parsed = JSON.parse(jsonString);
        const promptsArray = Array.isArray(parsed.prompts) ? parsed.prompts : [];

        // Build prompts object
        const prompts = promptsArray.reduce((acc, prompt) => {
          const id = prompt.identifier || prompt.name;
          if (id) acc[id] = { ...prompt, id };
          return acc;
        }, {});

        // Build promptOrder array
        let promptOrder = [];
        if (Array.isArray(parsed.prompt_order)) {
          let characterOrder = parsed.prompt_order.find((item) => item.character_id === 100001);
          if (!characterOrder && parsed.prompt_order.length > 0) {
            characterOrder = parsed.prompt_order[0];
          }

          if (characterOrder && Array.isArray(characterOrder.order)) {
            promptOrder = characterOrder.order
              .map((item) => item.identifier)
              .filter((id) => id in prompts);
          }
        }

        // Compose default preset payload
        const presetData = {
          rawJson: jsonString,
          originalFilename: 'factory-default.json',
          prompts: prompts,
          promptOrder: promptOrder,
          macroDisplayMode: 'raw',
          promptCollapseStates: {},
        };

        // Save as default preset
        this.savedPresets[presetId] = {
          name: this.t('presetManager.factorySettings.factoryDefaultName'),
          data: presetData,
          createdAt: now,
          updatedAt: now,
        };

        this.defaultPresetId = presetId;
        console.log(
          '[saveFactorySettingsAsDefault] Factory settings saved as default preset. ID:',
          presetId,
        );
      } catch (error) {
        console.error('[saveFactorySettingsAsDefault] Failed to load factory settings:', error);
      }
    },
    loadDefaultPreset() {
      if (!this.defaultPresetId || !this.savedPresets[this.defaultPresetId]) {
        console.log('[loadDefaultPreset] No default preset found');
        return false;
      }

      console.log('[loadDefaultPreset] Loading default preset...');
      return this.loadPreset(this.defaultPresetId);
    },

    // Preset manager UI actions
    setPresetSearchTerm(term) {
      this.presetSearchTerm = term;
      this.selectedPresets.clear();
    },
    setPresetSortBy(sortBy) {
      this.presetSortBy = sortBy;
    },
    togglePresetMultiSelect() {
      this.presetMultiSelectActive = !this.presetMultiSelectActive;
      // Replace Set to ensure reactivity in UI templates
      this.selectedPresets = new Set();
    },
    togglePresetSelection(presetId) {
      // Work on a cloned Set to keep reactivity
      const next = new Set(this.selectedPresets);
      if (next.has(presetId)) {
        next.delete(presetId);
      } else {
        next.add(presetId);
      }
      this.selectedPresets = next;
    },
    selectAllPresets() {
      const next = new Set();
      this.savedPresetsList.forEach((preset) => {
        next.add(preset.id);
      });
      this.selectedPresets = next;
    },
    deselectAllPresets() {
      this.selectedPresets = new Set();
    },
    deleteSelectedPresets() {
      if (this.selectedPresets.size === 0) return;

      if (
        window.confirm(
          this.t('presetManager.deleteSelectedConfirm', { count: this.selectedPresets.size }),
        )
      ) {
        this.selectedPresets.forEach((presetId) => {
          delete this.savedPresets[presetId];
          if (this.currentPresetId === presetId) {
            this.currentPresetId = null;
          }
          if (this.defaultPresetId === presetId) {
            this.defaultPresetId = null;
          }
        });
        this.selectedPresets = new Set();
        this.presetMultiSelectActive = false;
      }
    },
    /**
     * Batch replace prompt titles and/or contents.
     * @param {Object} payload
     * @param {string} payload.find
     * @param {string} payload.replace
     * @param {{ title: boolean, content: boolean }} payload.targetFields
     * @param {'selected'|'all'} payload.scope
     * @param {boolean} payload.useRegex
     * @param {boolean} payload.caseSensitive
     * @param {boolean} payload.wholeWord
     * @returns {{ matches: number, prompts: number }} summary
     */
    batchReplaceText(payload) {
      const {
        find,
        replace,
        targetFields,
        scope,
        useRegex,
        caseSensitive,
        wholeWord,
        addPrefix,
        prefixText,
        addSuffix,
        suffixText,
        addSerial,
        serialPosition,
        serialStart,
        serialDigits,
      } = payload || {};

      const findText = typeof find === 'string' ? find : '';
      const replaceText = typeof replace === 'string' ? replace : '';
      const hasFind = Boolean(findText);
      const hasAdditions = Boolean(addPrefix) || Boolean(addSuffix) || Boolean(addSerial);
      if (!hasFind && !hasAdditions) {
        return { matches: 0, prompts: 0 };
      }

      // Build RegExp when needed
      let pattern = null;
      if (hasFind) {
        if (useRegex) {
          try {
            pattern = new RegExp(findText, `g${caseSensitive ? '' : 'i'}`);
          } catch {
            throw new Error('INVALID_REGEX');
          }
        } else {
          const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          let escaped = escapeRegExp(findText);
          if (wholeWord) {
            escaped = `\\b${escaped}\\b`;
          }
          pattern = new RegExp(escaped, `g${caseSensitive ? '' : 'i'}`);
        }
      }

      // Decide target prompts
      let targetIds = [];
      if (scope === 'selected') {
        if (this.selectedEditorPrompts.length === 0) {
          // When explicitly targeting selected but none selected, do nothing
          return { matches: 0, prompts: 0 };
        }
        targetIds = [...this.selectedEditorPrompts];
      } else {
        targetIds = [...this.promptOrder];
      }

      // Ensure stable ordering for serial numbers: follow editor order
      const orderedTargetIds = this.promptOrder.filter((id) => targetIds.includes(id));

      let totalChanges = 0;
      let contentChanged = false;
      /** @type {{ timestamp: string, changes: Array<{ promptId: string, before: { name: string|null, content: string|null }, after: { name: string|null, content: string|null } }> }} */
      const historyEntry = { timestamp: new Date().toISOString(), changes: [] };

      const replaceInText = (text) => {
        if (!hasFind || typeof text !== 'string' || text.length === 0) {
          return { newText: text, count: 0 };
        }
        let count = 0;
        const newText = text.replace(pattern, () => {
          count += 1;
          return replaceText;
        });
        return { newText, count };
      };

      const getSerialStringForIndex = (index) => {
        if (!addSerial) return '';
        const start = Number.isFinite(serialStart) ? Number(serialStart) : 1;
        const digits = Number.isFinite(serialDigits) && serialDigits > 0 ? Number(serialDigits) : 1;
        const value = start + index;
        return String(value).padStart(digits, '0');
      };

      orderedTargetIds.forEach((id, index) => {
        const prompt = this.prompts[id];
        if (!prompt) return;
        let changesForPrompt = 0;

        const originalName = prompt.name ?? '';
        const originalContent = prompt.content ?? '';

        const serialStr = getSerialStringForIndex(index);

        // Title
        if (targetFields?.title) {
          let text = originalName;
          // regex replacement
          const { newText: replacedText, count } = replaceInText(text);
          text = replacedText;
          if (count > 0) changesForPrompt += count;

          // additions
          if (hasAdditions) {
            let prefix = addPrefix ? String(prefixText || '') : '';
            let suffix = addSuffix ? String(suffixText || '') : '';
            if (addSerial) {
              if (serialPosition === 'before') {
                prefix = prefix + serialStr;
              } else {
                suffix = suffix + serialStr;
              }
            }
            text = `${prefix}${text}${suffix}`;
            changesForPrompt += 1; // count additions as one change for this field
          }

          if (text !== originalName) {
            prompt.name = text;
          }
          var finalNameForHistory = text;
        }

        // Content
        if (targetFields?.content && !prompt.marker) {
          let text = originalContent;
          // regex replacement
          const { newText: replacedText, count } = replaceInText(text);
          text = replacedText;
          if (count > 0) changesForPrompt += count;

          // additions
          if (hasAdditions) {
            let prefix = addPrefix ? String(prefixText || '') : '';
            let suffix = addSuffix ? String(suffixText || '') : '';
            if (addSerial) {
              if (serialPosition === 'before') {
                prefix = prefix + serialStr;
              } else {
                suffix = suffix + serialStr;
              }
            }
            text = `${prefix}${text}${suffix}`;
            changesForPrompt += 1; // count additions as one change for this field
          }

          if (text !== originalContent) {
            prompt.content = text;
            contentChanged = true;
          }
          var finalContentForHistory = text;
        }

        if (changesForPrompt > 0) {
          totalChanges += changesForPrompt;
          historyEntry.changes.push({
            promptId: id,
            before: { name: originalName, content: originalContent },
            after: {
              name: typeof finalNameForHistory !== 'undefined' ? finalNameForHistory : originalName,
              content:
                typeof finalContentForHistory !== 'undefined'
                  ? finalContentForHistory
                  : originalContent,
            },
          });
        }
      });

      if (contentChanged) {
        this.analyzeAllMacros();
      }

      if (historyEntry.changes.length > 0) {
        this.batchReplaceHistory.push(historyEntry);
        // Any new forward change invalidates redo stack
        this.batchReplaceRedoStack = [];
      }

      return { matches: totalChanges, prompts: historyEntry.changes.length };
    },
    /** Undo last batch replace/additions change */
    undoLastBatchChange() {
      if (!this.batchReplaceHistory || this.batchReplaceHistory.length === 0) {
        return { prompts: 0 };
      }
      const entry = this.batchReplaceHistory.pop();
      if (!entry || !Array.isArray(entry.changes) || entry.changes.length === 0) {
        return { prompts: 0 };
      }
      // Push to redo stack before applying revert
      this.batchReplaceRedoStack.push(entry);
      let contentChanged = false;
      entry.changes.forEach((change) => {
        const prompt = this.prompts[change.promptId];
        if (!prompt) return;
        if (typeof change.before.name === 'string' && prompt.name !== change.before.name) {
          prompt.name = change.before.name;
        }
        if (typeof change.before.content === 'string' && prompt.content !== change.before.content) {
          prompt.content = change.before.content;
          contentChanged = true;
        }
      });
      if (contentChanged) {
        this.analyzeAllMacros();
      }
      // promptsAffected counts fields; for user-facing, count distinct prompts
      const distinctPrompts = new Set(entry.changes.map((c) => c.promptId)).size;
      return { prompts: distinctPrompts };
    },
    /** Redo last undone batch change */
    redoLastBatchChange() {
      if (!this.batchReplaceRedoStack || this.batchReplaceRedoStack.length === 0) {
        return { prompts: 0 };
      }
      const entry = this.batchReplaceRedoStack.pop();
      if (!entry || !Array.isArray(entry.changes) || entry.changes.length === 0) {
        return { prompts: 0 };
      }
      let contentChanged = false;
      entry.changes.forEach((change) => {
        const prompt = this.prompts[change.promptId];
        if (!prompt) return;
        if (typeof change.after.name === 'string' && prompt.name !== change.after.name) {
          prompt.name = change.after.name;
        }
        if (typeof change.after.content === 'string' && prompt.content !== change.after.content) {
          prompt.content = change.after.content;
          contentChanged = true;
        }
      });
      if (contentChanged) {
        this.analyzeAllMacros();
      }
      // Push back to history as a new step (so we can undo the redo)
      this.batchReplaceHistory.push(entry);
      const distinctPrompts = new Set(entry.changes.map((c) => c.promptId)).size;
      return { prompts: distinctPrompts };
    },
  },
  persist: {
    // Only persist the essential user data, not derived/UI states
    paths: [
      'rawJson',
      'originalFilename',
      'prompts',
      'promptOrder',
      'macroDisplayMode',
      'currentLanguage',
      'languageData',
      'promptCollapseStates',
      'skipDeleteConfirmation',
      'savedPresets',
      'currentPresetId',
      'defaultPresetId',
      // Worldbook persistence
      'worldbook',
      'worldbookOriginalFilename',
      'mainView',
    ],
    beforeRestore: () => {
      console.log('[Persistence] About to restore store from localStorage');
    },
    afterRestore: (ctx) => {
      const hasPersistedData = Boolean(ctx.store.rawJson);
      console.log(`[Persistence] Store restored. Has persisted data: ${hasPersistedData}`);
      if (hasPersistedData) {
        console.log(
          `[Persistence] Loaded ${Object.keys(ctx.store.prompts).length} prompts, ${ctx.store.promptOrder.length} in order`,
        );
        // Re-analyze macros after restore since derived states are not persisted
        console.log('[Persistence] Re-analyzing macros after restore...');
        ctx.store.analyzeAllMacros();
      }
    },
  },
});
