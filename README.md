# SillyTavern Preset Editor

<div>
    <img src="https://img.shields.io/badge/Vue-3.x-brightgreen.svg" alt="Vue 3">
    <img src="https://img.shields.io/badge/TailwindCSS-4.x-blue.svg" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
</div>

A lightweight, user-friendly web editor for managing SillyTavern `preset.json` files efficiently, powered by Vue.js and Tailwind CSS.

**🌐 Try it online:** [https://stpe.nativus.workers.dev/](https://stpe.nativus.workers.dev/)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FNativu5%2FSTPresetEditor)

## 🖼 Overview

The default SillyTavern preset editor offers basic functionality but can be slow and lacks advanced editing features (e.g., macro highlighting, variable management).

This project enhances your editing experience with an intuitive, high-performance and powerful UI/UX.

<table>
  <tr>
    <td align="center" style="border: 1px solid #ddd; padding: 8px;">
      <img src="https://github.com/user-attachments/assets/24a8cbf7-932a-4dba-9852-64752fbc406c" alt="Main Editor" height="200" />
      <br>Prompt Manage & Edit
    </td>
    <td align="center" style="border: 1px solid #ddd; padding: 8px;">
      <img src="https://github.com/user-attachments/assets/86f3ca7b-0a86-4dc7-9ee3-0045fc4544d8" alt="Macro Analysis" height="200" />
      <br>Macro Analysis & Preview
    </td>
    <td align="center" style="border: 1px solid #ddd; padding: 8px;">
      <img src="https://github.com/user-attachments/assets/4a2c883c-710e-40aa-9cce-f3be7770e5ad" alt="Variable Manager" height="200" />
      <br>Variable Tools
    </td>
  </tr>
</table>

## 🎯 Key Features

- ⚡ **Real-time Editing & Saving**: Instantly edit prompts with batch selection and drag-and-drop. Changes are saved locally for secure, persistent editing.
- 🧩 **Syntax Highlighting**: Automatically highlight special macros within prompts, enabling quick reference.
- 🔍 **Macro Analysis & Preview**: Instantly analyze macros and switch between raw and preview modes for efficient editing.
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

Developed by 🤖 using Vue.js and Tailwind CSS.
