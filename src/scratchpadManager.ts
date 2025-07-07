import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { HistoryManager } from './historyManager';

export interface Scratchpad {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ScratchpadManager {
  private scratchpads: Map<string, Scratchpad> = new Map();
  private storageUri: vscode.Uri;
  private autoSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private onDidChangeScratchpads = new vscode.EventEmitter<void>();
  private historyManager: HistoryManager;
  
  public readonly onDidChange = this.onDidChangeScratchpads.event;

  constructor(private context: vscode.ExtensionContext) {
    this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'scratchpads');
    this.historyManager = new HistoryManager(context);
    this.loadScratchpads();
  }

  private async ensureStorageExists(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storageUri);
    } catch {
      await vscode.workspace.fs.createDirectory(this.storageUri);
    }
  }

  private async loadScratchpads(): Promise<void> {
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
          
          this.scratchpads.set(scratchpad.id, scratchpad);
        }
      }
    } catch (error) {
      console.error('Error loading scratchpads:', error);
    }
  }

  private async saveScratchpad(scratchpad: Scratchpad): Promise<void> {
    try {
      await this.ensureStorageExists();
      const filePath = vscode.Uri.joinPath(this.storageUri, `${scratchpad.id}.json`);
      const content = JSON.stringify(scratchpad, null, 2);
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content));
    } catch (error) {
      console.error('Error saving scratchpad:', error);
    }
  }

  private async deleteScratchpadFile(id: string): Promise<void> {
    try {
      const filePath = vscode.Uri.joinPath(this.storageUri, `${id}.json`);
      await vscode.workspace.fs.delete(filePath);
    } catch (error) {
      console.error('Error deleting scratchpad file:', error);
    }
  }

  public async createScratchpad(name?: string, language?: string): Promise<Scratchpad> {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const defaultLanguage = config.get<string>('defaultLanguage') || 'plaintext';
    
    const id = this.generateId();
    const scratchpadName = name || `Scratch ${this.scratchpads.size + 1}`;
    const scratchpadLanguage = language || defaultLanguage;
    
    const scratchpad: Scratchpad = {
      id,
      name: scratchpadName,
      content: '',
      language: scratchpadLanguage,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scratchpads.set(id, scratchpad);
    await this.saveScratchpad(scratchpad);
    
    // Add to history
    await this.addHistoryEntry(
      id,
      scratchpad.content,
      'create',
      { description: `Created scratchpad: ${scratchpadName}` }
    );
    
    this.onDidChangeScratchpads.fire();
    
    return scratchpad;
  }

  private async addHistoryEntry(
    scratchpadId: string,
    content: string,
    changeType: 'create' | 'update' | 'delete' | 'rename' | 'language-change',
    metadata?: any
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const historyEnabled = config.get<boolean>('historyEnabled', true);
    
    if (historyEnabled) {
      await this.historyManager.addHistoryEntry(scratchpadId, content, changeType, metadata);
    }
  }

  public async updateScratchpad(id: string, updates: Partial<Scratchpad>): Promise<void> {
    const scratchpad = this.scratchpads.get(id);
    if (!scratchpad) {
      throw new Error(`Scratchpad with id ${id} not found`);
    }

    const previousContent = scratchpad.content;
    Object.assign(scratchpad, updates, { updatedAt: new Date() });
    this.scratchpads.set(id, scratchpad);
    
    // Add to history if content changed
    if (updates.content !== undefined && updates.content !== previousContent) {
      await this.addHistoryEntry(
        id,
        scratchpad.content,
        'update',
        { oldValue: previousContent, newValue: updates.content }
      );
    }
    
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const autoSave = config.get<boolean>('autoSave');
    
    if (autoSave) {
      this.scheduleAutoSave(scratchpad);
    } else {
      await this.saveScratchpad(scratchpad);
    }
    
    this.onDidChangeScratchpads.fire();
  }

  private scheduleAutoSave(scratchpad: Scratchpad): void {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const delay = config.get<number>('autoSaveDelay') || 1000;
    
    // Clear existing timeout
    const existingTimeout = this.autoSaveTimeouts.get(scratchpad.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Schedule new save
    const timeout = setTimeout(async () => {
      await this.saveScratchpad(scratchpad);
      this.autoSaveTimeouts.delete(scratchpad.id);
    }, delay);
    
    this.autoSaveTimeouts.set(scratchpad.id, timeout);
  }

  public async deleteScratchpad(id: string): Promise<void> {
    const scratchpad = this.scratchpads.get(id);
    if (!scratchpad) {
      throw new Error(`Scratchpad with id ${id} not found`);
    }

    // Add to history before deletion
    await this.addHistoryEntry(
      id,
      scratchpad.content,
      'delete',
      { description: `Deleted scratchpad: ${scratchpad.name}` }
    );

    this.scratchpads.delete(id);
    await this.deleteScratchpadFile(id);
    
    // Clear any pending auto-save
    const timeout = this.autoSaveTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.autoSaveTimeouts.delete(id);
    }
    
    this.onDidChangeScratchpads.fire();
  }

  public async duplicateScratchpad(id: string): Promise<Scratchpad> {
    const original = this.scratchpads.get(id);
    if (!original) {
      throw new Error(`Scratchpad with id ${id} not found`);
    }

    const newId = this.generateId();
    const duplicate: Scratchpad = {
      id: newId,
      name: `${original.name} (Copy)`,
      content: original.content,
      language: original.language,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scratchpads.set(newId, duplicate);
    await this.saveScratchpad(duplicate);
    this.onDidChangeScratchpads.fire();
    
    return duplicate;
  }

  public async renameScratchpad(id: string, newName: string): Promise<void> {
    const scratchpad = this.scratchpads.get(id);
    if (!scratchpad) {
      throw new Error(`Scratchpad with id ${id} not found`);
    }

    const oldName = scratchpad.name;
    scratchpad.name = newName;
    scratchpad.updatedAt = new Date();
    
    // Add to history
    await this.addHistoryEntry(
      id,
      scratchpad.content,
      'rename',
      { oldValue: oldName, newValue: newName, description: `Renamed from "${oldName}" to "${newName}"` }
    );
    
    await this.saveScratchpad(scratchpad);
    this.onDidChangeScratchpads.fire();
  }

  public async changeLanguage(id: string, newLanguage: string): Promise<void> {
    const scratchpad = this.scratchpads.get(id);
    if (!scratchpad) {
      throw new Error(`Scratchpad with id ${id} not found`);
    }

    const oldLanguage = scratchpad.language;
    scratchpad.language = newLanguage;
    scratchpad.updatedAt = new Date();
    
    // Add to history
    await this.addHistoryEntry(
      id,
      scratchpad.content,
      'language-change',
      { oldValue: oldLanguage, newValue: newLanguage, description: `Changed language from ${oldLanguage} to ${newLanguage}` }
    );
    
    await this.saveScratchpad(scratchpad);
    this.onDidChangeScratchpads.fire();
  }

  public async clearAllScratchpads(): Promise<void> {
    // Clear all timeouts
    this.autoSaveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.autoSaveTimeouts.clear();
    
    // Delete all files
    const ids = Array.from(this.scratchpads.keys());
    for (const id of ids) {
      await this.deleteScratchpadFile(id);
    }
    
    this.scratchpads.clear();
    this.onDidChangeScratchpads.fire();
  }

  public getScratchpad(id: string): Scratchpad | undefined {
    return this.scratchpads.get(id);
  }

  public getAllScratchpads(): Scratchpad[] {
    return Array.from(this.scratchpads.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public dispose(): void {
    this.autoSaveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.autoSaveTimeouts.clear();
    this.historyManager.dispose();
    this.onDidChangeScratchpads.dispose();
  }

  public getHistoryManager(): HistoryManager {
    return this.historyManager;
  }
}
