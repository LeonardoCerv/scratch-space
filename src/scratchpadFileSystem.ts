import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';

export class ScratchpadFileSystemProvider implements vscode.FileSystemProvider {
  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  constructor(private scratchpadManager: ScratchpadManager) {
    // Listen for changes to scratchpads
    this.scratchpadManager.onDidChange(() => {
      // We could emit more specific change events here if needed
    });
  }

  watch(uri: vscode.Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
    // For simplicity, we don't implement watching
    return new vscode.Disposable(() => {});
  }

  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    const id = this.extractIdFromUri(uri);
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    
    if (!scratchpad) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return {
      type: vscode.FileType.File,
      ctime: scratchpad.createdAt.getTime(),
      mtime: scratchpad.updatedAt.getTime(),
      size: Buffer.byteLength(scratchpad.content, 'utf8')
    };
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    // We don't support directory listing for scratchpads
    throw vscode.FileSystemError.FileNotADirectory(uri);
  }

  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    throw vscode.FileSystemError.NoPermissions('Cannot create directories in scratchpad filesystem');
  }

  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    const id = this.extractIdFromUri(uri);
    const scratchpad = this.scratchpadManager.getScratchpad(id);
    
    if (!scratchpad) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return Buffer.from(scratchpad.content, 'utf8');
  }

  writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): void | Thenable<void> {
    const id = this.extractIdFromUri(uri);
    const contentString = Buffer.from(content).toString('utf8');
    
    // Update the scratchpad content
    return this.scratchpadManager.updateScratchpad(id, { content: contentString });
  }

  delete(uri: vscode.Uri, options: { readonly recursive: boolean; }): void | Thenable<void> {
    const id = this.extractIdFromUri(uri);
    return this.scratchpadManager.deleteScratchpad(id);
  }

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
    // We don't support renaming through the file system
    throw vscode.FileSystemError.NoPermissions('Use the rename command instead');
  }

  private extractIdFromUri(uri: vscode.Uri): string {
    // Extract scratchpad ID from URI path
    // URI format: scratchpad:///<id>/<name>
    const pathParts = uri.path.split('/');
    if (pathParts.length < 2) {
      throw new Error('Invalid scratchpad URI format');
    }
    return pathParts[1];
  }

  public static createUri(id: string, name: string): vscode.Uri {
    // Create a scratchpad URI with a clean filename
    const cleanName = name.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim() || 'scratchpad';
    return vscode.Uri.parse(`scratchpad:///${id}/${cleanName}.txt`);
  }
}
