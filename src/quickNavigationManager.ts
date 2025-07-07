import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadEditor } from './scratchpadEditor';

interface PaletteAction {
  label: string;
  description: string;
  action: string;
  scratchpadId?: string;
}

export class QuickNavigationManager {
  constructor(
    private scratchpadManager: ScratchpadManager,
    private scratchpadEditor: ScratchpadEditor
  ) {}

  public async quickOpenScratchpad(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      if (scratchpads.length === 0) {
        const createNew = await vscode.window.showInformationMessage(
          'No scratchpads found. Would you like to create one?',
          'Create New Scratchpad'
        );
        
        if (createNew === 'Create New Scratchpad') {
          await vscode.commands.executeCommand('scratch-space.newScratchpad');
        }
        return;
      }

      // Create quick pick items
      const quickPickItems = scratchpads.map(scratchpad => {
        const lines = scratchpad.content.split('\n').length;
        const chars = scratchpad.content.length;
        const lastModified = this.getRelativeTime(scratchpad.updatedAt);
        
        return {
          label: scratchpad.name,
          description: `${scratchpad.language} • ${lines} lines • ${chars} chars`,
          detail: `Last modified: ${lastModified}`,
          scratchpad: scratchpad
        };
      });

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'Select a scratchpad to open',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (selected) {
        await this.scratchpadEditor.openScratchpad(selected.scratchpad.id);
      }
    } catch (error) {
      console.error('Error in quick open:', error);
      vscode.window.showErrorMessage(`Failed to open scratchpad: ${error}`);
    }
  }

  public async switchScratchpad(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      if (scratchpads.length === 0) {
        vscode.window.showInformationMessage('No scratchpads available to switch to');
        return;
      }

      // Get currently active scratchpad (if any)
      const activeEditor = vscode.window.activeTextEditor;
      let currentScratchpadId: string | undefined;

      if (activeEditor && activeEditor.document.uri.scheme === 'scratchpad') {
        // Extract ID from URI
        const pathParts = activeEditor.document.uri.path.split('/');
        if (pathParts.length >= 2) {
          currentScratchpadId = pathParts[1];
        }
      }

      // Create quick pick items, excluding current scratchpad
      const quickPickItems = scratchpads
        .filter(scratchpad => scratchpad.id !== currentScratchpadId)
        .map(scratchpad => {
          const lines = scratchpad.content.split('\n').length;
          const chars = scratchpad.content.length;
          const lastModified = this.getRelativeTime(scratchpad.updatedAt);
          
          return {
            label: scratchpad.name,
            description: `${scratchpad.language} • ${lines} lines • ${chars} chars`,
            detail: `Last modified: ${lastModified}`,
            scratchpad: scratchpad
          };
        });

      if (quickPickItems.length === 0) {
        vscode.window.showInformationMessage('No other scratchpads available to switch to');
        return;
      }

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: 'Select a scratchpad to switch to',
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (selected) {
        await this.scratchpadEditor.openScratchpad(selected.scratchpad.id);
      }
    } catch (error) {
      console.error('Error in switch scratchpad:', error);
      vscode.window.showErrorMessage(`Failed to switch scratchpad: ${error}`);
    }
  }

  public async showScratchpadPalette(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      // Create actions list
      const actions: PaletteAction[] = [
        {
          label: '$(add) New Scratchpad',
          description: 'Create a new empty scratchpad',
          action: 'new'
        },
        {
          label: '$(file-add) New from Template',
          description: 'Create a scratchpad from a template',
          action: 'template'
        },
        {
          label: '$(import) Import from File',
          description: 'Import a file as a scratchpad',
          action: 'import'
        },
        {
          label: '$(clippy) Import from Clipboard',
          description: 'Create a scratchpad from clipboard content',
          action: 'clipboard'
        }
      ];

      // Add existing scratchpads
      if (scratchpads.length > 0) {
        actions.push({
          label: '$(search) Quick Open',
          description: 'Open an existing scratchpad',
          action: 'quickOpen'
        });

        // Add separator
        actions.push({
          label: '$(dash) Recent Scratchpads',
          description: '',
          action: 'separator'
        });

        // Add recent scratchpads (up to 5)
        const recentScratchpads = scratchpads.slice(0, 5);
        recentScratchpads.forEach(scratchpad => {
          const lines = scratchpad.content.split('\n').length;
          const lastModified = this.getRelativeTime(scratchpad.updatedAt);
          
          actions.push({
            label: `$(note) ${scratchpad.name}`,
            description: `${scratchpad.language} • ${lines} lines • ${lastModified}`,
            action: 'open',
            scratchpadId: scratchpad.id
          });
        });
      }

      const selected = await vscode.window.showQuickPick(actions, {
        placeHolder: 'Scratch Space Command Palette',
        matchOnDescription: true
      });

      if (selected) {
        await this.executeAction(selected);
      }
    } catch (error) {
      console.error('Error in scratchpad palette:', error);
      vscode.window.showErrorMessage(`Failed to show palette: ${error}`);
    }
  }

  private async executeAction(action: PaletteAction): Promise<void> {
    switch (action.action) {
      case 'new':
        await vscode.commands.executeCommand('scratch-space.newScratchpad');
        break;
      case 'template':
        await vscode.commands.executeCommand('scratch-space.newScratchpadWithTemplate');
        break;
      case 'import':
        await vscode.commands.executeCommand('scratch-space.importFromFile');
        break;
      case 'clipboard':
        await vscode.commands.executeCommand('scratch-space.importFromClipboard');
        break;
      case 'quickOpen':
        await this.quickOpenScratchpad();
        break;
      case 'open':
        if (action.scratchpadId) {
          await this.scratchpadEditor.openScratchpad(action.scratchpadId);
        }
        break;
      case 'separator':
        // Do nothing for separator
        break;
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  public async searchScratchpads(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      if (scratchpads.length === 0) {
        vscode.window.showInformationMessage('No scratchpads available to search');
        return;
      }

      const searchTerm = await vscode.window.showInputBox({
        prompt: 'Search scratchpads by name or content',
        placeHolder: 'Enter search term...'
      });

      if (!searchTerm || searchTerm.trim().length === 0) {
        return;
      }

      const term = searchTerm.trim().toLowerCase();
      
      // Search in names and content
      const matchingScratchpads = scratchpads.filter(scratchpad => {
        return scratchpad.name.toLowerCase().includes(term) ||
               scratchpad.content.toLowerCase().includes(term);
      });

      if (matchingScratchpads.length === 0) {
        vscode.window.showInformationMessage(`No scratchpads found matching "${searchTerm}"`);
        return;
      }

      // Create quick pick items for matches
      const quickPickItems = matchingScratchpads.map(scratchpad => {
        const lines = scratchpad.content.split('\n').length;
        const chars = scratchpad.content.length;
        const lastModified = this.getRelativeTime(scratchpad.updatedAt);
        
        // Find matching content preview
        const contentMatch = scratchpad.content.toLowerCase().includes(term);
        let detail = `Last modified: ${lastModified}`;
        
        if (contentMatch) {
          const lines = scratchpad.content.split('\n');
          const matchingLine = lines.find(line => line.toLowerCase().includes(term));
          if (matchingLine) {
            detail += ` • Preview: ${matchingLine.trim().substring(0, 50)}...`;
          }
        }
        
        return {
          label: scratchpad.name,
          description: `${scratchpad.language} • ${lines} lines • ${chars} chars`,
          detail: detail,
          scratchpad: scratchpad
        };
      });

      const selected = await vscode.window.showQuickPick(quickPickItems, {
        placeHolder: `Found ${matchingScratchpads.length} scratchpad${matchingScratchpads.length !== 1 ? 's' : ''} matching "${searchTerm}"`,
        matchOnDescription: true,
        matchOnDetail: true
      });

      if (selected) {
        await this.scratchpadEditor.openScratchpad(selected.scratchpad.id);
      }
    } catch (error) {
      console.error('Error in search scratchpads:', error);
      vscode.window.showErrorMessage(`Failed to search scratchpads: ${error}`);
    }
  }
}
