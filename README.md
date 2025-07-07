# Scratch Space - VS Code Extension

A lightweight VS Code extension that provides built-in scratch space for developers - temporary tabs and files where you can quickly dump code, test snippets, or jot down ideas without cluttering your project directory.

## Features

### 🚀 Core Features

- **Scratchpad Tabs**: Create unlimited named tabs with proper language support
- **Language Mode Support**: Set and change language for each scratchpad with full syntax highlighting
- **Template Snippets**: Pre-built code templates for rapid prototyping in multiple languages
- **Auto-save**: Automatically saves content without needing to hit save; persists between VS Code sessions
- **Separate Context**: Scratchpads don't affect Git status, build tools, or project linting
- **Tree View Panel**: Manage, rename, and organize scratch files from the Explorer sidebar

### 📝 Enhanced Capabilities

- **🎨 Language Support**: 30+ programming languages with proper syntax highlighting
- **📋 Template Library**: Pre-built templates for:
  - JavaScript/TypeScript (Basic, Async, Classes, React Components)
  - Python (Basic, Classes, Async, Data Analysis)
  - HTML/CSS (Basic pages, Flexbox layouts)
  - SQL (CRUD operations)
  - JSON (API responses)
  - Markdown (README templates)
  - And many more!
- **🔄 Quick Actions**: 
  - Create new scratchpads with language selection
  - Create from templates with categorized browsing
  - Change language mode for existing scratchpads
  - Rename, duplicate, and delete operations
- **📊 Smart Organization**: View scratchpads sorted by last modified date with language badges
- **⚙️ Rich Configuration**: Customizable auto-save, template preferences, and display options

## Usage

### Creating Scratchpads

#### 1. Basic Scratchpad
- **Command Palette**: `Ctrl/Cmd + Shift + P` → "Scratch Space: New Scratchpad"
- **Explorer Panel**: Click the "+" icon in the Scratchpads view
- **Language Selection**: Choose from 30+ supported languages

#### 2. Template-Based Scratchpad
- **Command Palette**: `Ctrl/Cmd + Shift + P` → "Scratch Space: New Scratchpad from Template"
- **Explorer Panel**: Click the template icon in the Scratchpads view
- **Browse Templates**: `Ctrl/Cmd + Shift + P` → "Scratch Space: Browse Templates"

### Managing Scratchpads

- **Open**: Click on any scratchpad in the tree view
- **Change Language**: Right-click → "Change Language" or use the language icon
- **Rename**: Right-click → "Rename" or use the edit icon
- **Duplicate**: Right-click → "Duplicate" or use the copy icon
- **Delete**: Right-click → "Delete" or use the trash icon
- **Clear All**: Click the menu in the Scratchpads panel → "Clear All Scratchpads"

### Template Categories

Templates are organized into categories for easy browsing:

- **Basic**: Simple starter templates for each language
- **OOP**: Object-oriented programming examples
- **Async**: Asynchronous programming patterns
- **React**: React component templates
- **Types**: TypeScript interface examples
- **Data Science**: Python data analysis templates
- **Web**: HTML/CSS layouts and structures
- **API**: JSON API response templates
- **Documentation**: Markdown documentation templates
- **Database**: SQL query templates

### Language Support

The extension supports syntax highlighting for:

**Web Technologies**: HTML, CSS, SCSS, Sass, JavaScript, TypeScript
**Backend Languages**: Python, Java, C#, C++, C, PHP, Ruby, Go, Rust
**Data & Config**: JSON, YAML, XML, SQL, Markdown
**Scripting**: Shell, PowerShell, Batch
**Mobile & Modern**: Swift, Kotlin, Dart
**Scientific**: R, MATLAB, Julia
**Other**: Perl, Lua, Scala

## Configuration

### Settings

```json
{
  "scratchSpace.autoSave": true,
  "scratchSpace.autoSaveDelay": 1000,
  "scratchSpace.defaultLanguage": "plaintext",
  "scratchSpace.showTemplatePreview": true,
  "scratchSpace.favoriteTemplates": [],
  "scratchSpace.showLanguageInTreeView": true
}
```

- **`scratchSpace.autoSave`**: Enable/disable auto-saving (default: true)
- **`scratchSpace.autoSaveDelay`**: Delay in milliseconds before auto-saving (default: 1000ms)
- **`scratchSpace.defaultLanguage`**: Default language for new scratchpads (default: "plaintext")
- **`scratchSpace.showTemplatePreview`**: Show template preview when selecting (default: true)
- **`scratchSpace.favoriteTemplates`**: Array of favorite template IDs (default: [])
- **`scratchSpace.showLanguageInTreeView`**: Show language badge in tree view (default: true)

## Commands

- `Scratch Space: New Scratchpad` - Create a new scratchpad with language selection
- `Scratch Space: New Scratchpad from Template` - Create from pre-built template
- `Scratch Space: Browse Templates` - Browse and select from template library
- `Scratch Space: Clear All Scratchpads` - Delete all scratchpads

## Templates Available

### JavaScript/TypeScript
- **Basic JavaScript**: Simple function template
- **Async Function**: Async/await pattern
- **ES6 Class**: Class-based structure
- **React Component**: Functional component with hooks
- **TypeScript Interface**: Interface and implementation

### Python
- **Basic Python**: Function and main structure
- **Python Class**: Class-based OOP example
- **Async Python**: Async/await with aiohttp
- **Data Analysis**: Pandas, NumPy, Matplotlib template

### Web Development
- **Basic HTML**: Complete HTML page template
- **Flexbox Layout**: CSS flexbox examples
- **JSON API**: API response structure

### Database
- **SQL CRUD**: Complete CRUD operations template

### Documentation
- **README Template**: Comprehensive README.md structure

## Why Use Scratch Space?

### Perfect for:
- 🧪 **Language Experimentation**: Test syntax in different languages
- � **Quick Prototyping**: Start with templates and modify rapidly
- 🔄 **API Testing**: Store and test API responses with proper JSON formatting
- � **Learning**: Explore new languages with working examples
- 📋 **Code Snippets**: Store reusable code patterns
- 🐛 **Debugging**: Isolate and test problematic code

### Benefits:
- ✅ **Language-Aware**: Full syntax highlighting and IntelliSense
- ✅ **Template-Driven**: Jump-start development with proven patterns
- ✅ **Project-Clean**: Keeps your workspace organized
- ✅ **Git-Friendly**: No unwanted files in version control
- ✅ **Cross-Session**: Persistent across VS Code restarts
- ✅ **Highly Configurable**: Customize to your workflow

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl/Cmd + Shift + X)
3. Search for "Scratch Space"
4. Click Install

## Technical Details

- **Storage**: Uses VS Code's global storage API for persistence
- **File System**: Custom file system provider with proper file extensions
- **Templates**: Built-in library with 25+ professionally crafted templates
- **Language Support**: Integrated with VS Code's language server protocol
- **Performance**: Lightweight with minimal memory footprint
- **Compatibility**: Works with VS Code 1.101.0 and later

## Contributing

Issues and feature requests are welcome! Please check the repository for contribution guidelines.

## License

MIT License - see LICENSE file for details.

---

**Enhance your coding workflow with Scratch Space - your personal sandbox for ideas, experiments, and rapid prototyping!**
