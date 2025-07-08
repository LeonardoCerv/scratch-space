# Scratch Space for VS Code

A powerful and lightweight extension that brings a dedicated scratchpad environment to Visual Studio Code. Effortlessly experiment, prototype, and iterate—without cluttering your project workspace.

---

## 🚀 Key Features

- **Unlimited Scratchpads**  
    Instantly create, name, and organize as many scratch files as you need—each with full language support and syntax highlighting.

- **🆕 Enhanced Management**  
    Pin favorite scratchpads, organize with tags, apply color coding, and drag & drop to reorder. Complete visual organization system.

- **🆕 Quick Paste from Clipboard**  
    Instantly paste clipboard content into scratchpads with smart language detection. One-click productivity boost.

- **Rich Template System**  
    Jumpstart your work with built-in templates for common languages and frameworks. Create custom templates for your workflow.

- **🆕 Searchable History**  
    Track all changes with comprehensive history. Search through previous versions and restore content from any point in time.

- **🆕 Session Recovery**  
    Automatic crash detection and session restoration. Never lose work due to unexpected shutdowns with auto-backup and recovery features.

- **Simple File Conversion**  
    Right-click any file in the VS Code explorer to convert it to a scratchpad. Right-click any scratchpad to convert it back to a project file.

- **Intuitive Tree View**  
    Manage, rename, duplicate, and organize scratch files directly from the Explorer sidebar with enhanced visual features.

- **Keyboard-Driven Workflow**  
    Power users can leverage customizable shortcuts for all major actions: create, switch, export, import, search, and quick paste.

- **Zero Project Pollution**  
    Scratchpads are isolated from your project's Git status, build tools, and linters—keep your workspace clean.

---

## 🔄 New Enhanced Features

### Scratchpad Management
- **Pinned Scratchpads**: Keep important scratchpads at the top of the list
- **Tag System**: Organize scratchpads with custom tags (todo, experiment, important, etc.)
- **Color Coding**: Visual organization with 10 predefined colors
- **Drag & Drop**: Reorder scratchpads like browser tabs
- **Smart Filtering**: Filter by tags, language, or pin status
- **Group by Tags**: Toggle between flat and grouped views

### Quick Paste System
- **Instant Productivity**: `Ctrl+Alt+V` for quick paste options
- **Smart Detection**: Automatically detects content type (JSON, JavaScript, Python, etc.)
- **Multiple Options**: Paste to new scratchpad, active scratchpad, or choose existing
- **Keyboard Shortcuts**: `Ctrl+Alt+Shift+V` for paste to new scratchpad

### Advanced Organization
- **Custom Sorting**: Sort by name, creation date, last updated, or custom order
- **Bulk Operations**: Apply tags to multiple scratchpads at once
- **Visual Indicators**: Pin icons, tag badges, and color decorations
- **Persistent State**: All organization settings saved across sessions

- **Rich Language Support**  
    Over 30 programming languages, including JavaScript, TypeScript, Python, HTML, CSS, SQL, JSON, Markdown, Go, Rust, and more.

- **Template Library**  
    Jump-start your ideas with curated templates for common patterns: async functions, React components, data analysis, CRUD SQL, and more.

- **Auto-Save & Persistence**  
    Your scratchpads are always saved—no manual action required. Content persists across VS Code sessions.

- **Simple File Conversion**  
    Right-click any file in the VS Code explorer to convert it to a scratchpad. Right-click any scratchpad to convert it back to a project file.

- **Intuitive Tree View**  
    Manage, rename, duplicate, and organize scratch files directly from the Explorer sidebar.

- **Keyboard-Driven Workflow**  
    Power users can leverage customizable shortcuts for all major actions: create, switch, export, import, and search.

- **Zero Project Pollution**  
    Scratchpads are isolated from your project’s Git status, build tools, and linters—keep your workspace clean.

---

## ✨ Use Cases

- **Language Experimentation**  
    Test syntax, explore new APIs, or compare language features—without leaving your editor.

- **Rapid Prototyping**  
    Start with a template, iterate quickly, and export to your project when ready.

- **API & Data Testing**  
    Store and format API responses, experiment with JSON, or run SQL queries.

- **Learning & Documentation**  
    Capture code snippets, working examples, and markdown notes for future reference.

- **Debugging**  
    Isolate problematic code in a safe, disposable environment.

---

## 🛠️ Usage Guide

### Creating Scratchpads

- **Command Palette**:  
    `Ctrl/Cmd + Shift + P` → “Scratch Space: New Scratchpad”
- **Explorer Panel**:  
    Click the “+” icon in the Scratchpads view
- **From Template**:  
    `Ctrl/Cmd + Shift + P` → “Scratch Space: New Scratchpad from Template”  
    or use `Ctrl/Cmd + Alt + T`

### Import & Export

- **Import File**:  
    `Ctrl/Cmd + Shift + P` → “Scratch Space: Import from File”
- **Import Clipboard**:  
    `Ctrl/Cmd + Shift + P` → “Scratch Space: Import from Clipboard”
- **Export Scratchpad**:  
    Right-click → “Export to File” or `Ctrl/Cmd + Alt + E`

### Quick Navigation

- **Quick Open**:  
    `Ctrl/Cmd + Alt + O` — Fuzzy search and open any scratchpad
- **Switch Scratchpad**:  
    `Ctrl/Cmd + Alt + S`
- **Command Palette**:  
    `Ctrl/Cmd + Alt + P` — Access all scratchpad commands

### Managing Scratchpads

- **Rename, Duplicate, Delete**:  
    Right-click in the tree view or use the corresponding icons
- **Change Language**:  
    Right-click → “Change Language” or use the language badge
- **Clear All**:  
    Panel menu → “Clear All Scratchpads”

---

## 🧩 Templates & Categories

- **JavaScript/TypeScript**: Basic, Async, ES6 Class, React, TypeScript Interface
- **Python**: Basic, Class, Async, Data Analysis
- **Web**: HTML, CSS Flexbox, JSON API
- **Database**: SQL CRUD
- **Documentation**: README.md
- **And more...**

---

## ⚙️ Configuration

Customize your workflow via settings:

```json
{
    "scratchSpace.autoSave": true,
    "scratchSpace.autoSaveDelay": 1000,
    "scratchSpace.defaultLanguage": "plaintext",
    "scratchSpace.showTemplatePreview": true,
    "scratchSpace.favoriteTemplates": [],
    "scratchSpace.showLanguageInTreeView": true,
    "scratchSpace.historyEnabled": true,
    "scratchSpace.maxHistoryEntries": 100,
    "scratchSpace.historyRetentionDays": 30,
    "scratchSpace.sessionRecoveryEnabled": true,
    "scratchSpace.autoBackupInterval": 30,
    "scratchSpace.maxBackups": 50,
    "scratchSpace.enablePinning": true,
    "scratchSpace.enableTagging": true,
    "scratchSpace.enableColorCoding": true,
    "scratchSpace.enableDragAndDrop": true,
    "scratchSpace.defaultSortOrder": "custom",
    "scratchSpace.groupByTagsDefault": false
}
```

### Core Settings
- **autoSave**: Enable/disable auto-saving (default: true)
- **autoSaveDelay**: Delay before auto-save (ms)
- **defaultLanguage**: Default language for new scratchpads
- **showTemplatePreview**: Show template preview on selection
- **favoriteTemplates**: Array of favorite template IDs
- **showLanguageInTreeView**: Show language badge in tree view

### 🆕 History & Recovery Settings
- **historyEnabled**: Enable/disable history tracking (default: true)
- **maxHistoryEntries**: Maximum history entries per scratchpad (default: 100)
- **historyRetentionDays**: Days to keep history entries (default: 30)
- **sessionRecoveryEnabled**: Enable/disable session recovery (default: true)
- **autoBackupInterval**: Auto backup interval in seconds (default: 30)
- **maxBackups**: Maximum number of backups to keep (default: 50)

### 🔥 Enhanced Management Settings
- **enablePinning**: Enable pinning scratchpads to the top (default: true)
- **enableTagging**: Enable tagging system for scratchpads (default: true)
- **enableColorCoding**: Enable color coding for scratchpads (default: true)
- **enableDragAndDrop**: Enable drag and drop reordering (default: true)
- **defaultSortOrder**: Default sort order (name, created, updated, custom)
- **groupByTagsDefault**: Default to grouping scratchpads by tags (default: false)

---

## 🧭 Commands Overview

- `Scratch Space: New Scratchpad` — `Ctrl/Cmd + Alt + N`
- `Scratch Space: New Scratchpad from Template` — `Ctrl/Cmd + Alt + T`
- `Scratch Space: Browse Templates`
- `Scratch Space: Convert File to Scratchpad` — `Ctrl/Cmd + Alt + I`
- `Scratch Space: Convert Scratchpad to File` — `Ctrl/Cmd + Alt + E`
- `Scratch Space: Import from Clipboard`
- `Scratch Space: Quick Open` — `Ctrl/Cmd + Alt + O`
- `Scratch Space: Switch Scratchpad` — `Ctrl/Cmd + Alt + S`
- `Scratch Space: Search Scratchpads`
- `Scratch Space: Command Palette` — `Ctrl/Cmd + Alt + P`
- `Scratch Space: Clear All Scratchpads`
- **🆕 `Scratch Space: Show History`** — `Ctrl/Cmd + Alt + H`
- **🆕 `Scratch Space: Search History`**
- **🆕 `Scratch Space: Show Backups`**
- **🆕 `Scratch Space: Create Manual Backup`** — `Ctrl/Cmd + Alt + B`
- **🆕 `Scratch Space: Restore Session`**

### 🔥 Enhanced Management Commands
- **🆕 `Scratch Space: Quick Paste from Clipboard`** — `Ctrl/Cmd + Alt + V`
- **🆕 `Scratch Space: Paste to New Scratchpad`** — `Ctrl/Cmd + Alt + Shift + V`
- **🆕 `Scratch Space: Paste to Active Scratchpad`**
- **🆕 `Scratch Space: Toggle Pin`** — Pin/unpin scratchpads
- **🆕 `Scratch Space: Add Tag`** — Add custom tags
- **🆕 `Scratch Space: Set Color`** — Apply color coding
- **🆕 `Scratch Space: Filter by Tag`** — `Ctrl/Cmd + Alt + F`
- **🆕 `Scratch Space: Group by Tags`** — Toggle tag grouping
- **🆕 `Scratch Space: Sort Scratchpads`** — Custom sort options

---

## 💡 Why Scratch Space?

- **Language-Aware**: Full syntax highlighting and IntelliSense
- **Template-Driven**: Start fast with proven patterns
- **Project-Clean**: No stray files in your repo
- **Persistent**: Survives VS Code restarts
- **Highly Configurable**: Tailor to your workflow

---

## 🛠️ Technical Highlights

- **Storage**: Uses VS Code’s global storage API for persistence
- **File System**: Custom provider with smart file extensions
- **Templates**: 25+ professionally crafted templates
- **Performance**: Lightweight and efficient
- **Compatibility**: VS Code 1.101.0 and later

---

## 📦 Installation

1. Open VS Code
2. Go to Extensions (`Ctrl/Cmd + Shift + X`)
3. Search for “Scratch Space”
4. Click **Install**

---

## 🤝 Contributing

We welcome issues and feature requests! See the repository for guidelines.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

**Scratch Space for VS Code — Your personal sandbox for ideas, experiments, and rapid prototyping.**

