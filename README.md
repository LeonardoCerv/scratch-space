# Scratch Space for VS Code- **Simple File Conversion**  
    Right-click any file in the VS Code explorer to convert it to a scratchpad. Right-click any scratchpad to convert it back to a project file.

- **🆕 Searchable History**  
    Track all changes with comprehensive history. Search through previous versions and restore content from any point in time.

- **🆕 Session Recovery**  
    Automatic crash detection and session restoration. Never lose work due to unexpected shutdowns with auto-backup and recovery features.

- **Intuitive Tree View**  
    Manage, rename, duplicate, and organize scratch files directly from the Explorer sidebar.

- **Keyboard-Driven Workflow**  
    Power users can leverage customizable shortcuts for all major actions: create, switch, export, import, and search.

- **Zero Project Pollution**  
    Scratchpads are isolated from your project's Git status, build tools, and linters—keep your workspace clean.

---

## 🔄 New Features

### Searchable History
- **Complete Change Tracking**: Records all scratchpad modifications including content changes, renames, and language switches
- **Powerful Search**: Find specific changes using keywords and content search
- **One-Click Restore**: Restore any scratchpad to a previous state with a single click
- **Configurable Retention**: Set how long to keep history and how many entries to maintain

### Session Recovery
- **Crash Detection**: Automatically detects unexpected VS Code shutdowns
- **Auto Backup**: Continuously backs up your work at configurable intervals
- **Smart Recovery**: Restores open scratchpads, cursor positions, and editor state
- **Manual Backups**: Create named backups of important scratchpad states

---ightweight extension that### File Conversion

- **Convert File to Scratchpad**:  
    Right-click any file in the Explorer → "Convert to Scratchpad"
- **Convert Scratchpad to File**:  
    Right-click any scratchpad in the tree → "Convert to File"
- **Import from Clipboard**:  
    `Ctrl/Cmd + Shift + P` → "Scratch Space: Import from Clipboard"a dedicated scratchpad environment to Visual Studio Code. Effortlessly experiment, prototype, and iterate—without cluttering your project workspace.

---

## 🚀 Key Features

- **Unlimited Scratchpads**  
    Instantly create, name, and organize as many scratch files as you need—each with full language support and syntax highlighting.

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
    "scratchSpace.maxBackups": 50
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

