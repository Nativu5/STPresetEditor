# Tavern Preset Editor

A modern, web-based visual editor for managing complex `preset.json` files, built with Vue.js, Pinia, and Tailwind CSS.

---

## Features

This editor provides a complete, intuitive, and robust interface for managing all aspects of a `preset.json` file.

### Core Editing
- **Smart Parsing**: Automatically loads and accurately parses `preset.json`, handling complex nested structures.
- **Visual Sorting**: Drag and drop prompt cards in the main editor to intuitively reorder the `prompt_order`.
- **Prompt Management**:
    - **Enable/Disable**: Use a sleek `Switch` to toggle a prompt's `enabled` status, with clear visual feedback.
    - **Hide/Show**: Temporarily remove prompts from the active order and add them back from the library with a single click.
    - **Create/Delete**: Create new prompts with placeholder content or permanently delete them from the library, with multi-select support for bulk operations.
- **Detail Editing**: A dedicated panel to view and edit the details of any selected prompt in real-time.

### Advanced Macro System
- **Automatic Analysis**: The editor scans all prompts to parse `{{...}}` macros, building a complete map of variable definitions (`setvar`) and references (`getvar`).
- **Syntax Highlighting**: Macros are highlighted with different colors based on their type (variables, comments, randomizers, etc.). Undefined variable references are flagged with a warning style.
- **Variable "Find Usages"**: Click any variable macro (`setvar` or `getvar`), and all related instances will be highlighted across the editor. The details panel will show where the variable is defined and all prompts that reference it.

### Variable Management
- **Centralized Dashboard**: A dedicated "Variables" tab lists every defined variable in the project for a high-level overview.
- **Safe Rename**: A powerful tool to safely rename variables. It checks for conflicts and, upon execution, updates the name across every relevant `setvar` and `getvar` macro in the entire project.

### Modern UI/UX
- **Resizable Panes**: The three main panels can be smoothly resized for a customized workspace, powered by `splitpanes`.
- **Polished Components**: The UI is built with **Headless UI** and styled with **Tailwind CSS**, ensuring a modern, beautiful, and accessible experience.
- **Heroicons**: A complete and consistent icon set enhances visual clarity.
- **File Operations**: Import/Export your `preset.json` through accessible modals, and reset all changes to the initial state with a single click.
- **Custom-Styled Scrollbars**: Even the scrollbars are styled to be subtle and fit the application's aesthetic.

---

## Tech Stack & Architecture

- **Build Tool**: Vite
- **Core Framework**: Vue 3 (Composition API with `<script setup>`)
- **State Management**: Pinia
- **UI Framework**: Tailwind CSS v4 (via Vite plugin)
- **Component Library**: Headless UI (Vue)
- **Icons**: Heroicons (Vue)
- **Layout**: Splitpanes

### Core Design: State-Driven UI
This project is built on a **Single Source of Truth** architecture. All application data—the `prompts` library, `promptOrder`, macro analysis results, and UI state—is managed centrally in a **Pinia** store (`presetStore`).

User actions dispatch **Actions** to the store, which modify the **State**. Vue components reactively subscribe to this state via **Getters** and **Computed Properties**, automatically updating the view. This unidirectional data flow makes the application predictable, maintainable, and easy to debug.

---

## Key Algorithms

### 1. Precise `prompt_order` Handling
To ensure the editor only modifies data for a specific character (`character_id: 100001`) without corrupting other data in the file, a precise read/write logic was implemented.
- **Parsing**: The `parseFromJson` action finds the specific object in the `prompt_order` array and extracts its `order` array as the source of truth.
- **Exporting**: The `finalJson` getter performs a safe, in-place update, ensuring that only the relevant character's order is overwritten, while all other data is preserved.

### 2. Macro Relationship Mapping
A two-pass algorithm in the `analyzeMacros` action efficiently builds the variable definition-reference map:
1.  **Scan & Classify**: A single pass with a regex (`/{{\s*(.*?)\s*}}/g`) iterates through all prompt content, classifying macros as `setvar` (definitions) or `getvar` (references).
2.  **Relate & Resolve**: A second, quick loop over the collected references populates the relationship map and identifies any `getvar` calls that lack a corresponding definition, flagging them for the UI.

This approach ensures high performance and provides the robust data foundation for all macro-related features.