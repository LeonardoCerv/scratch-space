// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadTreeProvider } from './scratchpadTreeProvider';
import { ScratchpadEditor } from './scratchpadEditor';
import { TemplateManager } from './templateManager';
import { ImportExportManager } from './importExportManager';
import { QuickNavigationManager } from './quickNavigationManager';

let scratchpadManager: ScratchpadManager;
let scratchpadEditor: ScratchpadEditor;
let treeDataProvider: ScratchpadTreeProvider;
let templateManager: TemplateManager;
let importExportManager: ImportExportManager;
let quickNavigationManager: QuickNavigationManager;

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

	// Register the tree view
	const treeView = vscode.window.createTreeView('scratchpadExplorer', {
		treeDataProvider: treeDataProvider,
		showCollapseAll: false
	});

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
		})
	];

	// Add all commands to subscriptions
	commands.forEach(command => context.subscriptions.push(command));

	// Add other disposables
	context.subscriptions.push(
		treeView,
		scratchpadManager,
		scratchpadEditor
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
}
