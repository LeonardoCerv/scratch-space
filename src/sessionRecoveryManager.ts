import * as vscode from 'vscode';

export interface SessionState {
  activeScratchpadId?: string;
  openScratchpadIds: string[];
  viewState: {
    [scratchpadId: string]: {
      selection?: vscode.Selection;
      visibleRanges?: vscode.Range[];
      scrollTop?: number;
    };
  };
  timestamp: Date;
}

export interface BackupEntry {
  scratchpadId: string;
  content: string;
  timestamp: Date;
  autoBackup: boolean;
}

export class SessionRecoveryManager {
  private sessionState: SessionState;
  private backupEntries: Map<string, BackupEntry> = new Map();
  private storageUri: vscode.Uri;
  private sessionStateFile: vscode.Uri;
  private backupInterval: NodeJS.Timeout | null = null;
  private backupIntervalMs: number = 30000; // 30 seconds
  private maxBackups: number = 50; // Maximum number of backups to keep
  
  constructor(private context: vscode.ExtensionContext) {
    this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'session');
    this.sessionStateFile = vscode.Uri.joinPath(this.storageUri, 'session-state.json');
    this.sessionState = {
      openScratchpadIds: [],
      viewState: {},
      timestamp: new Date()
    };
    
    this.updateConfiguration();
    this.loadSessionState();
    this.loadBackups();
    
    const config = vscode.workspace.getConfiguration('scratchSpace');
    const sessionRecoveryEnabled = config.get<boolean>('sessionRecoveryEnabled', true);
    
    if (sessionRecoveryEnabled) {
      this.startBackupInterval();
    }
  }

  private updateConfiguration(): void {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    this.backupIntervalMs = (config.get<number>('autoBackupInterval') || 30) * 1000;
    this.maxBackups = config.get<number>('maxBackups') || 50;
  }

  private async ensureStorageExists(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storageUri);
    } catch {
      await vscode.workspace.fs.createDirectory(this.storageUri);
    }
  }

  private async loadSessionState(): Promise<void> {
    try {
      await this.ensureStorageExists();
      const content = await vscode.workspace.fs.readFile(this.sessionStateFile);
      const loadedState = JSON.parse(content.toString());
      
      // Convert timestamp back to Date
      loadedState.timestamp = new Date(loadedState.timestamp);
      
      this.sessionState = loadedState;
    } catch (error) {
      console.log('No previous session state found or error loading:', error);
    }
  }

  private async saveSessionState(): Promise<void> {
    try {
      await this.ensureStorageExists();
      this.sessionState.timestamp = new Date();
      const content = JSON.stringify(this.sessionState, null, 2);
      await vscode.workspace.fs.writeFile(this.sessionStateFile, Buffer.from(content));
    } catch (error) {
      console.error('Error saving session state:', error);
    }
  }

  private async loadBackups(): Promise<void> {
    try {
      await this.ensureStorageExists();
      const backupFile = vscode.Uri.joinPath(this.storageUri, 'backups.json');
      const content = await vscode.workspace.fs.readFile(backupFile);
      const backups: BackupEntry[] = JSON.parse(content.toString());
      
      // Convert timestamps back to Date objects
      backups.forEach(backup => {
        backup.timestamp = new Date(backup.timestamp);
      });
      
      this.backupEntries.clear();
      backups.forEach(backup => {
        this.backupEntries.set(backup.scratchpadId, backup);
      });
    } catch (error) {
      console.log('No previous backups found or error loading:', error);
    }
  }

  private async saveBackups(): Promise<void> {
    try {
      await this.ensureStorageExists();
      const backupFile = vscode.Uri.joinPath(this.storageUri, 'backups.json');
      const backups = Array.from(this.backupEntries.values());
      
      // Clean up old backups
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep backups for 7 days
      
      const filteredBackups = backups
        .filter(backup => backup.timestamp > cutoffDate)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxBackups);
      
      const content = JSON.stringify(filteredBackups, null, 2);
      await vscode.workspace.fs.writeFile(backupFile, Buffer.from(content));
    } catch (error) {
      console.error('Error saving backups:', error);
    }
  }

  private startBackupInterval(): void {
    this.backupInterval = setInterval(async () => {
      await this.createAutoBackup();
    }, this.backupIntervalMs);
  }

  private async createAutoBackup(): Promise<void> {
    try {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || !activeEditor.document.uri.scheme.startsWith('scratchpad')) {
        return;
      }

      const scratchpadId = this.extractScratchpadId(activeEditor.document.uri);
      if (!scratchpadId) {
        return;
      }

      const content = activeEditor.document.getText();
      const backup: BackupEntry = {
        scratchpadId,
        content,
        timestamp: new Date(),
        autoBackup: true
      };

      this.backupEntries.set(scratchpadId, backup);
      await this.saveBackups();
    } catch (error) {
      console.error('Error creating auto backup:', error);
    }
  }

  public async createManualBackup(scratchpadId: string, content: string): Promise<void> {
    const backup: BackupEntry = {
      scratchpadId,
      content,
      timestamp: new Date(),
      autoBackup: false
    };

    this.backupEntries.set(scratchpadId, backup);
    await this.saveBackups();
  }

  public async updateSessionState(
    activeScratchpadId?: string,
    openScratchpadIds?: string[],
    viewState?: SessionState['viewState']
  ): Promise<void> {
    if (activeScratchpadId !== undefined) {
      this.sessionState.activeScratchpadId = activeScratchpadId;
    }
    
    if (openScratchpadIds !== undefined) {
      this.sessionState.openScratchpadIds = openScratchpadIds;
    }
    
    if (viewState !== undefined) {
      this.sessionState.viewState = { ...this.sessionState.viewState, ...viewState };
    }
    
    await this.saveSessionState();
  }

  public async saveEditorState(scratchpadId: string, editor: vscode.TextEditor): Promise<void> {
    this.sessionState.viewState[scratchpadId] = {
      selection: editor.selection,
      visibleRanges: [...editor.visibleRanges],
      scrollTop: editor.viewColumn || 0
    };
    
    await this.saveSessionState();
  }

  public getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  public getBackups(): BackupEntry[] {
    return Array.from(this.backupEntries.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getBackupForScratchpad(scratchpadId: string): BackupEntry | undefined {
    return this.backupEntries.get(scratchpadId);
  }

  public async restoreFromBackup(scratchpadId: string): Promise<string | null> {
    const backup = this.backupEntries.get(scratchpadId);
    if (!backup) {
      return null;
    }
    
    return backup.content;
  }

  public async checkForCrashRecovery(): Promise<boolean> {
    // Check if VS Code was closed unexpectedly by comparing session timestamps
    const now = new Date();
    const timeSinceLastSession = now.getTime() - this.sessionState.timestamp.getTime();
    
    // If more than 5 minutes have passed, consider it a potential crash
    const potentialCrash = timeSinceLastSession > 300000;
    
    if (potentialCrash && this.sessionState.openScratchpadIds.length > 0) {
      return true;
    }
    
    return false;
  }

  public async showRecoveryDialog(): Promise<boolean> {
    const choice = await vscode.window.showInformationMessage(
      'VS Code was closed unexpectedly. Would you like to restore your scratchpad session?',
      { modal: true },
      'Restore Session',
      'Start Fresh'
    );
    
    return choice === 'Restore Session';
  }

  public async restoreSession(): Promise<{
    activeScratchpadId?: string;
    openScratchpadIds: string[];
    viewState: SessionState['viewState'];
  }> {
    return {
      activeScratchpadId: this.sessionState.activeScratchpadId,
      openScratchpadIds: this.sessionState.openScratchpadIds,
      viewState: this.sessionState.viewState
    };
  }

  public async clearSession(): Promise<void> {
    this.sessionState = {
      openScratchpadIds: [],
      viewState: {},
      timestamp: new Date()
    };
    
    await this.saveSessionState();
  }

  public async clearBackups(): Promise<void> {
    this.backupEntries.clear();
    try {
      const backupFile = vscode.Uri.joinPath(this.storageUri, 'backups.json');
      await vscode.workspace.fs.delete(backupFile);
    } catch (error) {
      console.error('Error clearing backups:', error);
    }
  }

  private extractScratchpadId(uri: vscode.Uri): string | null {
    // Extract scratchpad ID from URI
    // Assuming URI format: scratchpad:///scratchpad-id
    const path = uri.path;
    if (path.startsWith('/')) {
      return path.substring(1);
    }
    return path;
  }

  public dispose(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
