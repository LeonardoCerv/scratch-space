import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';

export class ScratchpadDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[]> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[]> = this._onDidChangeFileDecorations.event;

  constructor(private scratchpadManager: ScratchpadManager) {
    // Listen for changes in scratchpads to update decorations
    this.scratchpadManager.onDidChange(() => {
      this._onDidChangeFileDecorations.fire(undefined as any);
    });
  }

  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    if (uri.scheme !== 'scratchpad') {
      return undefined;
    }

    const scratchpadId = uri.path.substring(1);
    const scratchpad = this.scratchpadManager.getScratchpad(scratchpadId);
    
    if (!scratchpad) {
      return undefined;
    }

    let badge: string | undefined;
    let tooltip: string | undefined;
    let color: vscode.ThemeColor | undefined;

    // Show pin badge
    if (scratchpad.pinned) {
      badge = '📌';
      tooltip = 'Pinned scratchpad';
    }

    // Show tag count
    if (scratchpad.tags.length > 0) {
      badge = badge ? `${badge} [${scratchpad.tags.length}]` : `[${scratchpad.tags.length}]`;
      tooltip = tooltip ? `${tooltip} • Tags: ${scratchpad.tags.join(', ')}` : `Tags: ${scratchpad.tags.join(', ')}`;
    }

    // Apply color coding
    if (scratchpad.color) {
      color = new vscode.ThemeColor('activityBar.foreground');
      tooltip = tooltip ? `${tooltip} • Color: ${scratchpad.color}` : `Color: ${scratchpad.color}`;
    }

    if (badge || color) {
      return {
        badge,
        tooltip,
        color
      };
    }

    return undefined;
  }

  public refresh(): void {
    this._onDidChangeFileDecorations.fire(undefined as any);
  }
}

export class ScratchpadTabColorProvider {
  private disposables: vscode.Disposable[] = [];

  constructor(private scratchpadManager: ScratchpadManager) {
    this.setupTabColorHandling();
  }

  private setupTabColorHandling(): void {
    // Listen for tab changes to apply colors
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.uri.scheme === 'scratchpad') {
          this.updateTabColor(editor);
        }
      })
    );

    // Listen for scratchpad changes to update colors
    this.disposables.push(
      this.scratchpadManager.onDidChange(() => {
        this.updateAllTabColors();
      })
    );
  }

  private updateTabColor(editor: vscode.TextEditor): void {
    const uri = editor.document.uri;
    if (uri.scheme !== 'scratchpad') {
      return;
    }

    const scratchpadId = uri.path.substring(1);
    const scratchpad = this.scratchpadManager.getScratchpad(scratchpadId);
    
    if (scratchpad?.color) {
      // Apply color to the editor tab (through configuration)
      this.applyTabColor(scratchpad.color);
    }
  }

  private applyTabColor(color: string): void {
    // This would require custom CSS injection or workbench theming
    // For now, we'll use the status bar as a visual indicator
    vscode.window.setStatusBarMessage(`Scratchpad Color: ${color}`, 3000);
  }

  private updateAllTabColors(): void {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      this.updateTabColor(activeEditor);
    }
  }

  public dispose(): void {
    this.disposables.forEach(disposable => disposable.dispose());
  }
}
