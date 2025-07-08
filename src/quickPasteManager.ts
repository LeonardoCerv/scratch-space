import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';

export class QuickPasteManager {
  constructor(
    private scratchpadManager: ScratchpadManager,
    private context: vscode.ExtensionContext
  ) {}

  public async pasteToNewScratchpad(): Promise<void> {
    try {
      // Get clipboard content
      const clipboardText = await vscode.env.clipboard.readText();
      
      if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showWarningMessage('Clipboard is empty');
        return;
      }

      // Detect language from clipboard content
      const detectedLanguage = this.detectLanguage(clipboardText);
      
      // Create new scratchpad with clipboard content
      const scratchpad = await this.scratchpadManager.createScratchpad(
        `Paste ${new Date().toLocaleTimeString()}`,
        detectedLanguage
      );

      // Update content
      await this.scratchpadManager.updateScratchpad(scratchpad.id, { content: clipboardText });

      // Open the scratchpad
      const uri = vscode.Uri.parse(`scratchpad:${scratchpad.id}`);
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);

      vscode.window.showInformationMessage(`Pasted to new scratchpad: ${scratchpad.name}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to paste to scratchpad: ${error}`);
    }
  }

  public async pasteToActiveScratchpad(): Promise<void> {
    try {
      const activeEditor = vscode.window.activeTextEditor;
      
      if (!activeEditor || activeEditor.document.uri.scheme !== 'scratchpad') {
        vscode.window.showWarningMessage('No active scratchpad found');
        return;
      }

      // Get clipboard content
      const clipboardText = await vscode.env.clipboard.readText();
      
      if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showWarningMessage('Clipboard is empty');
        return;
      }

      // Insert at cursor position
      await activeEditor.edit(editBuilder => {
        editBuilder.insert(activeEditor.selection.active, clipboardText);
      });

      vscode.window.showInformationMessage('Pasted to active scratchpad');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to paste to scratchpad: ${error}`);
    }
  }

  public async quickPasteWithOptions(): Promise<void> {
    try {
      const clipboardText = await vscode.env.clipboard.readText();
      
      if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showWarningMessage('Clipboard is empty');
        return;
      }

      const options = [
        {
          label: '$(add) New Scratchpad',
          description: 'Create new scratchpad with clipboard content',
          action: 'new'
        },
        {
          label: '$(edit) Active Scratchpad',
          description: 'Paste to currently active scratchpad',
          action: 'active'
        },
        {
          label: '$(list-unordered) Choose Scratchpad',
          description: 'Select existing scratchpad to paste into',
          action: 'choose'
        }
      ];

      const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'How do you want to paste?'
      });

      if (!selected) return;

      switch (selected.action) {
        case 'new':
          await this.pasteToNewScratchpad();
          break;
        case 'active':
          await this.pasteToActiveScratchpad();
          break;
        case 'choose':
          await this.pasteToChosenScratchpad();
          break;
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to paste: ${error}`);
    }
  }

  private async pasteToChosenScratchpad(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      if (scratchpads.length === 0) {
        vscode.window.showWarningMessage('No scratchpads available');
        return;
      }

      const items = scratchpads.map(sp => ({
        label: sp.name,
        description: `${sp.language} • ${sp.content.split('\n').length} lines`,
        scratchpad: sp
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select scratchpad to paste into'
      });

      if (!selected) return;

      const clipboardText = await vscode.env.clipboard.readText();
      
      // Open the scratchpad
      const uri = vscode.Uri.parse(`scratchpad:${selected.scratchpad.id}`);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      // Insert at the end
      const lastLine = document.lineCount - 1;
      const lastChar = document.lineAt(lastLine).text.length;
      const endPosition = new vscode.Position(lastLine, lastChar);
      
      await editor.edit(editBuilder => {
        editBuilder.insert(endPosition, '\n' + clipboardText);
      });

      vscode.window.showInformationMessage(`Pasted to ${selected.scratchpad.name}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to paste to scratchpad: ${error}`);
    }
  }

  private detectLanguage(content: string): string {
    // Simple language detection based on content patterns
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim() || '';
    
    // Check for common patterns
    if (firstLine.startsWith('<!DOCTYPE') || firstLine.startsWith('<html')) {
      return 'html';
    }
    
    if (firstLine.includes('<?xml') || content.includes('</')) {
      return 'xml';
    }
    
    if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
      return 'javascript';
    }
    
    if (content.includes('def ') || content.includes('import ') || content.includes('print(')) {
      return 'python';
    }
    
    if (content.includes('public class ') || content.includes('System.out.println')) {
      return 'java';
    }
    
    if (content.includes('SELECT ') || content.includes('INSERT ') || content.includes('CREATE TABLE')) {
      return 'sql';
    }
    
    if (content.includes('```') || content.includes('##') || content.includes('**')) {
      return 'markdown';
    }
    
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not JSON
    }
    
    return 'plaintext';
  }
}
