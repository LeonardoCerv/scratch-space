import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadTreeProvider } from './scratchpadTreeProvider';
import { ScratchpadEditor } from './scratchpadEditor';
import { ImportExportManager } from './importExportManager';
import { TemplateManager } from './templateManager';

let scratchpadManager: ScratchpadManager;
let scratchpadEditor: ScratchpadEditor;
let treeDataProvider: ScratchpadTreeProvider;
let importExportManager: ImportExportManager;
let templateManager: TemplateManager;

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	try {
		// Initialize the scratchpad system step by step
		scratchpadManager = new ScratchpadManager(context);
		scratchpadEditor = new ScratchpadEditor(scratchpadManager);
		treeDataProvider = new ScratchpadTreeProvider(scratchpadManager);
		importExportManager = new ImportExportManager(scratchpadManager);
		templateManager = new TemplateManager();

		// Register the tree view
		const treeView = vscode.window.createTreeView('scratchpadExplorer', {
			treeDataProvider: treeDataProvider,
			showCollapseAll: false
		});

		// Register basic commands
		const commands = [
			vscode.commands.registerCommand('scratch-space.newScratchpad', async () => {
				try {
					await scratchpadEditor.createAndOpenScratchpad();
					vscode.window.showInformationMessage('New scratchpad created!');
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to create scratchpad: ${error}`);
				}
			}),

			vscode.commands.registerCommand('scratch-space.refresh', () => {
				treeDataProvider.refresh();
			}),

			vscode.commands.registerCommand('scratch-space.openScratchpad', async (itemOrId) => {
				try {
					let scratchpadId;
					
					// Handle different ways the command can be called
					if (typeof itemOrId === 'string') {
						// Called with direct ID string
						scratchpadId = itemOrId;
					} else if (itemOrId?.scratchpad?.id) {
						// Called with a tree item
						scratchpadId = itemOrId.scratchpad.id;
					}
					
					if (scratchpadId) {
						await scratchpadEditor.openScratchpad(scratchpadId);
					} else {
						console.error('Invalid scratchpad ID or item provided');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to open scratchpad: ${error}`);
				}
			}),
			
			// Register file conversion commands
			vscode.commands.registerCommand('scratch-space.convertFileToScratchpad', async (fileUri) => {
				await importExportManager.convertFileToScratchpad(fileUri);
			}),
			
			vscode.commands.registerCommand('scratch-space.convertScratchpadToFile', async (scratchpadId) => {
				if (typeof scratchpadId === 'object' && scratchpadId?.scratchpad?.id) {
					// If command is triggered from tree view item
					await importExportManager.convertScratchpadToFile(scratchpadId.scratchpad.id);
				} else {
					// If command is triggered with direct scratchpad id
					await importExportManager.convertScratchpadToFile(scratchpadId);
				}
			}),
			
			// Register template commands
			vscode.commands.registerCommand('scratch-space.showTemplates', async () => {
				try {
					// Get all templates
					const allTemplates = templateManager.getAllTemplates();
					if (allTemplates.length === 0) {
						vscode.window.showInformationMessage('No templates available.');
						return;
					}
					
					// Create template items for quick pick
					const templateItems = allTemplates.map(template => ({
						label: template.name,
						description: template.language,
						detail: template.description,
						template: template
					}));
					
					// Show quick pick
					const selectedItem = await vscode.window.showQuickPick(templateItems, {
						placeHolder: 'Select a template to apply'
					});
					
					if (selectedItem) {
						// Create a new scratchpad with the template content
						const scratchpad = await scratchpadManager.createScratchpad(
							selectedItem.template.name,
							selectedItem.template.language
						);
						
						// Update the content with the template content
						await scratchpadManager.updateScratchpad(scratchpad.id, { content: selectedItem.template.content });
						
						// Open the new scratchpad
						await scratchpadEditor.openScratchpad(scratchpad.id);
						vscode.window.showInformationMessage(`Template "${selectedItem.label}" applied.`);
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to show templates: ${error}`);
				}
			}),
			
			// Register showHistory command
			vscode.commands.registerCommand('scratch-space.showHistory', async () => {
				try {
					const historyManager = scratchpadManager.getHistoryManager();
					const allHistory = historyManager.getAllHistory();
					
					if (allHistory.length === 0) {
						vscode.window.showInformationMessage('No history entries available.');
						return;
					}
					
					const historyItems = allHistory.map(entry => {
						const scratchpad = scratchpadManager.getScratchpad(entry.scratchpadId);
						const scratchpadName = scratchpad ? scratchpad.name : '[Deleted Scratchpad]';
						const time = entry.timestamp.toLocaleString();
						
						let description = '';
						switch (entry.changeType) {
							case 'create':
								description = 'Created';
								break;
							case 'update':
								description = 'Updated';
								break;
							case 'delete':
								description = 'Deleted';
								break;
							case 'rename':
								description = `Renamed: ${entry.metadata?.oldValue} → ${entry.metadata?.newValue}`;
								break;
							case 'language-change':
								description = `Language: ${entry.metadata?.oldValue} → ${entry.metadata?.newValue}`;
								break;
						}
						
						return {
							label: `${scratchpadName} (${time})`,
							description: description,
							detail: entry.metadata?.description || `Content length: ${entry.content.length} characters`,
							entry: entry
						};
					});
					
					const selectedItem = await vscode.window.showQuickPick(historyItems, {
						placeHolder: 'Select a history entry to view'
					});
					
					if (selectedItem && selectedItem.entry) {
						// Show history entry
						const doc = await vscode.workspace.openTextDocument({
							content: selectedItem.entry.content,
							language: scratchpadManager.getScratchpad(selectedItem.entry.scratchpadId)?.language || 'plaintext'
						});
						await vscode.window.showTextDocument(doc);
						
						// Ask if user wants to restore this version
						const action = await vscode.window.showInformationMessage(
							'Viewing history entry. Would you like to restore this version?',
							'Restore to New Scratchpad',
							'Cancel'
						);
						
						if (action === 'Restore to New Scratchpad') {
							const scratchpad = await scratchpadManager.createScratchpad(
								`Restored from History (${new Date().toLocaleTimeString()})`,
								doc.languageId
							);
							await scratchpadManager.updateScratchpad(scratchpad.id, {
								content: selectedItem.entry.content
							});
							await scratchpadEditor.openScratchpad(scratchpad.id);
						}
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to show history: ${error}`);
				}
			}),
			
			// Register clearAllScratchpads command
			vscode.commands.registerCommand('scratch-space.clearAllScratchpads', async () => {
				try {
					const confirmation = await vscode.window.showWarningMessage(
						'Are you sure you want to delete all scratchpads? This cannot be undone.',
						{ modal: true },
						'Delete All',
						'Cancel'
					);
					
					if (confirmation === 'Delete All') {
						await scratchpadManager.clearAllScratchpads();
						vscode.window.showInformationMessage('All scratchpads have been deleted.');
						treeDataProvider.refresh();
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to clear scratchpads: ${error}`);
				}
			}),
			
			// Register importFromClipboard command
			vscode.commands.registerCommand('scratch-space.importFromClipboard', async () => {
				try {
					await importExportManager.importFromClipboard();
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to import from clipboard: ${error}`);
				}
			}),
			
			// Register renameScratchpad command
			vscode.commands.registerCommand('scratch-space.renameScratchpad', async (item) => {
				try {
					let scratchpadId;
					if (typeof item === 'string') {
						scratchpadId = item;
					} else if (item?.scratchpad?.id) {
						scratchpadId = item.scratchpad.id;
					}
					
					if (scratchpadId) {
						await scratchpadEditor.renameScratchpad(scratchpadId);
					} else {
						console.error('Invalid scratchpad ID or item provided');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to rename scratchpad: ${error}`);
				}
			}),
			
			// Register deleteScratchpad command
			vscode.commands.registerCommand('scratch-space.deleteScratchpad', async (item) => {
				try {
					let scratchpadId;
					if (typeof item === 'string') {
						scratchpadId = item;
					} else if (item?.scratchpad?.id) {
						scratchpadId = item.scratchpad.id;
					}
					
					if (scratchpadId) {
						await scratchpadEditor.deleteScratchpad(scratchpadId);
					} else {
						console.error('Invalid scratchpad ID or item provided');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to delete scratchpad: ${error}`);
				}
			}),
			
			// Register duplicateScratchpad command
			vscode.commands.registerCommand('scratch-space.duplicateScratchpad', async (item) => {
				try {
					let scratchpadId;
					if (typeof item === 'string') {
						scratchpadId = item;
					} else if (item?.scratchpad?.id) {
						scratchpadId = item.scratchpad.id;
					}
					
					if (scratchpadId) {
						await scratchpadEditor.duplicateScratchpad(scratchpadId);
					} else {
						console.error('Invalid scratchpad ID or item provided');
					}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to duplicate scratchpad: ${error}`);
				}
			})
		];

		// Add all commands to subscriptions
		commands.forEach(command => context.subscriptions.push(command));

		// Add other disposables
		context.subscriptions.push(treeView, scratchpadManager, scratchpadEditor, importExportManager, templateManager);

	} catch (error) {
		console.error('Error activating Scratch Space extension:', error);
		vscode.window.showErrorMessage(`Failed to activate Scratch Space: ${error}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	// Clean up resources if needed
}
