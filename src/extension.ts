// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadTreeProvider } from './scratchpadTreeProvider';
import { ScratchpadEditor } from './scratchpadEditor';

let scratchpadManager: ScratchpadManager;
let scratchpadEditor: ScratchpadEditor;
let treeDataProvider: ScratchpadTreeProvider;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Scratch Space extension is now active!');

	// Initialize the scratchpad system
	scratchpadManager = new ScratchpadManager(context);
	scratchpadEditor = new ScratchpadEditor(scratchpadManager);
	treeDataProvider = new ScratchpadTreeProvider(scratchpadManager);

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

		vscode.commands.registerCommand('scratch-space.openScratchpad', async (id: string) => {
			try {
				await scratchpadEditor.openScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to open scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.deleteScratchpad', async (id: string) => {
			try {
				await scratchpadEditor.deleteScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to delete scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.renameScratchpad', async (id: string) => {
			try {
				await scratchpadEditor.renameScratchpad(id);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to rename scratchpad: ${error}`);
			}
		}),

		vscode.commands.registerCommand('scratch-space.duplicateScratchpad', async (id: string) => {
			try {
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
