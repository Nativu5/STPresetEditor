import { defineStore } from 'pinia';

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
    isMultiSelectActive: false,
    selectedLibraryPrompts: new Set(),
    librarySearchTerm: '',
    scrollToPromptId: null,
    activeRightSidebarTab: 'details', // 'details' or 'variables'
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
        .map(id => state.prompts[id] ? { ...state.prompts[id], id } : null)
        .filter(p => p !== null);
    },
    libraryPrompts: (state) => {
        const allPrompts = Object.values(state.prompts).sort((a, b) => a.name.localeCompare(b.name));
        if (!state.librarySearchTerm) {
            return allPrompts;
        }
        const searchTerm = state.librarySearchTerm.toLowerCase();
        return allPrompts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.id.toLowerCase().includes(searchTerm)
        );
    },
    finalJson: (state) => {
      const preset = JSON.parse(state.rawJson || '{}');
      preset.prompts = Object.values(state.prompts);
      if (Array.isArray(preset.prompt_order)) {
        const characterOrderIndex = preset.prompt_order.findIndex(item => item.character_id === 100001);
        if (characterOrderIndex !== -1) {
          preset.prompt_order[characterOrderIndex].order = state.promptOrder.map(id => ({
            identifier: id,
            enabled: state.prompts[id]?.enabled !== false
          }));
        }
      }
      return JSON.stringify(preset, null, 2);
    },
  },
  actions: {
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
        const characterOrder = Array.isArray(parsed.prompt_order) ? parsed.prompt_order.find(item => item.character_id === 100001) : null;
        if (characterOrder && Array.isArray(characterOrder.order)) {
            const orderData = characterOrder.order;
            this.promptOrder = orderData.map(item => item.identifier).filter(id => id in this.prompts);
            orderData.forEach(item => {
                if (this.prompts[item.identifier]) this.prompts[item.identifier].enabled = item.enabled;
            });
        } else {
            this.promptOrder = promptsArray.filter(p => p.enabled !== false).sort((a, b) => (a.injection_order || 0) - (b.injection_order || 0)).map(p => p.identifier || p.name).filter(Boolean);
        }
        this.analyzeMacros();
      } catch (error) {
        console.error('Failed to parse JSON string:', error);
        this.prompts = {};
        this.promptOrder = [];
      }
    },
    analyzeMacros() {
        const newVariables = {};
        const getVarRefs = [];
        const macroRegex = /{{\s*(.*?)\s*}}/g;
        for (const promptId in this.prompts) {
            const prompt = this.prompts[promptId];
            const content = prompt.content || '';
            let match;
            while ((match = macroRegex.exec(content)) !== null) {
                const parts = match[1].split('::').map(p => p.trim());
                const type = parts[0];
                if (type === 'setvar' && parts.length >= 2) {
                    const varName = parts[1];
                    if (!newVariables[varName]) newVariables[varName] = { definedIn: [], referencedIn: [] };
                    newVariables[varName].definedIn.push(promptId);
                } else if (type === 'getvar' && parts.length >= 2) {
                    getVarRefs.push({ varName: parts[1], promptId });
                }
            }
        }
        this.unresolvedVariables = [];
        getVarRefs.forEach(({ varName, promptId }) => {
            if (newVariables[varName] && newVariables[varName].definedIn.length > 0) {
                newVariables[varName].referencedIn.push(promptId);
            } else {
                this.unresolvedVariables.push({ varName, promptId });
            }
        });
        this.variables = newVariables;
    },
    resetState() {
      if (this.initialJson) this.parseFromJson(this.initialJson);
    },
    updatePromptOrder(newOrder) {
      this.promptOrder = newOrder.map(p => p.id);
    },
    hidePrompt(promptId) {
      this.promptOrder = this.promptOrder.filter(id => id !== promptId);
    },
    removePrompt(promptId) {
      delete this.prompts[promptId];
      this.hidePrompt(promptId);
    },
    togglePromptEnabled(promptId) {
      const prompt = this.prompts[promptId];
      if (prompt) prompt.enabled = !(prompt.enabled !== false);
    },
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
    createNewPrompt() {
        const newId = crypto.randomUUID();
        const newPrompt = {
            id: newId,
            identifier: newId,
            name: 'New Untitled Prompt',
            content: '{{// This is a new prompt. Add your content here.}}',
            enabled: false, 
        };
        this.prompts[newId] = newPrompt;
        this.promptOrder.unshift(newId);
        this.selectPrompt(newId);
        this.navigateToPrompt(newId);
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
    deleteSelectedPrompts() {
        if (this.selectedLibraryPrompts.size === 0) return;
        if (confirm(`Are you sure you want to permanently delete ${this.selectedLibraryPrompts.size} selected prompt(s)?`)) {
            this.selectedLibraryPrompts.forEach(promptId => {
                delete this.prompts[promptId];
                this.promptOrder = this.promptOrder.filter(id => id !== promptId);
            });
            this.selectedLibraryPrompts.clear();
            this.isMultiSelectActive = false;
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
    addPromptToOrder(promptId) {
        if (!this.promptOrder.includes(promptId)) {
            this.promptOrder.unshift(promptId);
            this.navigateToPrompt(promptId);
        }
    },
    updatePromptDetail({ promptId, field, value }) {
        const prompt = this.prompts[promptId];
        if (prompt && typeof field === 'string') {
            prompt[field] = value;
            if (field === 'content') {
                this.analyzeMacros();
            }
        }
    },
    setActiveRightSidebarTab(tabName) {
        this.activeRightSidebarTab = tabName;
    },
    renameVariable({ oldName, newName }) {
        if (!newName || newName.includes(' ') || this.variables[newName]) {
            alert('Invalid or conflicting new variable name.');
            return false;
        }

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const oldNameEscaped = escapeRegExp(oldName);

        for (const promptId in this.prompts) {
            const prompt = this.prompts[promptId];
            const setvarRegex = new RegExp(`{{\s*setvar\s*::)${oldNameEscaped}(\s*::.*?\s*}}`, 'g');
            const getvarRegex = new RegExp(`{{\s*getvar\s*::)${oldNameEscaped}(\s*}}`, 'g');
            
            prompt.content = prompt.content.replace(setvarRegex, `$1${newName}$2`);
            prompt.content = prompt.content.replace(getvarRegex, `$1${newName}$2`);
        }

        this.analyzeMacros();
        this.selectMacro(newName);
        return true;
    }
  },
});
