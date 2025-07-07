import * as assert from 'assert';
import * as vscode from 'vscode';
import { ScratchpadManager } from '../scratchpadManager';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('ScratchpadManager creates scratchpad', async () => {
		// Create a mock extension context
		const mockContext = {
			globalStorageUri: vscode.Uri.parse('test://storage'),
			subscriptions: [],
			globalState: {
				get: () => undefined,
				update: () => Promise.resolve()
			}
		} as any;

		const manager = new ScratchpadManager(mockContext);
		const scratchpad = await manager.createScratchpad('Test Pad', 'javascript');
		
		assert.strictEqual(scratchpad.name, 'Test Pad');
		assert.strictEqual(scratchpad.language, 'javascript');
		assert.strictEqual(scratchpad.content, '');
		assert.ok(scratchpad.id);
		assert.ok(scratchpad.createdAt);
		assert.ok(scratchpad.updatedAt);
		
		manager.dispose();
	});

	test('ScratchpadManager updates content', async () => {
		const mockContext = {
			globalStorageUri: vscode.Uri.parse('test://storage'),
			subscriptions: [],
			globalState: {
				get: () => undefined,
				update: () => Promise.resolve()
			}
		} as any;

		const manager = new ScratchpadManager(mockContext);
		const scratchpad = await manager.createScratchpad('Test Pad');
		
		await manager.updateScratchpad(scratchpad.id, { content: 'Hello World' });
		
		const updated = manager.getScratchpad(scratchpad.id);
		assert.strictEqual(updated?.content, 'Hello World');
		
		manager.dispose();
	});

	test('ScratchpadManager lists scratchpads', async () => {
		const mockContext = {
			globalStorageUri: vscode.Uri.parse('test://storage'),
			subscriptions: [],
			globalState: {
				get: () => undefined,
				update: () => Promise.resolve()
			}
		} as any;

		const manager = new ScratchpadManager(mockContext);
		
		await manager.createScratchpad('Pad 1');
		await manager.createScratchpad('Pad 2');
		
		const all = manager.getAllScratchpads();
		assert.strictEqual(all.length, 2);
		
		manager.dispose();
	});
});
