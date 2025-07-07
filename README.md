# Scratch Space - VS Code Extension

A lightweight VS Code extension that provides built-in scratch space for developers - temporary tabs and files where you can quickly dump code, test snippets, or jot down ideas without cluttering your project directory.

## Features

### 🚀 Core Features

- **Scratchpad Tabs**: Create unlimited unnamed tabs that act like temporary files (e.g., "Scratch 1", "Scratch 2"...)
- **Auto-save**: Automatically saves content without needing to hit save; persists between VS Code sessions
- **Separate Context**: Scratchpads don't affect Git status, build tools, or project linting
- **Tree View Panel**: Manage, rename, and organize scratch files from the Explorer sidebar

### 📝 Key Capabilities

- **Language Support**: Choose from 20+ programming languages for syntax highlighting
- **Persistent Storage**: All scratchpads are saved to your global VS Code storage and persist between sessions
- **Quick Actions**: 
  - Create new scratchpads
  - Rename existing ones
  - Duplicate scratchpads
  - Delete individual or all scratchpads
- **Smart Organization**: View scratchpads sorted by last modified date
- **Rich Information**: See line count, character count, creation date, and last modified date

## Usage

### Creating a New Scratchpad

1. **Command Palette**: `Ctrl/Cmd + Shift + P` → "Scratch Space: New Scratchpad"
2. **Explorer Panel**: Click the "+" icon in the Scratchpads view
3. **Tree View**: Right-click in the Scratchpads panel

### Managing Scratchpads

- **Open**: Click on any scratchpad in the tree view
- **Rename**: Right-click → "Rename" or use the edit icon
- **Duplicate**: Right-click → "Duplicate" or use the copy icon
- **Delete**: Right-click → "Delete" or use the trash icon
- **Clear All**: Click the menu in the Scratchpads panel → "Clear All Scratchpads"

### Language Selection

When creating a new scratchpad, you can choose from:
- JavaScript/TypeScript
- Python
- HTML/CSS
- JSON/YAML
- Markdown
- SQL
- Shell/PowerShell
- And many more...

## Configuration

### Settings

The extension provides several configuration options:

```json
{
  "scratchSpace.autoSave": true,
  "scratchSpace.autoSaveDelay": 1000,
  "scratchSpace.defaultLanguage": "plaintext"
}
```

- **`scratchSpace.autoSave`**: Enable/disable auto-saving (default: true)
- **`scratchSpace.autoSaveDelay`**: Delay in milliseconds before auto-saving (default: 1000ms)
- **`scratchSpace.defaultLanguage`**: Default language for new scratchpads (default: "plaintext")

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl/Cmd + Shift + X)
3. Search for "Scratch Space"
4. Click Install

## Commands

- `Scratch Space: New Scratchpad` - Create a new scratchpad
- `Scratch Space: Clear All Scratchpads` - Delete all scratchpads

## Why Use Scratch Space?

### Perfect for:
- 🧪 **Experimenting** with code snippets
- 📝 **Taking quick notes** during development
- 🔄 **Testing API responses** or data transformations
- 💡 **Brainstorming** algorithm solutions
- 📋 **Temporary clipboard** for code chunks
- 🐛 **Debugging** by isolating problematic code

### Benefits:
- ✅ Keeps your project directory clean
- ✅ No unwanted files in Git
- ✅ Faster than creating temporary files
- ✅ Organized in one dedicated space
- ✅ Persistent across VS Code sessions
- ✅ Language-aware syntax highlighting

## Technical Details

- **Storage**: Uses VS Code's global storage API for persistence
- **File System**: Custom file system provider for seamless integration
- **Performance**: Lightweight with minimal memory footprint
- **Compatibility**: Works with VS Code 1.101.0 and later

## Contributing

Issues and feature requests are welcome! Please check the repository for contribution guidelines.

## License

MIT License - see LICENSE file for details.

---

**Enhance your coding workflow with Scratch Space - your personal sandbox for ideas and experiments!**
