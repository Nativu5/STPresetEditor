---
title: STPresetEditor 项目概览
description: SillyTavern Preset 编辑器的完整项目概览，基于实际代码实现的功能特性总结
date: 2025-09-15
---

# STPresetEditor 项目概览

**STPresetEditor** 是一个专门为 SillyTavern `preset.json` 文件设计的现代化、可视化在线编辑工具。它将复杂的 JSON 配置转化为直观的可视化界面，为 AI Prompt 工程师提供了一个功能强大的集成开发环境（IDE）。

## 🎯 项目定位

本项目致力于解决 SillyTavern 用户在管理复杂 Prompt 预设时面临的痛点：
- 手动编辑 JSON 文件容易出错
- 复杂的宏系统（`{{setvar}}`、`{{getvar}}`）难以调试
- 变量引用关系复杂，缺乏可视化工具
- 多角色配置管理困难

## 🏗️ 技术架构

### 核心技术栈
- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **构建工具**: Vite 7.0
- **UI 框架**: Tailwind CSS v4
- **组件库**: Headless UI + Heroicons
- **特色组件**: Splitpanes (可拖拽布局)、VueDraggable (拖拽排序)

### 架构设计原则

#### 1. 单一可信源 (Single Source of Truth)
整个应用严格遵循 Pinia 作为唯一数据源的设计模式：
```
用户操作 → Pinia Actions → State 更新 → Computed/Getters → UI 响应式更新
```

#### 2. 状态驱动的响应式设计
- **核心数据**: `prompts`、`promptOrder`、`macroStateSnapshots`
- **UI 状态**: `selectedPromptId`、`macroDisplayMode`、`activeRightSidebarTab`
- **持久化策略**: 仅核心业务数据持久化，派生状态动态计算

#### 3. 组件化与职责分离
```
App.vue (根容器)
├── AppToolbar.vue (工具栏)
├── AppLayout.vue (三栏布局容器)
│   ├── LeftSidebar/PromptLibrary.vue (Prompt 库管理)
│   ├── MainEditor/EditorView.vue (主编辑区)
│   └── RightSidebar/RightSidebar.vue (详情 & 变量管理)
└── 各种 Modal 组件 (导入/导出/设置等)
```

## 🚀 核心功能特性

### 1. 可视化 Prompt 管理

#### 智能加载与解析
- 自动加载 `example.json` 作为默认数据
- 精确解析针对特定角色 (`character_id: 100001`) 的配置
- 无损导入/导出，保护其他角色配置不被破坏

#### 直观的拖拽排序
- 通过 VueDraggable 实现的流畅拖拽体验
- 实时更新 `prompt_order` 序列
- 自动保存到本地存储

#### 智能卡片操作
- **角色设置**: 下拉菜单选择 `system`/`user`/`assistant`
- **启用/禁用**: 优雅的 Switch 开关组件
- **上下文感知插入**: 新 Prompt 自动插入到当前选中项下方
- **安全删除保护**: 系统内置 Prompt 禁止删除

### 2. 革命性宏系统

#### 核心分析引擎
`analyzeAllMacros` 是整个宏系统的大脑，采用多阶段分析法：

1. **预处理清理**: 清空旧的宏数据，确保状态纯净
2. **结构化解析**: 将 `{{...}}` 文本转换为标准化的 `macroData` 对象
3. **模拟与分析**: 同时执行静态分析和运行时模拟
4. **结果聚合**: 生成完整的变量关系图和值快照

#### 宏数据结构
```typescript
interface MacroData {
  id: string;           // 宏实例唯一ID (promptId + 位置)
  full: string;         // 完整宏文本 "{{setvar::x::10}}"
  type: string;         // 宏类型: setvar/getvar/comment/random
  varName: string|null; // 变量名（如适用）
  value: string|null;   // setvar 的值
  params: string[];     // 其他参数数组
}
```

#### 双模式渲染
- **原始模式**: 显示宏的原始代码形式，支持语法高亮
- **预览模式**: `getvar` 替换为实时值，`setvar` 和注释隐藏

#### 智能错误检测
- 未定义变量引用红色波浪线警告
- 差异化高亮不同类型的宏
- 实时语法验证

### 3. 专业级变量管理

#### 统一变量视图
- 右侧边栏专门的"变量"选项卡
- 列出所有跨 Prompt 的变量定义
- 状态指示器：定义但未引用（黄色）、引用但未定义（红色）

#### 智能引用追踪
- 点击任意变量宏，高亮所有相关实例
- 类似 IDE 的"查找用法"功能
- 显示定义位置和引用位置的详细列表

#### 安全重命名工具
- 严格的新名称验证（非空、无冲突、无特殊字符）
- 全局同步更新所有 `setvar` 和 `getvar`
- 重命名后自动重新分析整个宏系统

### 4. 现代化用户体验

#### 响应式布局设计
- **桌面端**: Splitpanes 实现的可拖拽三栏布局
- **移动端**: 单视图聚焦 + 侧滑抽屉设计
- 核心编辑功能在任何设备上都完整可用

#### 无障碍模态系统
- 基于 Headless UI 的标准化 Dialog 组件
- 完美的焦点管理和键盘导航
- 导入/导出/设置等功能的独立模态

#### 高级搜索过滤
- 左侧 Prompt 库支持按名称/ID 搜索
- 实时过滤，搜索时自动重置多选状态
- 支持模糊匹配和高亮显示

### 5. 数据持久化与安全

#### 智能自动保存
- 基于 pinia-plugin-persistedstate 的实时持久化
- 仅保存核心业务数据，避免状态污染
- 页面刷新后自动恢复编辑状态

#### 安全的文件操作
- **导入**: JSON 格式验证，安全的数据覆盖
- **导出**: 格式化输出，一键复制到剪贴板
- **重置**: 一键恢复到工厂默认状态
- **精确更新**: 只修改目标角色配置，保护其他数据

## 🎨 设计亮点

### 1. 状态机式的 UI 管理
每个 UI 状态都有明确的定义和转换规则：
- `macroDisplayMode`: 'raw' ↔ 'preview'
- `activeRightSidebarTab`: 'details' ↔ 'variables'  
- `isMultiSelectActive`: 控制批量操作模式

### 2. 防抖优化的高频操作
对于用户输入等高频操作，使用 lodash debounce 优化：
```javascript
const debouncedAnalyze = debounce(analyzeAllMacros, 300);
```

### 3. 组件通信的清晰边界
- Props Down: 父组件向子组件传递状态
- Events Up: 子组件通过事件通知父组件
- Store Actions: 业务逻辑统一在 Pinia Actions 中处理

## 🔧 开发体验

### 代码质量保证
- **ESLint**: 代码质量和规范检查
- **Prettier**: 代码格式化统一
- **Vue 3 官方最佳实践**: Composition API + `<script setup>`

### 调试与监控
- 详细的 console 日志记录数据流
- 持久化生命周期钩子监控
- 清晰的错误边界和异常处理

### 扩展性设计
- 模块化的组件结构便于功能扩展
- 标准化的 MacroData 接口支持新宏类型
- 可插拔的渲染模式支持自定义显示方式

## 📈 项目成果

STPresetEditor 成功将复杂的 JSON 配置编辑转化为直观的可视化操作，极大降低了 SillyTavern 高级用户的学习成本和维护负担。通过革命性的宏系统和专业级的变量管理，为 AI Prompt 工程提供了前所未有的开发体验。

项目代码架构清晰、功能完整、性能优秀，是 Vue 3 + Pinia 技术栈在复杂业务场景下的最佳实践示例。

---

*本文档基于 2025年9月15日 的代码实现编写，反映了项目的真实功能特性和技术架构。*
