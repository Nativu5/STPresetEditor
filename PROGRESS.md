# 项目进展与结构概览 (截至阶段三)

本文档旨在总结项目当前已完成的功能和代码结构，以便清晰地进入下一阶段的开发。

---

## 已完成的工作

我们已经成功完成了项目的前三个核心阶段，并修复了在此过程中发现的关键问题。目前，应用已经具备了稳定、可用的基础编辑功能。

### 1. 项目初始化与核心数据流 (阶段一)
- **环境搭建**: 使用 Vite + Vue.js 初始化项目，并成功安装了 `pinia` 用于状态管理和 `vuedraggable` 用于拖拽功能。
- **状态管理 (Pinia)**:
    - 创建了核心的 `presetStore`，用于统一管理 `prompts` 和 `prompt_order` 等核心数据。
    - 实现了健壮的 JSON 解析逻辑，能够正确处理 `preset.example.json` 中嵌套的 `prompt_order` 结构，并能精确地针对 `character_id: 100001` 进行操作。
    - 实现了在 `prompt_order` 缺失时，根据 `enabled` 和 `injection_order` 智能生成默认排序的备用逻辑。
- **数据加载**: 应用启动时会自动加载并解析 `preset.example.json` 文件，将数据填充到 store 中。

### 2. UI 布局与静态展示 (阶段二)
- **三栏布局**: 使用 Tailwind CSS 构建了经典的三栏式编辑器布局（左侧库、中间编辑区、右侧详情）。
- **组件化**: 创建了清晰的组件目录结构 (`LeftSidebar`, `MainEditor`, `RightSidebar`)。
- **静态展示**:
    - **左侧边栏**: `PromptLibrary` 组件能够成功从 store 中读取并展示所有可用的 Prompt 模块。
    - **中间编辑区**: `EditorView` 组件能够根据 `prompt_order` 正确地渲染出已排序的 Prompt 卡片列表。
    - **右侧边栏**: `DetailsView` 组件已就位，为后续显示详情提供占位。

### 3. 核心编辑功能 (阶段三 & 修复)
- **拖拽排序**: 在中间编辑区，用户现在可以通过拖拽 `PromptCard` 来实时修改 `prompt_order` 的顺序。
- **状态切换**:
    - **启用/禁用**: 每个 Prompt 卡片都有一个按钮可以切换其 `enabled` 状态。被禁用的卡片会以灰色背景和边框进行视觉区分。
    - **隐藏**: "Hide" 按钮可以将一个 Prompt 从 `prompt_order` 中移除，使其不在中间区域显示，但仍保留在左侧库中。
    - **删除**: "Delete" 按钮可以从 `prompts` 库中彻底移除一个 Prompt。
- **详情展示**: 点击中间区域的任意 `PromptCard`，右侧详情区会显示该 Prompt 的可编辑字段（当前为占位）。
- **工具栏功能**:
    - **导入/导出**: 实现了功能完备的导入和导出弹窗。用户可以粘贴新的 JSON 进行导入，也可以将当前状态导出为格式化好的 JSON 并复制到剪贴板。
    - **重置**: "Reset" 按钮可以将所有修改一键重置为应用初次加载时的状态。

---

## 现有项目结构介绍

```
/
├─── public/
├─── src/
│    ├─── assets/
│    ├─── components/
│    │    ├─── LeftSidebar/
│    │    │    ├─── PromptLibrary.vue      # 左侧边栏，展示所有 prompts
│    │    │    └─── PromptLibraryItem.vue  # 左侧边栏中的单个 prompt
│    │    ├─── MainEditor/
│    │    │    ├─── EditorView.vue         # 中间编辑区，负责拖拽排序
│    │    │    ├─── PromptCard.vue         # 中间编辑区中的可拖拽卡片
│    │    │    └─── MacroRenderer.vue      # (已创建，待实现)
│    │    ├─── RightSidebar/
│    │    │    ├─── DetailsView.vue        # 右侧边栏，管理详情显示
│    │    │    ├─── PromptDetails.vue      # 显示选中 Prompt 的详情
│    │    │    └─── MacroDetails.vue       # (已创建，待实现)
│    │    ├─── JsonImportModal.vue        # 导入 JSON 的弹窗
│    │    ├─── JsonExportModal.vue        # 导出 JSON 的弹窗
│    │    └─── Toolbar.vue                # 顶部工具栏
│    ├─── stores/
│    │    └─── presetStore.js             # Pinia store, 核心数据与逻辑
│    ├─── App.vue                        # 应用根组件，负责布局和集成
│    ├─── main.js                        # 应用入口，初始化 Vue 和 Pinia
│    └─── style.css                      # 全局样式 (Tailwind)
├─── .gitignore
├─── index.html
├─── package.json
├─── preset.example.json                # 默认加载的数据源
├─── tailwind.config.js
└─── vite.config.js
```

项目当前状态稳定，基础功能完备。接下来可以安全地进入**阶段四：宏（Macro）系统开发**。
