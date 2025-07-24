import { defineStore } from 'pinia';

export const usePresetStore = defineStore('preset', {
  state: () => ({
    initialJson: '', // Store the very first loaded JSON for resetting
    rawJson: '', // Store the current working JSON
    prompts: {}, // Stored as an object keyed by identifier
    promptOrder: [],
    selectedPromptId: null,
    selectedMacro: null,
    viewOptions: {
      renderMacros: true,
    },
    // Macro analysis results
    variables: {}, // { varName: { definedIn: 'promptId', referencedIn: ['promptId1', 'promptId2'] } }
    unresolvedVariables: [], // List of getvar macros that have no definition
  }),
  getters: {
    getPromptById: (state) => (id) => {
      return state.prompts[id];
    },
    orderedPrompts: (state) => {
      return state.promptOrder
        .map(id => state.prompts[id] ? { ...state.prompts[id], id } : null)
        .filter(p => p !== null);
    },
    libraryPrompts: (state) => {
        return Object.values(state.prompts);
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
            if (id) {
              acc[id] = { ...prompt, id };
            }
            return acc;
        }, {});

        const characterOrder = Array.isArray(parsed.prompt_order)
          ? parsed.prompt_order.find(item => item.character_id === 100001)
          : null;

        if (characterOrder && Array.isArray(characterOrder.order)) {
            const orderData = characterOrder.order;
            this.promptOrder = orderData.map(item => item.identifier).filter(id => id in this.prompts);
            orderData.forEach(item => {
                if (this.prompts[item.identifier]) {
                    this.prompts[item.identifier].enabled = item.enabled;
                }
            });
        } else {
            this.promptOrder = promptsArray
                .filter(p => p.enabled !== false)
                .sort((a, b) => (a.injection_order || 0) - (b.injection_order || 0))
                .map(p => p.identifier || p.name)
                .filter(Boolean);
        }
        this.analyzeMacros(); // Analyze macros after parsing
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
                    if (!newVariables[varName]) {
                        newVariables[varName] = { definedIn: null, referencedIn: [] };
                    }
                    newVariables[varName].definedIn = promptId;
                } else if (type === 'getvar' && parts.length >= 2) {
                    getVarRefs.push({ varName: parts[1], promptId });
                }
            }
        }

        // Populate referencedIn and find unresolved variables
        this.unresolvedVariables = [];
        getVarRefs.forEach(({ varName, promptId }) => {
            if (newVariables[varName]) {
                newVariables[varName].referencedIn.push(promptId);
            } else {
                this.unresolvedVariables.push({ varName, promptId });
            }
        });

        this.variables = newVariables;
        console.log('Macro analysis complete.', this.variables);
    },
    resetState() {
      if (this.initialJson) {
        this.parseFromJson(this.initialJson);
      }
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
      if (prompt) {
        prompt.enabled = !(prompt.enabled !== false);
      }
    },
    selectPrompt(promptId) {
      this.selectedPromptId = promptId;
      this.selectedMacro = null; // Deselect macro when a prompt card is selected
    },
    selectMacro(variableName) {
        if (variableName) {
            this.selectedMacro = { variableName };
            this.selectedPromptId = null; // Deselect prompt card
        }
    },
  },
});