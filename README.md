# ST Preset Editor

<div>
    <img src="https://img.shields.io/badge/Vue-3.x-brightgreen.svg" alt="Vue 3">
    <img src="https://img.shields.io/badge/TailwindCSS-4.x-blue.svg" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
</div>

A lightweight, user-friendly web editor for managing SillyTavern `preset.json` files efficiently, powered by Vue.js and Tailwind CSS.

## 🖼 Overview

The default SillyTavern preset editor offers basic functionality but can be slow and lacks advanced editing features (e.g., macro highlighting, variable management).

This project enhances your editing experience with an intuitive, high-performance and powerful UI/UX.

## 🎯 Key Features

- ⚡ **Real-time Editing**: Instantly modify prompts with batch selection and drag-and-drop support.
- 🧩 **Syntax Highlighting**: Automatically highlight special macros within prompts, enabling quick reference.
- 📊 **Variable Management**: Efficiently rename and track variable usage across all prompts.

## 🚀 Getting Started

1. 📥 **Import**: Load your existing `preset.json` file via the import modal.
2. ✏️ **Edit**: Visually manage, modify, and rearrange prompts effortlessly.
3. 🧩 **Analyze**: Track macros and variables, viewing their usage across prompts.
4. 📤 **Export**: Save and export your updated JSON file for use with SillyTavern.

## 🚧 Development

Run the development server with hot-reloading:

```bash
npm install
npm run dev
```

Access the app at [http://localhost:5173](http://localhost:5173) (default port).

## 🚢 Deployment

Build for production:

```bash
npm run build
```

Deploy the contents of the generated `dist` folder to any static hosting provider (e.g., GitHub Pages, Netlify, Vercel).

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request if you encounter any bugs or have feature suggestions.

---

Developed with 💚 using Vue.js and Tailwind CSS.
