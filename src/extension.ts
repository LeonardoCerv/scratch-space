// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadTreeProvider } from './scratchpadTreeProvider';
import { ScratchpadEditor } from './scratchpadEditor';
import { TemplateManager } from './templateManager';
import { ImportExportManager } from './importExportManager';
import { QuickNavigationManager } from './quickNavigationManager';
import { SessionRecoveryManager } from './sessionRecoveryManager';

let scratchpadManager: ScratchpadManager;
let scratchpadEditor: ScratchpadEditor;
let treeDataProvider: ScratchpadTreeProvider;
let templateManager: TemplateManager;
let importExportManager: ImportExportManager;
let quickNavigationManager: QuickNavigationManager;
let sessionRecoveryManager: SessionRecoveryManager;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Scratch Space extension is now active!');

	// Initialize the scratchpad system
	scratchpadManager = new ScratchpadManager(context);
	scratchpadEditor = new ScratchpadEditor(scratchpadManager);
	treeDataProvider = new ScratchpadTreeProvider(scratchpadManager);
	templateManager = new TemplateManager();
	importExportManager = new ImportExportManager(scratchpadManager);
	quickNavigationManager = new QuickNavigationManager(scratchpadManager, scratchpadEditor);
	sessionRecoveryManager = new SessionRecoveryManager(context);

	// Check for crash recovery
	checkForCrashRecovery();

	// Register the tree view
	const treeView = vscode.window.createTreeView('scratchpadExplorer', {
		treeDataProvider: treeDataProvider,
		showCollapseAll: false
	});

	// Track editor state changes for session recovery
	const editorStateTracker = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		if (editor && editor.document.uri.scheme === 'scratchpad') {
			const scratchpadId = editor.document.uri.path.substring(1);
			await sessionRecoveryManager.saveEditorState(scratchpadId, editor);
		}
	});

	// Track open scratchpads for session recovery
	const documentOpenTracker = vscode.workspace.onDidOpenTextDocument(async (document) => {
		if (document.uri.scheme === 'scratchpad') {
			const scratchpadId = document.uri.path.substring(1);
			const sessionState = sessionRecoveryManager.getSessionState();
			if (!sessionState.openScratchpadIds.includes(scratchpadId)) {
				await sessionRecoveryManager.updateSessionState(
					undefined,
					[...sessionState.openScratchpadIds, scratchpadId]
				);
			}
		}
	});

	// Track document close for session recovery
	const documentCloseTracker = vscode.workspace.onDidCloseTextDocument(async (document) => {
		if (document.uri.scheme === 'scratchpad') {
			const scratchpadId = document.uri.path.substring(1);
			const sessionState = sessionRecoveryManager.getSessionState();
			const updatedOpenIds = sessionState.openScratchpadIds.filter(id => id !== scratchpadId);
			await sessionRecoveryManager.updateSessionState(undefined, updatedOpenIds);
		}
	});

	async function checkForCrashRecovery() {
		const needsRecovery = await sessionRecoveryManager.checkForCrashRecovery();
		if (needsRecovery) {
			const shouldRestore = await sessionRecoveryManager.showRecoveryDialog();
			if (shouldRestore) {
				const sessionData = await sessionRecoveryManager.restoreSession();
				// Restore open scratchpads
				for (const scratchpadId of sessionData.openScratchpadIds) {
					try {
						await scratchpadEditor.openScratchpad(scratchpadId);
					} catch (error) {
						console.error(`Failed to restore scratchpad ${scratchpadId}:`, error);
					}
				}
				// Set active scratchpad
				if (sessionData.activeScratchpadId) {
					try {
						await scratchpadEditor.openScratchpad(sessionData.activeScratchpadId);
					} catch (error) {
						console.error(`Failed to restore active scratchpad:`, error);
					}
				}
			} else {
				await sessionRecoveryManager.clearSession();
			}
		}
	}

	// Register commands
	const commands = [
		vscode.commands.registerCommand('scratch-space.newScratchpad', async () => {
			try {
				// Ask user for language (optional)
				const languages = [
					'plaintext', 'javascript', 'typescript', 'python', 'html', 'css', 
					'json', 'markdown', 'xml', 'yaml', 'sql', 'shell', 'powershell',
					'java', 'csharp', 'cpp', 'c', 'php', 'ruby', 'go', 'rust'
				];
				
				const selectedLanguage = await vscode.window.showQuickPick(languages, {
					placeHolder: 'Select language for the new scratchpad (optional)',
					canPickMany: false
				});

				await scratchpadEditor.createAndOpenScratchpad(undefined, selectedLanguage);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to create scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.newScratchpadWithTemplate', async () => {
			try {
				// Show template selection
				const templates = templateManager.getAllTemplates();
				const templateItems = templates.map(template => ({
					label: template.name,
					description: template.language,
					detail: template.description,
					template: template
				}));

				const config = vscode.workspace.getConfiguration('scratchSpace');
				const showPreview = config.get<boolean>('showTemplatePreview');

				const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
					placeHolder: 'Select a template for the new scratchpad',
					matchOnDescription: true,
					matchOnDetail: true
				});

				if (selectedTemplate) {
					const template = selectedTemplate.template;
					const scratchpad = await scratchpadManager.createScratchpad(
						`${template.name} Scratchpad`,
						template.language
					);
					
					// Update with template content
					await scratchpadManager.updateScratchpad(scratchpad.id, {
						content: template.content
					});
					
					await scratchpadEditor.openScratchpad(scratchpad.id);
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to create scratchpad from template: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.showTemplates', async () => {
			try {
				const templates = templateManager.getAllTemplates();
				const categories = templateManager.getAvailableCategories();
				
				// First, let user choose category or view all
				const categoryItems = [
					{ label: 'All Templates', description: `${templates.length} templates` },
					...categories.map(cat => ({
						label: cat,
						description: `${templateManager.getTemplatesByCategory(cat).length} templates`
					}))
				];

				const selectedCategory = await vscode.window.showQuickPick(categoryItems, {
					placeHolder: 'Select a category to browse templates'
				});

				if (selectedCategory) {
					const templatesToShow = selectedCategory.label === 'All Templates' 
						? templates 
						: templateManager.getTemplatesByCategory(selectedCategory.label);
					
					const templateItems = templatesToShow.map(template => ({
						label: template.name,
						description: template.language,
						detail: template.description,
						template: template
					}));

					const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
						placeHolder: 'Select a template to use',
						matchOnDescription: true,
						matchOnDetail: true
					});

					if (selectedTemplate) {
						const template = selectedTemplate.template;
						const scratchpad = await scratchpadManager.createScratchpad(
							`${template.name} Scratchpad`,
							template.language
						);
						
						await scratchpadManager.updateScratchpad(scratchpad.id, {
							content: template.content
						});
						
						await scratchpadEditor.openScratchpad(scratchpad.id);
					}
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to browse templates: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.openScratchpad', async (item: any) => {
			try {
				console.log('openScratchpad called with:', item);
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				console.log('Extracted ID:', id);
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await scratchpadEditor.openScratchpad(id);
			} catch (error) {
				console.error('Error in openScratchpad:', error);
				vscode.window.showErrorMessage(`Failed to open scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.changeLanguage', async (item: any) => {
			try {
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await scratchpadEditor.changeLanguage(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to change language: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.deleteScratchpad', async (item: any) => {
			try {
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await scratchpadEditor.deleteScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to delete scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.renameScratchpad', async (item: any) => {
			try {
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await scratchpadEditor.renameScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to rename scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.duplicateScratchpad', async (item: any) => {
			try {
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await scratchpadEditor.duplicateScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to duplicate scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.clearAllScratchpads', async () => {
			try {
				const confirm = await vscode.window.showWarningMessage(
					'Are you sure you want to delete ALL scratchpads? This action cannot be undone.',
					{ modal: true },
					'Delete All'
				);

				if (confirm === 'Delete All') {
					await scratchpadManager.clearAllScratchpads();
					vscode.window.showInformationMessage('All scratchpads have been deleted');
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to clear scratchpads: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.refresh', () => {
			treeDataProvider.refresh();
		}),

		// Import/Export commands
		vscode.commands.registerCommand('scratch-space.convertScratchpadToFile', async (item: any) => {
			try {
				console.log('convertScratchpadToFile called with:', item);
				const id = typeof item === 'string' ? item : item?.scratchpad?.id || item?.id;
				console.log('Extracted ID:', id);
				if (!id) {
					vscode.window.showErrorMessage('No scratchpad ID provided');
					return;
				}
				await importExportManager.convertScratchpadToFile(id);
			} catch (error) {
				console.error('Error in convertScratchpadToFile:', error);
				vscode.window.showErrorMessage(`Failed to convert scratchpad to file: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.convertFileToScratchpad', async (fileUri: vscode.Uri) => {
			try {
				await importExportManager.convertFileToScratchpad(fileUri);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to convert file to scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.importFromClipboard', async () => {
			try {
				await importExportManager.importFromClipboard();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to import from clipboard: ${error}`);
			}
		}),

		// Quick navigation commands
		vscode.commands.registerCommand('scratch-space.quickOpen', async () => {
			try {
				await quickNavigationManager.quickOpenScratchpad();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to quick open: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.switchScratchpad', async () => {
			try {
				await quickNavigationManager.switchScratchpad();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to switch scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.scratchpadPalette', async () => {
			try {
				await quickNavigationManager.showScratchpadPalette();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to show palette: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.searchScratchpads', async () => {
			try {
				await quickNavigationManager.searchScratchpads();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to search scratchpads: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.showHistory', async () => {
			try {
				const historyManager = scratchpadManager.getHistoryManager();
				const scratchpads = scratchpadManager.getAllScratchpads();
				
				// First, let user choose scratchpad or view all history
				const options = [
					{ label: 'All Scratchpads', description: 'View complete history' },
					...scratchpads.map(sp => ({
						label: sp.name,
						description: `History for ${sp.name}`,
						scratchpadId: sp.id
					}))
				];

				const selected = await vscode.window.showQuickPick(options, {
					placeHolder: 'Select scratchpad to view history'
				});

				if (selected) {
					const scratchpadId = 'scratchpadId' in selected ? selected.scratchpadId : undefined;
					const history = scratchpadId 
						? historyManager.getHistory(scratchpadId)
						: historyManager.getAllHistory();

					if (history.length === 0) {
						vscode.window.showInformationMessage('No history found');
						return;
					}

					const historyItems = history.map(entry => ({
						label: `${entry.changeType.charAt(0).toUpperCase() + entry.changeType.slice(1)}`,
						description: new Date(entry.timestamp).toLocaleString(),
						detail: entry.metadata?.description || entry.content.substring(0, 100) + '...',
						entry: entry
					}));

					const selectedEntry = await vscode.window.showQuickPick(historyItems, {
						placeHolder: 'Select history entry to view or restore',
						matchOnDetail: true
					});

					if (selectedEntry) {
						const action = await vscode.window.showQuickPick([
							{ label: 'View Content', description: 'View the content at this point in time' },
							{ label: 'Restore Content', description: 'Restore scratchpad to this content' }
						], {
							placeHolder: 'What would you like to do?'
						});

						if (action?.label === 'View Content') {
							const doc = await vscode.workspace.openTextDocument({
								content: selectedEntry.entry.content,
								language: scratchpadManager.getScratchpad(selectedEntry.entry.scratchpadId)?.language || 'plaintext'
							});
							await vscode.window.showTextDocument(doc);
						} else if (action?.label === 'Restore Content') {
							const confirm = await vscode.window.showWarningMessage(
								'This will overwrite the current content. Are you sure?',
								{ modal: true },
								'Restore'
							);
							if (confirm === 'Restore') {
								await scratchpadManager.updateScratchpad(selectedEntry.entry.scratchpadId, {
									content: selectedEntry.entry.content
								});
								vscode.window.showInformationMessage('Content restored successfully');
							}
						}
					}
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to show history: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.searchHistory', async () => {
			try {
				const historyManager = scratchpadManager.getHistoryManager();
				const query = await vscode.window.showInputBox({
					placeHolder: 'Enter search query',
					prompt: 'Search through scratchpad history'
				});

				if (query) {
					const results = await historyManager.searchHistory(query);
					if (results.length === 0) {
						vscode.window.showInformationMessage('No matching history found');
						return;
					}

					const resultItems = results.map(result => ({
						label: `${result.entry.changeType.charAt(0).toUpperCase() + result.entry.changeType.slice(1)}`,
						description: new Date(result.entry.timestamp).toLocaleString(),
						detail: result.matchingContext || result.entry.content.substring(0, 100) + '...',
						result: result
					}));

					const selectedResult = await vscode.window.showQuickPick(resultItems, {
						placeHolder: 'Select search result to view or restore',
						matchOnDetail: true
					});

					if (selectedResult) {
						const action = await vscode.window.showQuickPick([
							{ label: 'View Content', description: 'View the content at this point in time' },
							{ label: 'Restore Content', description: 'Restore scratchpad to this content' }
						], {
							placeHolder: 'What would you like to do?'
						});

						if (action?.label === 'View Content') {
							const doc = await vscode.workspace.openTextDocument({
								content: selectedResult.result.entry.content,
								language: scratchpadManager.getScratchpad(selectedResult.result.entry.scratchpadId)?.language || 'plaintext'
							});
							await vscode.window.showTextDocument(doc);
						} else if (action?.label === 'Restore Content') {
							const confirm = await vscode.window.showWarningMessage(
								'This will overwrite the current content. Are you sure?',
								{ modal: true },
								'Restore'
							);
							if (confirm === 'Restore') {
								await scratchpadManager.updateScratchpad(selectedResult.result.entry.scratchpadId, {
									content: selectedResult.result.entry.content
								});
								vscode.window.showInformationMessage('Content restored successfully');
							}
						}
					}
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to search history: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.showBackups', async () => {
			try {
				const backups = sessionRecoveryManager.getBackups();
				if (backups.length === 0) {
					vscode.window.showInformationMessage('No backups found');
					return;
				}

				const backupItems = backups.map(backup => {
					const scratchpad = scratchpadManager.getScratchpad(backup.scratchpadId);
					return {
						label: scratchpad?.name || 'Unknown Scratchpad',
						description: `${backup.autoBackup ? 'Auto' : 'Manual'} backup - ${new Date(backup.timestamp).toLocaleString()}`,
						detail: backup.content.substring(0, 100) + '...',
						backup: backup
					};
				});

				const selectedBackup = await vscode.window.showQuickPick(backupItems, {
					placeHolder: 'Select backup to restore',
					matchOnDetail: true
				});

				if (selectedBackup) {
					const action = await vscode.window.showQuickPick([
						{ label: 'View Content', description: 'View the backed up content' },
						{ label: 'Restore Content', description: 'Restore scratchpad to this backup' }
					], {
						placeHolder: 'What would you like to do?'
					});

					if (action?.label === 'View Content') {
						const doc = await vscode.workspace.openTextDocument({
							content: selectedBackup.backup.content,
							language: scratchpadManager.getScratchpad(selectedBackup.backup.scratchpadId)?.language || 'plaintext'
						});
						await vscode.window.showTextDocument(doc);
					} else if (action?.label === 'Restore Content') {
						const confirm = await vscode.window.showWarningMessage(
							'This will overwrite the current content. Are you sure?',
							{ modal: true },
							'Restore'
						);
						if (confirm === 'Restore') {
							await scratchpadManager.updateScratchpad(selectedBackup.backup.scratchpadId, {
								content: selectedBackup.backup.content
							});
							vscode.window.showInformationMessage('Content restored from backup successfully');
						}
					}
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to show backups: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.createManualBackup', async () => {
			try {
				const activeEditor = vscode.window.activeTextEditor;
				if (!activeEditor || !activeEditor.document.uri.scheme.startsWith('scratchpad')) {
					vscode.window.showErrorMessage('No active scratchpad editor found');
					return;
				}

				const scratchpadId = activeEditor.document.uri.path.substring(1);
				const content = activeEditor.document.getText();
				
				await sessionRecoveryManager.createManualBackup(scratchpadId, content);
				vscode.window.showInformationMessage('Manual backup created successfully');
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to create manual backup: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.restoreSession', async () => {
			try {
				const sessionState = sessionRecoveryManager.getSessionState();
				if (sessionState.openScratchpadIds.length === 0) {
					vscode.window.showInformationMessage('No session to restore');
					return;
				}

				const confirm = await vscode.window.showInformationMessage(
					`Restore session with ${sessionState.openScratchpadIds.length} scratchpad(s)?`,
					{ modal: true },
					'Restore'
				);

				if (confirm === 'Restore') {
					const sessionData = await sessionRecoveryManager.restoreSession();
					// Restore open scratchpads
					for (const scratchpadId of sessionData.openScratchpadIds) {
						try {
							await scratchpadEditor.openScratchpad(scratchpadId);
						} catch (error) {
							console.error(`Failed to restore scratchpad ${scratchpadId}:`, error);
						}
					}
					vscode.window.showInformationMessage('Session restored successfully');
				}
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to restore session: ${error}`);
			}
		})
	];

	// Add all commands to subscriptions
	commands.forEach(command => context.subscriptions.push(command));

	// Add other disposables
	context.subscriptions.push(
		treeView,
		scratchpadManager,
		scratchpadEditor,
		sessionRecoveryManager,
		editorStateTracker,
		documentOpenTracker,
		documentCloseTracker
	);

	// Show welcome message on first activation
	const hasShownWelcome = context.globalState.get<boolean>('scratchSpace.hasShownWelcome');
	if (!hasShownWelcome) {
		vscode.window.showInformationMessage(
			'Scratch Space is ready! Create your first scratchpad from the Explorer panel or Command Palette.',
			'Create Scratchpad'
		).then(selection => {
			if (selection === 'Create Scratchpad') {
				vscode.commands.executeCommand('scratch-space.newScratchpad');
			}
		});
		context.globalState.update('scratchSpace.hasShownWelcome', true);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (scratchpadManager) {
		scratchpadManager.dispose();
	}
	if (scratchpadEditor) {
		scratchpadEditor.dispose();
	}
	if (sessionRecoveryManager) {
		sessionRecoveryManager.dispose();
	}
}
