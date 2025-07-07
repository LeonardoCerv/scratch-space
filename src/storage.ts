import * as vscode from 'vscode';
import { Scratchpad } from './types';

export class StorageManager {
  private storageUri: vscode.Uri;

  constructor(private context: vscode.ExtensionContext) {
    this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'scratchpads');
  }

  public async ensureStorageExists(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storageUri);
    } catch {
      await vscode.workspace.fs.createDirectory(this.storageUri);
    }
  }

  public async loadScratchpads(): Promise<Map<string, Scratchpad>> {
    const scratchpads = new Map<string, Scratchpad>();
    
    try {
      await this.ensureStorageExists();
      const files = await vscode.workspace.fs.readDirectory(this.storageUri);
      
      for (const [fileName, fileType] of files) {
        if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
          const filePath = vscode.Uri.joinPath(this.storageUri, fileName);
          const content = await vscode.workspace.fs.readFile(filePath);
          const scratchpad: Scratchpad = JSON.parse(content.toString());
          
          // Convert date strings back to Date objects
          scratchpad.createdAt = new Date(scratchpad.createdAt);
          scratchpad.updatedAt = new Date(scratchpad.updatedAt);
          
          scratchpads.set(scratchpad.id, scratchpad);
        }
      }
    } catch (error) {
      console.error('Error loading scratchpads:', error);
    }
    
    return scratchpads;
  }

  public async saveScratchpad(scratchpad: Scratchpad): Promise<void> {
    try {
      await this.ensureStorageExists();
      const filePath = vscode.Uri.joinPath(this.storageUri, `${scratchpad.id}.json`);
      const content = JSON.stringify(scratchpad, null, 2);
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content));
    } catch (error) {
      console.error('Error saving scratchpad:', error);
      throw error;
    }
  }

  public async deleteScratchpad(id: string): Promise<void> {
    try {
      const filePath = vscode.Uri.joinPath(this.storageUri, `${id}.json`);
      await vscode.workspace.fs.delete(filePath);
    } catch (error) {
      console.error('Error deleting scratchpad file:', error);
      throw error;
    }
  }

  public async clearAllScratchpads(): Promise<void> {
    try {
      await this.ensureStorageExists();
      const files = await vscode.workspace.fs.readDirectory(this.storageUri);
      
      for (const [fileName, fileType] of files) {
        if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
          const filePath = vscode.Uri.joinPath(this.storageUri, fileName);
          await vscode.workspace.fs.delete(filePath);
        }
      }
    } catch (error) {
      console.error('Error clearing all scratchpads:', error);
      throw error;
    }
  }

  public getStorageUri(): vscode.Uri {
    return this.storageUri;
  }
}
