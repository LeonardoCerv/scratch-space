import * as vscode from 'vscode';
import * as path from 'path';
import { ScratchpadManager } from './scratchpadManager';

export class ImportExportManager {
  constructor(private scratchpadManager: ScratchpadManager) {}

  public async convertFileToScratchpad(fileUri?: vscode.Uri): Promise<void> {
    try {
      let uri = fileUri;
      
      if (!uri) {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
          vscode.window.showErrorMessage('No file selected or active');
          return;
        }
        uri = activeEditor.document.uri;
      }

      if (uri.scheme !== 'file') {
        vscode.window.showErrorMessage('Can only convert files to scratchpads');
        return;
      }

      const fileContent = await vscode.workspace.fs.readFile(uri);
      const content = Buffer.from(fileContent).toString('utf8');

      const fileName = path.basename(uri.path);
      const fileExtension = path.extname(fileName);
      const baseName = path.basename(fileName, fileExtension);
      
      const language = this.detectLanguageFromExtension(fileExtension);
      
      const scratchpad = await this.scratchpadManager.createScratchpad(
        `${baseName} (from file)`,
        language
      );
      
      await this.scratchpadManager.updateScratchpad(scratchpad.id, {
        content: content
      });
      
      vscode.commands.executeCommand('scratch-space.openScratchpad', scratchpad.id);
      
      vscode.window.showInformationMessage(
        `Converted "${fileName}" to scratchpad "${scratchpad.name}"`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to convert file to scratchpad: ${error}`);
    }
  }

  public async convertScratchpadToFile(scratchpadId: string): Promise<void> {
    const scratchpad = this.scratchpadManager.getScratchpad(scratchpadId);
    if (!scratchpad) {
      vscode.window.showErrorMessage('Scratchpad not found');
      return;
    }

    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found. Please open a workspace first.');
        return;
      }

      const extension = this.getFileExtension(scratchpad.language);
      const defaultFileName = `${scratchpad.name.replace(/[^a-zA-Z0-9\\-_\\s]/g, '')}.${extension}`;

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.joinPath(workspaceFolder.uri, defaultFileName),
        filters: this.getFileFilters(scratchpad.language),
        title: `Convert "${scratchpad.name}" to file`
      });

      if (!saveUri) {
        return;
      }

      await vscode.workspace.fs.writeFile(saveUri, Buffer.from(scratchpad.content, 'utf8'));

      const action = await vscode.window.showInformationMessage(
        `Successfully converted "${scratchpad.name}" to ${path.basename(saveUri.path)}`,
        'Open File',
        'Delete Scratchpad'
      );

      if (action === 'Open File') {
        await vscode.window.showTextDocument(saveUri);
      } else if (action === 'Delete Scratchpad') {
        await this.scratchpadManager.deleteScratchpad(scratchpadId);
        vscode.window.showInformationMessage(`Scratchpad "${scratchpad.name}" deleted`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to convert scratchpad to file: ${error}`);
    }
  }

  public async importFromClipboard(): Promise<void> {
    try {
      const clipboardText = await vscode.env.clipboard.readText();
      
      if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showWarningMessage('Clipboard is empty');
        return;
      }

      const detectedLanguage = this.detectLanguageFromContent(clipboardText);
      
      const languageItems = [
        { label: `${detectedLanguage} (detected)`, description: 'Auto-detected from content', value: detectedLanguage },
        { label: 'plaintext', description: 'Plain text', value: 'plaintext' },
        { label: 'javascript', description: 'JavaScript', value: 'javascript' },
        { label: 'typescript', description: 'TypeScript', value: 'typescript' },
        { label: 'python', description: 'Python', value: 'python' },
        { label: 'html', description: 'HTML', value: 'html' },
        { label: 'css', description: 'CSS', value: 'css' },
        { label: 'json', description: 'JSON', value: 'json' },
        { label: 'markdown', description: 'Markdown', value: 'markdown' },
        { label: 'sql', description: 'SQL', value: 'sql' },
        { label: 'yaml', description: 'YAML', value: 'yaml' },
        { label: 'xml', description: 'XML', value: 'xml' }
      ];

      const selectedLanguage = await vscode.window.showQuickPick(languageItems, {
        placeHolder: 'Select language for imported content',
        matchOnDescription: true
      });

      if (!selectedLanguage) {
        return;
      }

      const scratchpad = await this.scratchpadManager.createScratchpad(
        'Clipboard Import',
        selectedLanguage.value
      );
      
      await this.scratchpadManager.updateScratchpad(scratchpad.id, {
        content: clipboardText
      });
      
      vscode.commands.executeCommand('scratch-space.openScratchpad', scratchpad.id);
      
      vscode.window.showInformationMessage(
        `Imported clipboard content as "${scratchpad.name}"`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import from clipboard: ${error}`);
    }
  }

  private detectLanguageFromExtension(extension: string): string {
    const extensionMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.htm': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'sass',
      '.less': 'less',
      '.json': 'json',
      '.md': 'markdown',
      '.markdown': 'markdown',
      '.sql': 'sql',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cs': 'csharp',
      '.sh': 'shellscript',
      '.bash': 'shellscript',
      '.zsh': 'shellscript',
      '.fish': 'shellscript',
      '.ps1': 'powershell',
      '.r': 'r',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.clj': 'clojure',
      '.elm': 'elm',
      '.ex': 'elixir',
      '.exs': 'elixir',
      '.erl': 'erlang',
      '.hrl': 'erlang',
      '.fs': 'fsharp',
      '.fsx': 'fsharp',
      '.fsi': 'fsharp',
      '.hs': 'haskell',
      '.lhs': 'haskell',
      '.lua': 'lua',
      '.pl': 'perl',
      '.pm': 'perl',
      '.vim': 'vim',
      '.dockerfile': 'dockerfile',
      '.toml': 'toml',
      '.ini': 'ini',
      '.cfg': 'ini',
      '.conf': 'ini'
    };

    return extensionMap[extension.toLowerCase()] || 'plaintext';
  }

  private detectLanguageFromContent(content: string): string {
    const firstLine = content.split('\n')[0].trim();
    
    if (firstLine.startsWith('#!')) {
      if (firstLine.includes('python')) return 'python';
      if (firstLine.includes('node')) return 'javascript';
      if (firstLine.includes('bash') || firstLine.includes('sh')) return 'shellscript';
      if (firstLine.includes('ruby')) return 'ruby';
      if (firstLine.includes('perl')) return 'perl';
    }
    
    const contentLower = content.toLowerCase();
    const contentTrimmed = content.trim();
    
    if ((contentTrimmed.startsWith('{') && contentTrimmed.endsWith('}')) ||
        (contentTrimmed.startsWith('[') && contentTrimmed.endsWith(']'))) {
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        // Not valid JSON, continue detection
      }
    }
    
    if (contentLower.includes('<!doctype html') || 
        contentLower.includes('<html') || 
        contentLower.includes('<body') ||
        contentLower.includes('<head')) {
      return 'html';
    }
    
    if (content.includes('{') && content.includes('}') && 
        (content.includes(':') || content.includes(';'))) {
      const cssPattern = /[a-zA-Z-]+\\s*:\\s*[^;]+;/;
      if (cssPattern.test(content)) {
        return 'css';
      }
    }
    
    if (contentLower.includes('function') || 
        contentLower.includes('const ') || 
        contentLower.includes('let ') ||
        contentLower.includes('var ') ||
        contentLower.includes('import ') ||
        contentLower.includes('export ') ||
        contentLower.includes('console.log') ||
        contentLower.includes('document.') ||
        contentLower.includes('window.')) {
      
      if (contentLower.includes('interface ') ||
          contentLower.includes('type ') ||
          contentLower.includes(': string') ||
          contentLower.includes(': number') ||
          contentLower.includes(': boolean') ||
          content.includes('<T>') ||
          content.includes('extends ')) {
        return 'typescript';
      }
      
      return 'javascript';
    }
    
    if (contentLower.includes('def ') || 
        contentLower.includes('import ') ||
        contentLower.includes('from ') ||
        contentLower.includes('print(') ||
        contentLower.includes('class ') ||
        contentLower.includes('if __name__')) {
      return 'python';
    }
    
    if (contentLower.includes('select ') ||
        contentLower.includes('insert ') ||
        contentLower.includes('update ') ||
        contentLower.includes('delete ') ||
        contentLower.includes('create table') ||
        contentLower.includes('alter table') ||
        contentLower.includes('drop table')) {
      return 'sql';
    }
    
    if (content.includes('# ') || 
        content.includes('## ') ||
        content.includes('### ') ||
        content.includes('```') ||
        content.includes('**') ||
        content.includes('*') ||
        content.includes('[') && content.includes('](')) {
      return 'markdown';
    }
    
    if (contentTrimmed.startsWith('<?xml') ||
        (contentTrimmed.startsWith('<') && contentTrimmed.endsWith('>') && 
         content.includes('</') && !contentLower.includes('html'))) {
      return 'xml';
    }
    
    if (content.includes('---') ||
        (content.includes(':') && !content.includes(';') && !content.includes('{'))) {
      const yamlPattern = /^[a-zA-Z_][a-zA-Z0-9_]*:\\s*.+$/m;
      if (yamlPattern.test(content)) {
        return 'yaml';
      }
    }
    
    return 'plaintext';
  }

  private getFileExtension(language: string): string {
    const extensionMap: { [key: string]: string } = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'markdown': 'md',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'php': 'php',
      'ruby': 'rb',
      'go': 'go',
      'rust': 'rs',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'csharp': 'cs',
      'shellscript': 'sh',
      'powershell': 'ps1',
      'r': 'r',
      'swift': 'swift',
      'kotlin': 'kt',
      'scala': 'scala',
      'clojure': 'clj',
      'elm': 'elm',
      'elixir': 'ex',
      'erlang': 'erl',
      'fsharp': 'fs',
      'haskell': 'hs',
      'lua': 'lua',
      'perl': 'pl',
      'vim': 'vim',
      'dockerfile': 'dockerfile',
      'toml': 'toml',
      'ini': 'ini'
    };

    return extensionMap[language] || 'txt';
  }

  private getFileFilters(language: string): { [name: string]: string[] } {
    const filters: { [name: string]: string[] } = {
      'All Files': ['*']
    };

    const extension = this.getFileExtension(language);
    
    switch (language) {
      case 'javascript':
        filters['JavaScript Files'] = ['js', 'jsx'];
        break;
      case 'typescript':
        filters['TypeScript Files'] = ['ts', 'tsx'];
        break;
      case 'python':
        filters['Python Files'] = ['py', 'pyw'];
        break;
      case 'html':
        filters['HTML Files'] = ['html', 'htm'];
        break;
      case 'css':
        filters['CSS Files'] = ['css'];
        break;
      case 'json':
        filters['JSON Files'] = ['json'];
        break;
      case 'markdown':
        filters['Markdown Files'] = ['md', 'markdown'];
        break;
      case 'sql':
        filters['SQL Files'] = ['sql'];
        break;
      case 'xml':
        filters['XML Files'] = ['xml'];
        break;
      case 'yaml':
        filters['YAML Files'] = ['yaml', 'yml'];
        break;
      default:
        filters[`${language.charAt(0).toUpperCase() + language.slice(1)} Files`] = [extension];
    }

    return filters;
  }
}
