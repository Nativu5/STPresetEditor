# 项目总结与技术概览

本文档旨在全面总结本项目的已完成功能、技术架构、核心设计思想及关键算法实现，作为项目达到稳定交付状态的最终技术沉淀。

---

## 一、已完成工作 (功能列表)

项目已完成所有核心需求，提供了一个功能完整、体验流畅、界面美观的 `preset.json` 可视化编辑工具。

### 核心编辑功能
- **智能解析与加载**: 应用启动时自动加载本地 `preset.example.json`，并能精确解析其复杂的嵌套数据结构。
- **可视化排序**: 用户可在中间编辑区通过拖拽 Prompt 卡片，直观地修改 `prompt_order` 顺序。
- **Prompt 管理**: 
    - **启用/禁用**: 通过美观的 `Switch` 开关，可以方便地切换 Prompt 的 `enabled` 状态，状态会以不同的背景色明确区分。
    - **隐藏**: 可将 Prompt 从当前编辑序列中暂时移除，但保留在左侧库中以备后用。
    - **删除**: 可从 `prompts` 库中永久删除一个 Prompt。
- **详情查看**: 单击卡片可在右侧边栏查看并编辑 Prompt 的详细信息。

### 宏 (Macro) 系统
- **自动解析与分析**: 应用能自动扫描所有 Prompt，解析出 `{{...}}` 宏，并建立变量定义 (`setvar`) 与引用 (`getvar`) 的完整关系图。
- **差异化高亮**: 
    - 宏会根据其类型（变量、注释、随机等）以不同颜色高亮显示。
    - 未被定义的“悬空”变量引用会以醒目的红色波浪线进行警告。
- **变量引用追踪**: 单击任意一个变量宏 (`setvar` 或 `getvar`)，所有相关的宏实例都会被高亮，同时右侧边栏会显示该变量的定义位置和所有引用位置列表，实现了类似 IDE 的 "Find Usages" 功能。

### UI/UX 与文件操作
- **现代化 UI**: 基于 **Headless UI** 和 **Heroicons** 进行了全面的 UI 重构，界面美观、交互流畅。
- **无障碍弹窗**: 导入/导出功能使用了 Headless UI 的 `Dialog` 组件，提供了完美的焦点管理、键盘导航和过渡动画，符合无障碍标准。
- **优雅的交互组件**: Prompt 卡片上的操作被整合进 `Menu` 下拉菜单，核心的启用/禁用功能由 `Switch` 组件提供，大大提升了界面的整洁度和用户体验。
- **文件操作**: 
    - **导入**: 支持通过弹窗粘贴新的 JSON 内容，并将其加载到编辑器中。
    - **导出**: 可随时将当前编辑状态生成为格式化好的 JSON，并一键复制到剪贴板。
    - **重置**: 支持一键将所有编辑内容恢复到应用初次加载时的原始状态。

---

## 二、项目架构与核心设计

### 技术栈
- **构建工具**: Vite
- **核心框架**: Vue 3 (使用 `<script setup>` 的组合式 API)
- **状态管理**: Pinia
- **UI 框架**: Tailwind CSS v4 (通过 Vite 插件集成)
- **UI 组件库**: Headless UI (Vue)
- **图标库**: Heroicons (Vue)

### 核心设计思想：状态驱动的 UI
本项目严格遵循**单一可信源 (Single Source of Truth)** 的设计原则。所有与 `preset.json` 相关的数据，包括 `prompts` 库、`promptOrder` 排序、宏分析结果、UI 状态（如选中的 Prompt）等，全部集中在 **Pinia** 的 `presetStore` 中进行管理。

- **数据流**: 用户的任何操作（如拖拽、点击按钮）都会派发 (dispatch) 一个 **Action** 到 Store。Action 负责修改 **State**。Vue 组件则通过**计算属性 (Getters)** 响应式地订阅 State 的变化，并自动更新视图。
- **优势**: 这种模式使得数据流清晰、单向且可预测。组件本身几乎不包含任何业务逻辑，只负责“展示”和“触发”，极大地降低了代码的耦合度，提升了可维护性。

### 组件化结构
应用被拆分为一系列高内聚、低耦合的 Vue 组件，职责分明：
- `App.vue`: 根组件，负责集成主布局、工具栏和模态框。
- `Toolbar.vue`: 顶部工具栏，处理导入/导出/重置事件的派发。
- `JsonImportModal.vue` / `JsonExportModal.vue`: 基于 Headless UI `Dialog` 的功能性弹窗。
- `EditorView.vue`: 中间编辑区，集成 `vuedraggable`，管理 Prompt 列表的渲染和排序。
- `PromptCard.vue`: 核心的 Prompt 卡片，集成了 Headless UI 的 `Switch` 和 `Menu`，并负责渲染 Prompt 内容。
- `MacroRenderer.vue`: 宏渲染器，是宏系统的视觉末端，根据宏类型和状态显示不同样式。
- `DetailsView.vue`: 右侧边栏，根据 Store 中的 `selectedPromptId` 或 `selectedMacro` 动态展示对应的详情组件。

---

## 三、关键代码算法解析

### 1. `prompt_order` 的精确解析与更新
为了保证编辑器只操作指定角色的数据，同时不破坏文件中其他角色的配置，我们实现了精确的读写逻辑。

- **解析 (`parseFromJson`)**: 在解析 JSON 时，代码会遍历 `prompt_order` 数组，使用 `find` 方法定位到 `character_id` 为 `100001` 的对象。然后，只提取该对象内部的 `order` 数组作为编辑器的数据源。同时，`order` 数组中的 `enabled` 状态会被同步到 `prompts` 库中对应的 Prompt 对象上，确保状态的统一。
- **导出 (`finalJson` Getter)**: 在生成最终 JSON 时，代码会先深拷贝原始 JSON 结构。然后，同样定位到 `character_id: 100001` 的对象，并用当前编辑器中的 `promptOrder` 状态去**覆盖**其 `order` 字段。`prompt_order` 数组中的任何其他对象都保持原样，从而实现了安全、精确的“原地更新”。

### 2. 宏变量关系图的构建 (`analyzeMacros`)
这是宏系统的核心算法，它通过一个高效的两步过程来构建变量的定义-引用关系图。

1.  **初次扫描与分类**: 
    - 使用正则表达式 `/{{\s*(.*?)\s*}}/g` 遍历所有 Prompt 的 `content` 字符串，捕获所有宏。
    - 在循环中，对每个宏的内容进行解析，判断其类型。如果是 `setvar`，则在一个临时的 `newVariables` 对象中记录下变量名和其定义的 `promptId`。如果是 `getvar`，则将其变量名和所在的 `promptId` 存入一个临时的 `getVarRefs` 数组。

2.  **二次处理与关联**: 
    - 遍历 `getVarRefs` 数组。
    - 对于每一个 `getvar` 引用，去 `newVariables` 对象中查找是否存在对应的定义。如果存在，就将当前的 `promptId` 添加到该变量的 `referencedIn` 数组中。如果不存在，就将这个引用记录到 `unresolvedVariables` 数组中，以便 UI 对其进行警告。

这个算法确保了在 O(N) 的时间复杂度内（N 为所有 Prompt 的总字符数）完成了所有宏的分析，性能高效，且逻辑清晰。最终产出的 `variables` 和 `unresolvedVariables` 对象为所有后续的交互功能（高亮、详情展示）提供了坚实的数据基础。