import * as vscode from 'vscode';

export interface HistoryEntry {
  id: string;
  scratchpadId: string;
  content: string;
  timestamp: Date;
  changeType: 'create' | 'update' | 'delete' | 'rename' | 'language-change';
  metadata?: {
    oldValue?: string;
    newValue?: string;
    description?: string;
  };
}

export interface HistorySearchResult {
  entry: HistoryEntry;
  relevanceScore: number;
  matchingContext: string;
}

export class HistoryManager {
  private historyEntries: Map<string, HistoryEntry[]> = new Map();
  private storageUri: vscode.Uri;
  private maxHistoryEntries: number = 100;
  private historyRetentionDays: number = 30;

  constructor(private context: vscode.ExtensionContext) {
    this.storageUri = vscode.Uri.joinPath(context.globalStorageUri, 'history');
    this.updateConfiguration();
    this.loadHistory();
  }

  private updateConfiguration(): void {
    const config = vscode.workspace.getConfiguration('scratchSpace');
    this.maxHistoryEntries = config.get<number>('maxHistoryEntries') || 100;
    this.historyRetentionDays = config.get<number>('historyRetentionDays') || 30;
  }

  private async ensureStorageExists(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storageUri);
    } catch {
      await vscode.workspace.fs.createDirectory(this.storageUri);
    }
  }

  private async loadHistory(): Promise<void> {
    try {
      await this.ensureStorageExists();
      const files = await vscode.workspace.fs.readDirectory(this.storageUri);
      
      for (const [fileName, fileType] of files) {
        if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
          const scratchpadId = fileName.replace('.json', '');
          const filePath = vscode.Uri.joinPath(this.storageUri, fileName);
          const content = await vscode.workspace.fs.readFile(filePath);
          const entries: HistoryEntry[] = JSON.parse(content.toString());
          
          // Convert timestamp strings back to Date objects
          entries.forEach(entry => {
            entry.timestamp = new Date(entry.timestamp);
          });
          
          this.historyEntries.set(scratchpadId, entries);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  private async saveHistory(scratchpadId: string): Promise<void> {
    try {
      await this.ensureStorageExists();
      const entries = this.historyEntries.get(scratchpadId) || [];
      const filePath = vscode.Uri.joinPath(this.storageUri, `${scratchpadId}.json`);
      const content = JSON.stringify(entries, null, 2);
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  public async addHistoryEntry(
    scratchpadId: string,
    content: string,
    changeType: HistoryEntry['changeType'],
    metadata?: HistoryEntry['metadata']
  ): Promise<void> {
    const entry: HistoryEntry = {
      id: this.generateId(),
      scratchpadId,
      content,
      timestamp: new Date(),
      changeType,
      metadata
    };

    let entries = this.historyEntries.get(scratchpadId) || [];
    entries.unshift(entry); // Add to beginning (most recent first)

    // Clean up old entries
    entries = this.cleanupOldEntries(entries);
    
    this.historyEntries.set(scratchpadId, entries);
    await this.saveHistory(scratchpadId);
  }

  private cleanupOldEntries(entries: HistoryEntry[]): HistoryEntry[] {
    // Remove entries older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.historyRetentionDays);
    
    let filteredEntries = entries.filter(entry => entry.timestamp > cutoffDate);
    
    // Limit to max entries
    if (filteredEntries.length > this.maxHistoryEntries) {
      filteredEntries = filteredEntries.slice(0, this.maxHistoryEntries);
    }
    
    return filteredEntries;
  }

  public getHistory(scratchpadId: string): HistoryEntry[] {
    return this.historyEntries.get(scratchpadId) || [];
  }

  public getAllHistory(): HistoryEntry[] {
    const allEntries: HistoryEntry[] = [];
    for (const entries of this.historyEntries.values()) {
      allEntries.push(...entries);
    }
    return allEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public async searchHistory(query: string, scratchpadId?: string): Promise<HistorySearchResult[]> {
    const searchEntries = scratchpadId 
      ? this.getHistory(scratchpadId)
      : this.getAllHistory();

    const results: HistorySearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const entry of searchEntries) {
      const contentLower = entry.content.toLowerCase();
      const relevanceScore = this.calculateRelevanceScore(queryLower, entry);
      
      if (relevanceScore > 0) {
        const matchingContext = this.extractMatchingContext(entry.content, queryLower);
        results.push({
          entry,
          relevanceScore,
          matchingContext
        });
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private calculateRelevanceScore(query: string, entry: HistoryEntry): number {
    let score = 0;
    const contentLower = entry.content.toLowerCase();
    
    // Exact match gets highest score
    if (contentLower.includes(query)) {
      score += 100;
    }
    
    // Word matches
    const queryWords = query.split(/\s+/).filter(word => word.length > 2);
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        score += 50;
      }
    }
    
    // Metadata matches
    if (entry.metadata?.description?.toLowerCase().includes(query)) {
      score += 30;
    }
    
    // Recent entries get bonus
    const daysSinceCreation = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) {
      score += 20;
    } else if (daysSinceCreation < 7) {
      score += 10;
    }
    
    return score;
  }

  private extractMatchingContext(content: string, query: string): string {
    const lines = content.split('\n');
    const contextLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(query)) {
        // Add context: previous line, matching line, next line
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 2);
        const context = lines.slice(start, end).join('\n');
        contextLines.push(context);
      }
    }
    
    return contextLines.join('\n...\n').substring(0, 200) + (contextLines.join('\n...\n').length > 200 ? '...' : '');
  }

  public async restoreFromHistory(entryId: string): Promise<HistoryEntry | null> {
    for (const entries of this.historyEntries.values()) {
      const entry = entries.find(e => e.id === entryId);
      if (entry) {
        return entry;
      }
    }
    return null;
  }

  public async clearHistory(scratchpadId: string): Promise<void> {
    this.historyEntries.delete(scratchpadId);
    try {
      const filePath = vscode.Uri.joinPath(this.storageUri, `${scratchpadId}.json`);
      await vscode.workspace.fs.delete(filePath);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  public async clearAllHistory(): Promise<void> {
    this.historyEntries.clear();
    try {
      const files = await vscode.workspace.fs.readDirectory(this.storageUri);
      for (const [fileName, fileType] of files) {
        if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
          const filePath = vscode.Uri.joinPath(this.storageUri, fileName);
          await vscode.workspace.fs.delete(filePath);
        }
      }
    } catch (error) {
      console.error('Error clearing all history:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public dispose(): void {
    // Clean up any resources if needed
  }
}
