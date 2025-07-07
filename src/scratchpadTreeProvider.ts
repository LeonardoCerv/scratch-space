import * as vscode from 'vscode';
import { Scratchpad, ScratchpadManager } from './scratchpadManager';

export class ScratchpadTreeProvider implements vscode.TreeDataProvider<ScratchpadItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ScratchpadItem | undefined | null | void> = new vscode.EventEmitter<ScratchpadItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ScratchpadItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private scratchpadManager: ScratchpadManager) {
    // Listen for changes in scratchpads
    this.scratchpadManager.onDidChange(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ScratchpadItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ScratchpadItem): Thenable<ScratchpadItem[]> {
    if (!element) {
      // Root level - return all scratchpads
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      return Promise.resolve(scratchpads.map(scratchpad => new ScratchpadItem(scratchpad)));
    }
    
    return Promise.resolve([]);
  }
}

export class ScratchpadItem extends vscode.TreeItem {
  constructor(
    public readonly scratchpad: Scratchpad
  ) {
    super(scratchpad.name, vscode.TreeItemCollapsibleState.None);
    
    this.tooltip = this.createTooltip();
    this.description = this.createDescription();
    this.contextValue = 'scratchpad';
    this.iconPath = this.getIcon();
    
    // Make item clickable
    this.command = {
      command: 'scratch-space.openScratchpad',
      title: 'Open Scratchpad',
      arguments: [scratchpad.id]
    };
  }

  private createTooltip(): string {
    const lines = this.scratchpad.content.split('\n').length;
    const chars = this.scratchpad.content.length;
    const created = this.scratchpad.createdAt.toLocaleDateString();
    const updated = this.scratchpad.updatedAt.toLocaleDateString();
    
    return `${this.scratchpad.name}
Language: ${this.scratchpad.language}
Lines: ${lines}, Characters: ${chars}
Created: ${created}
Updated: ${updated}`;
  }

  private createDescription(): string {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const showLanguage = config.get<boolean>('showLanguageInTreeView');
    
    const lines = this.scratchpad.content.split('\n').length;
    let description = '';
    
    if (lines > 1) {
      description = `${lines} lines`;
    } else if (this.scratchpad.content.length > 0) {
      description = `${this.scratchpad.content.length} chars`;
    } else {
      description = 'empty';
    }
    
    if (showLanguage && this.scratchpad.language && this.scratchpad.language !== 'plaintext') {
      description += ` • ${this.scratchpad.language}`;
    }
    
    return description;
  }

  private getIcon(): vscode.ThemeIcon {
    // Choose icon based on language
    switch (this.scratchpad.language) {
      case 'javascript':
      case 'typescript':
        return new vscode.ThemeIcon('symbol-method');
      case 'python':
        return new vscode.ThemeIcon('symbol-class');
      case 'json':
        return new vscode.ThemeIcon('symbol-object');
      case 'markdown':
        return new vscode.ThemeIcon('markdown');
      case 'html':
        return new vscode.ThemeIcon('globe');
      case 'css':
      case 'scss':
      case 'sass':
        return new vscode.ThemeIcon('symbol-color');
      default:
        return new vscode.ThemeIcon('note');
    }
  }
}
