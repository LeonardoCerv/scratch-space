import * as vscode from 'vscode';
import { ScratchpadManager } from './scratchpadManager';
import { ScratchpadTreeProvider } from './scratchpadTreeProvider';
import { ScratchpadFilter, SCRATCHPAD_COLORS } from './types';

export class ScratchpadUIManager {
  private currentFilter: ScratchpadFilter = { sortBy: 'custom', sortOrder: 'asc' };
  private groupByTags: boolean = false;

  constructor(
    private scratchpadManager: ScratchpadManager,
    private treeProvider: ScratchpadTreeProvider,
    private context: vscode.ExtensionContext
  ) {}

  public async togglePin(scratchpadId: string): Promise<void> {
    try {
      await this.scratchpadManager.togglePin(scratchpadId);
      vscode.window.showInformationMessage('Pin status updated');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to toggle pin: ${error}`);
    }
  }

  public async addTag(scratchpadId: string): Promise<void> {
    try {
      const existingTags = this.scratchpadManager.getAllTags();
      const tag = await vscode.window.showInputBox({
        prompt: 'Enter tag name',
        placeHolder: 'e.g., todo, experiment, important',
        validateInput: (value) => {
          if (!value || value.trim() === '') {
            return 'Tag name cannot be empty';
          }
          if (value.includes(' ')) {
            return 'Tag name cannot contain spaces';
          }
          return null;
        }
      });

      if (tag) {
        await this.scratchpadManager.addTag(scratchpadId, tag.trim());
        vscode.window.showInformationMessage(`Added tag: ${tag}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add tag: ${error}`);
    }
  }

  public async removeTag(scratchpadId: string): Promise<void> {
    try {
      const scratchpad = this.scratchpadManager.getScratchpad(scratchpadId);
      if (!scratchpad || scratchpad.tags.length === 0) {
        vscode.window.showInformationMessage('No tags to remove');
        return;
      }

      const items = scratchpad.tags.map(tag => ({
        label: tag,
        description: `Remove tag: ${tag}`
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select tag to remove'
      });

      if (selected) {
        await this.scratchpadManager.removeTag(scratchpadId, selected.label);
        vscode.window.showInformationMessage(`Removed tag: ${selected.label}`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to remove tag: ${error}`);
    }
  }

  public async setColor(scratchpadId: string): Promise<void> {
    try {
      const colorItems = [
        ...SCRATCHPAD_COLORS.map(color => ({
          label: `$(circle-filled)`,
          description: color,
          color: color
        })),
        {
          label: '$(x)',
          description: 'Remove color',
          color: '' as any
        }
      ];

      const selected = await vscode.window.showQuickPick(colorItems, {
        placeHolder: 'Select color for scratchpad'
      });

      if (selected) {
        await this.scratchpadManager.setColor(scratchpadId, selected.color || '');
        vscode.window.showInformationMessage(
          selected.color ? `Color set to ${selected.color}` : 'Color removed'
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to set color: ${error}`);
    }
  }

  public async filterByTag(): Promise<void> {
    try {
      const allTags = this.scratchpadManager.getAllTags();
      
      if (allTags.length === 0) {
        vscode.window.showInformationMessage('No tags available');
        return;
      }

      const items = [
        {
          label: '$(x) Clear Filter',
          description: 'Show all scratchpads',
          tag: null
        },
        ...allTags.map(tag => ({
          label: `$(tag) ${tag}`,
          description: `Filter by tag: ${tag}`,
          tag: tag
        }))
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select tag to filter by'
      });

      if (selected !== undefined) {
        this.currentFilter.tags = selected.tag ? [selected.tag] : undefined;
        this.treeProvider.setFilter(this.currentFilter);
        
        vscode.window.showInformationMessage(
          selected.tag ? `Filtered by tag: ${selected.tag}` : 'Filter cleared'
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to filter by tag: ${error}`);
    }
  }

  public async toggleGroupByTags(): Promise<void> {
    this.groupByTags = !this.groupByTags;
    this.treeProvider.setGroupByTags(this.groupByTags);
    vscode.window.showInformationMessage(
      `Group by tags: ${this.groupByTags ? 'enabled' : 'disabled'}`
    );
  }

  public async sortScratchpads(): Promise<void> {
    try {
      const sortOptions = [
        {
          label: '$(symbol-text) Name',
          description: 'Sort by name',
          sortBy: 'name' as const
        },
        {
          label: '$(clock) Created',
          description: 'Sort by creation date',
          sortBy: 'created' as const
        },
        {
          label: '$(clock) Updated',
          description: 'Sort by last update',
          sortBy: 'updated' as const
        },
        {
          label: '$(list-ordered) Custom',
          description: 'Sort by custom order',
          sortBy: 'custom' as const
        }
      ];

      const selected = await vscode.window.showQuickPick(sortOptions, {
        placeHolder: 'Select sorting method'
      });

      if (selected) {
        // Ask for sort order
        const orderOptions = [
          {
            label: '$(arrow-up) Ascending',
            description: 'Sort in ascending order',
            sortOrder: 'asc' as const
          },
          {
            label: '$(arrow-down) Descending',
            description: 'Sort in descending order',
            sortOrder: 'desc' as const
          }
        ];

        const orderSelected = await vscode.window.showQuickPick(orderOptions, {
          placeHolder: 'Select sort order'
        });

        if (orderSelected) {
          this.currentFilter.sortBy = selected.sortBy;
          this.currentFilter.sortOrder = orderSelected.sortOrder;
          this.treeProvider.setFilter(this.currentFilter);
          
          vscode.window.showInformationMessage(
            `Sorted by ${selected.sortBy} (${orderSelected.sortOrder})`
          );
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to sort scratchpads: ${error}`);
    }
  }

  public async showTagManager(): Promise<void> {
    try {
      const allTags = this.scratchpadManager.getAllTags();
      
      if (allTags.length === 0) {
        vscode.window.showInformationMessage('No tags available');
        return;
      }

      const items = allTags.map(tag => {
        const count = this.scratchpadManager.getFilteredScratchpads({ tags: [tag] }).length;
        return {
          label: `$(tag) ${tag}`,
          description: `${count} scratchpad${count === 1 ? '' : 's'}`,
          tag: tag
        };
      });

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select tag to manage'
      });

      if (selected) {
        await this.manageTag(selected.tag);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to show tag manager: ${error}`);
    }
  }

  private async manageTag(tagName: string): Promise<void> {
    const actions = [
      {
        label: '$(filter) Filter by this tag',
        description: 'Show only scratchpads with this tag',
        action: 'filter'
      },
      {
        label: '$(x) Delete this tag',
        description: 'Remove this tag from all scratchpads',
        action: 'delete'
      }
    ];

    const selected = await vscode.window.showQuickPick(actions, {
      placeHolder: `Manage tag: ${tagName}`
    });

    if (selected?.action === 'filter') {
      this.currentFilter.tags = [tagName];
      this.treeProvider.setFilter(this.currentFilter);
      vscode.window.showInformationMessage(`Filtered by tag: ${tagName}`);
    } else if (selected?.action === 'delete') {
      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the tag "${tagName}" from all scratchpads?`,
        { modal: true },
        'Yes',
        'No'
      );

      if (confirm === 'Yes') {
        await this.deleteTag(tagName);
      }
    }
  }

  private async deleteTag(tagName: string): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getFilteredScratchpads({ tags: [tagName] });
      
      for (const scratchpad of scratchpads) {
        await this.scratchpadManager.removeTag(scratchpad.id, tagName);
      }

      vscode.window.showInformationMessage(`Deleted tag: ${tagName}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete tag: ${error}`);
    }
  }

  public async bulkTagOperation(): Promise<void> {
    try {
      const scratchpads = this.scratchpadManager.getAllScratchpads();
      
      if (scratchpads.length === 0) {
        vscode.window.showInformationMessage('No scratchpads available');
        return;
      }

      const items = scratchpads.map(sp => ({
        label: sp.name,
        description: `${sp.language} • Tags: ${sp.tags.join(', ') || 'none'}`,
        picked: false,
        scratchpad: sp
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select scratchpads for bulk tag operation',
        canPickMany: true
      });

      if (selected && selected.length > 0) {
        await this.performBulkTagOperation(selected.map(item => item.scratchpad));
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to perform bulk tag operation: ${error}`);
    }
  }

  private async performBulkTagOperation(scratchpads: any[]): Promise<void> {
    const actions = [
      {
        label: '$(add) Add tag to all',
        description: 'Add a tag to all selected scratchpads',
        action: 'add'
      },
      {
        label: '$(remove) Remove tag from all',
        description: 'Remove a tag from all selected scratchpads',
        action: 'remove'
      }
    ];

    const selected = await vscode.window.showQuickPick(actions, {
      placeHolder: `Bulk operation for ${scratchpads.length} scratchpads`
    });

    if (selected?.action === 'add') {
      const tag = await vscode.window.showInputBox({
        prompt: 'Enter tag name to add',
        placeHolder: 'e.g., todo, experiment, important'
      });

      if (tag) {
        for (const scratchpad of scratchpads) {
          await this.scratchpadManager.addTag(scratchpad.id, tag.trim());
        }
        vscode.window.showInformationMessage(`Added tag "${tag}" to ${scratchpads.length} scratchpads`);
      }
    } else if (selected?.action === 'remove') {
      const allTags = this.scratchpadManager.getAllTags();
      
      if (allTags.length === 0) {
        vscode.window.showInformationMessage('No tags available');
        return;
      }

      const tagToRemove = await vscode.window.showQuickPick(allTags, {
        placeHolder: 'Select tag to remove'
      });

      if (tagToRemove) {
        for (const scratchpad of scratchpads) {
          await this.scratchpadManager.removeTag(scratchpad.id, tagToRemove);
        }
        vscode.window.showInformationMessage(`Removed tag "${tagToRemove}" from ${scratchpads.length} scratchpads`);
      }
    }
  }
}
