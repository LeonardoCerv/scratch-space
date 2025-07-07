import * as vscode from 'vscode';
import { ScratchpadManager, Scratchpad } from './scratchpadManager';
import { ScratchpadFileSystemProvider } from './scratchpadFileSystem';

export class ScratchpadEditor {
  private openDocuments: Map<string, vscode.TextDocument> = new Map();
  private fileSystemProvider: ScratchpadFileSystemProvider;

  constructor(private scratchpadManager: ScratchpadManager) {
    this.fileSystemProvider = new ScratchpadFileSystemProvider(scratchpadManager);
    
    // Register the file system provider
    vscode.workspace.registerFileSystemProvider('scratchpad', this.fileSystemProvider, {
      isCaseSensitive: true,
      isReadonly: false
    });
    
    // Listen for document close events
    vscode.workspace.onDidCloseTextDocument(this.onDocumentClosed, this);
  }

  public async openScratchpad(id: string): Promise<void> {
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    if (!scratchpad) {
      vscode.window.showErrorMessage(`Scratchpad not found: ${id}`);
      return;
    }

    try {
      // Create a unique URI for this scratchpad using our file system provider
      const uri = ScratchpadFileSystemProvider.createUri(scratchpad.id, scratchpad.name, scratchpad.language);
      
      // Check if document is already open
      let document = this.openDocuments.get(id);
      
      if (!document) {
        // Open document using our file system provider
        document = await vscode.workspace.openTextDocument(uri);
        this.openDocuments.set(id, document);
      }

      // Show the document
      const editor = await vscode.window.showTextDocument(document, {
        preview: false,
        preserveFocus: false
      });

      // The file system provider should handle content synchronization
      
    } catch (error) {
      console.error('Error opening scratchpad:', error);
      vscode.window.showErrorMessage(`Failed to open scratchpad: ${error}`);
    }
  }

  private onDocumentClosed(document: vscode.TextDocument): void {
    // Find and remove the scratchpad document
    const scratchpadId = this.findScratchpadByDocument(document);
    if (scratchpadId) {
      this.openDocuments.delete(scratchpadId);
    }
  }

  private findScratchpadByDocument(document: vscode.TextDocument): string | undefined {
    for (const [id, doc] of this.openDocuments.entries()) {
      if (doc === document) {
        return id;
      }
    }
    return undefined;
  }

  public async createAndOpenScratchpad(name?: string, language?: string): Promise<void> {
    try {
      const scratchpad = await this.scratchpadManager.createScratchpad(name, language);
      await this.openScratchpad(scratchpad.id);
    } catch (error) {
      console.error('Error creating scratchpad:', error);
      vscode.window.showErrorMessage(`Failed to create scratchpad: ${error}`);
    }
  }

  public async renameScratchpad(id: string): Promise<void> {
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    if (!scratchpad) {
      vscode.window.showErrorMessage(`Scratchpad not found: ${id}`);
      return;
    }

    const newName = await vscode.window.showInputBox({
      prompt: 'Enter new name for scratchpad',
      value: scratchpad.name,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Name cannot be empty';
        }
        return null;
      }
    });

    if (newName && newName !== scratchpad.name) {
      try {
        await this.scratchpadManager.renameScratchpad(id, newName.trim());
        vscode.window.showInformationMessage(`Scratchpad renamed to "${newName}"`);
        
        // If the document is open, we might need to refresh the tab
        // VS Code should handle this automatically with our file system provider
      } catch (error) {
        console.error('Error renaming scratchpad:', error);
        vscode.window.showErrorMessage(`Failed to rename scratchpad: ${error}`);
      }
    }
  }

  public async duplicateScratchpad(id: string): Promise<void> {
    try {
      const duplicate = await this.scratchpadManager.duplicateScratchpad(id);
      vscode.window.showInformationMessage(`Scratchpad duplicated as "${duplicate.name}"`);
      
      // Optionally open the duplicate
      const openDuplicate = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Open the duplicated scratchpad?'
      });
      
      if (openDuplicate === 'Yes') {
        await this.openScratchpad(duplicate.id);
      }
    } catch (error) {
      console.error('Error duplicating scratchpad:', error);
      vscode.window.showErrorMessage(`Failed to duplicate scratchpad: ${error}`);
    }
  }

  public async deleteScratchpad(id: string): Promise<void> {
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    if (!scratchpad) {
      vscode.window.showErrorMessage(`Scratchpad not found: ${id}`);
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete "${scratchpad.name}"?`,
      { modal: true },
      'Delete'
    );

    if (confirm === 'Delete') {
      try {
        // Close document if open
        const document = this.openDocuments.get(id);
        if (document) {
          // Find and close the editor
          const editors = vscode.window.visibleTextEditors;
          for (const editor of editors) {
            if (editor.document === document) {
              await vscode.window.showTextDocument(editor.document);
              await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
              break;
            }
          }
        }

        await this.scratchpadManager.deleteScratchpad(id);
        vscode.window.showInformationMessage(`Scratchpad "${scratchpad.name}" deleted`);
      } catch (error) {
        console.error('Error deleting scratchpad:', error);
        vscode.window.showErrorMessage(`Failed to delete scratchpad: ${error}`);
      }
    }
  }

  public async changeLanguage(id: string): Promise<void> {
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    if (!scratchpad) {
      vscode.window.showErrorMessage(`Scratchpad not found: ${id}`);
      return;
    }

    const languages = [
      'plaintext', 'javascript', 'typescript', 'python', 'html', 'css', 'scss', 'sass',
      'json', 'markdown', 'xml', 'yaml', 'sql', 'shell', 'powershell', 'bat',
      'java', 'csharp', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'dart', 'perl', 'lua', 'r', 'matlab', 'julia', 'scala'
    ];

    const selectedLanguage = await vscode.window.showQuickPick(
      languages.map(lang => ({
        label: lang,
        description: lang === scratchpad.language ? '(current)' : undefined
      })),
      {
        placeHolder: `Select language for "${scratchpad.name}"`,
        matchOnDescription: true
      }
    );

    if (selectedLanguage && selectedLanguage.label !== scratchpad.language) {
      try {
        await this.scratchpadManager.changeLanguage(id, selectedLanguage.label);
        vscode.window.showInformationMessage(`Language changed to ${selectedLanguage.label}`);
        
        // If the document is open, update its language mode
        const document = this.openDocuments.get(id);
        if (document) {
          await vscode.languages.setTextDocumentLanguage(document, selectedLanguage.label);
        }
      } catch (error) {
        console.error('Error changing language:', error);
        vscode.window.showErrorMessage(`Failed to change language: ${error}`);
      }
    }
  }

  public dispose(): void {
    this.openDocuments.clear();
  }
}
